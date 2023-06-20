// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import {Unirep} from '@unirep/contracts/Unirep.sol';
import {VoteathonNFT} from './VoteathonNFT.sol';

// Uncomment this line to use console.log
// import 'hardhat/console.sol';

interface IVerifier {
    function verifyProof(
        uint256[6] calldata publicSignals,
        uint256[8] calldata proof
    ) external view returns (bool);
}

interface IProjectVerifier {
    function verifyProof(
        uint256[13] calldata publicSignals,
        uint256[8] calldata proof
    ) external view returns (bool);
}

enum Emoji {
    THUMBS_UP,
    THUMBS_DOWN,
    HEART,
    HEART_BROKEN
}

contract Voteathon {
    Unirep public unirep;
    IVerifier internal dataVerifier;
    IProjectVerifier internal projectVerifier;
    VoteathonNFT public nft;

    mapping(uint256 => uint256[]) public participants;
    mapping(uint256 => uint256) public counts;

    mapping(uint256 => uint256) public voted;
    mapping(uint256 => bool) claimed;

    int[] public scores;
    uint[][] public projectData;
    uint public immutable numTeams;
    int public winnerScore;
    bool foundWinner = false;

    constructor(
        Unirep _unirep,
        IVerifier _dataVerifier,
        IProjectVerifier _projectVerifier,
        VoteathonNFT _nft,
        uint48 _epochLength,
        uint8 _numTeams
    ) {
        // set unirep address
        unirep = _unirep;

        // set verifier address
        dataVerifier = _dataVerifier;

        // set verifier address
        projectVerifier = _projectVerifier;

        // set nft address
        nft = _nft;

        // sign up as an attester
        unirep.attesterSignUp(_epochLength);

        // how many numTeams
        numTeams = _numTeams;
        scores = new int[](numTeams);
        projectData = new uint[][](numTeams);
        for (uint i; i < numTeams; i++) {
            projectData[i] = new uint256[](4);
        }
    }

    // sign up users in this app
    function userSignUp(
        uint256[] memory publicSignals,
        uint256[8] memory proof
    ) public {
        unirep.userSignUp(publicSignals, proof);
    }

    function joinProject(
        uint256 projectID,
        uint256[] memory publicSignals,
        uint256[8] memory proof
    ) public {
        require(projectID < numTeams, 'Voteathon: invalid project iD');
        unirep.verifyEpochKeyProof(publicSignals, proof);
        Unirep.EpochKeySignals memory signals = unirep.decodeEpochKeySignals(
            publicSignals
        );
        require(signals.revealNonce == 1, 'Voteathon: should reveal nonce');
        require(signals.nonce == 0, 'Voteathon: invalid nonce');
        require(counts[projectID] < 10, 'Voteathon: maximum participants in a project');
        participants[projectID].push(signals.epochKey);
        // give user data if there is attestation before
        uint48 epoch = unirep.attesterCurrentEpoch(uint160(address(this)));
        require(epoch == 0, 'Voteathon: not join epoch');
        uint256[] memory data = projectData[projectID];
        for (uint256 i = 0; i < data.length; i++) {
            unirep.attest(signals.epochKey, epoch, i, data[i]);
        }
        counts[projectID] += 1;
    }

    function vote(
        uint256 projectID,
        Emoji emoji,
        uint256[13] calldata publicSignals,
        uint256[8] calldata proof
    ) public {
        require(projectID < numTeams, "projectID out of range");

        Unirep.EpochKeySignals memory signals;

        signals.epochKey = publicSignals[0];
        signals.stateTreeRoot = publicSignals[1];
        (
            signals.revealNonce,
            signals.attesterId,
            signals.epoch,
            signals.nonce
        ) = unirep.decodeEpochKeyControl(publicSignals[2]);
        
        require(signals.revealNonce == 1, "reveal nonce wrong");
        require(signals.nonce == 1, "nonce wrong");

        verifyProjectProof(publicSignals, proof);

        if (emoji == Emoji.THUMBS_UP || emoji == Emoji.THUMBS_DOWN) {
            require(voted[signals.epochKey] + 1 <= 2, 'Voteathon: invalid vote value');
            voted[signals.epochKey] += 1;
            if (emoji == Emoji.THUMBS_UP) scores[projectID] += 1;
            else if (emoji == Emoji.THUMBS_DOWN) scores[projectID] -= 1;
        } else if (emoji == Emoji.HEART || emoji == Emoji.HEART_BROKEN) {
            require(voted[signals.epochKey] + 2 <= 2, 'Voteathon: invalid vote value');
            voted[signals.epochKey] += 2;
            if (emoji == Emoji.HEART) scores[projectID] += 2;
            else if (emoji == Emoji.HEART_BROKEN) scores[projectID] -= 2;
        }
        projectData[projectID][uint(emoji)] += 1;
        
        uint[] memory members = participants[projectID];
        uint48 epoch = unirep.attesterCurrentEpoch(uint160(address(this)));
        require(epoch == 0, 'Voteathon: not voting epoch');
        for (uint256 i = 0; i < members.length; i++) {
            unirep.attest(members[i], epoch, uint(emoji), 1);
        }
    }

    function claimPrize(
        address receiver,
        uint256[6] calldata publicSignals,
        uint256[8] calldata proof
    ) public {
        uint160 attesterId = uint160(address(this));
        require(unirep.attesterCurrentEpoch(attesterId) > 0);
        require(verifyDataProof(publicSignals, proof));
        uint48 epoch = 0; // the voting epoch
        uint256 stateTreeRoot = publicSignals[0];
        unirep.attesterStateTreeRootExists(attesterId, epoch, stateTreeRoot);
        require(!claimed[publicSignals[1]], 'Already claimed');
        int score = int(publicSignals[2]) *
            1 - //thumbs up
            int(publicSignals[3]) *
            1 + //thumbs down
            int(publicSignals[4]) *
            2 - //heart
            int(publicSignals[5]) *
            2; //heart broken

        if (!foundWinner) {
            _findWinner();
        }
        require(score >= winnerScore, 'Insufficient score');
        nft.awardItem(receiver);
        claimed[publicSignals[1]] = true;
    }

    function _findWinner() internal {
        uint count = unirep.attesterMemberCount(uint160(address(this)));
        int firstHighest = -2 * int(count);
        int secondHighest = -2 * int(count);
        int thirdHighest = -2 * int(count);
        for (uint256 i = 0; i < numTeams; i++) {
            if (scores[i] > firstHighest) {
                thirdHighest = secondHighest;
                secondHighest = firstHighest;
                firstHighest = scores[i];
            } else if (scores[i] > secondHighest) {
                thirdHighest = secondHighest;
                secondHighest = scores[i];
            } else if (scores[i] > thirdHighest) {
                thirdHighest = scores[i];
            }
        }
        winnerScore = thirdHighest;
        foundWinner = true;
    }

    function verifyDataProof(
        uint256[6] calldata publicSignals,
        uint256[8] calldata proof
    ) public view returns (bool) {
        return dataVerifier.verifyProof(publicSignals, proof);
    }

    function verifyProjectProof(
        uint256[13] calldata publicSignals,
        uint256[8] calldata proof
    ) public view returns (bool) {
        return projectVerifier.verifyProof(publicSignals, proof);
    }
}
