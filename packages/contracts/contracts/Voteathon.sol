// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import {Unirep} from '@unirep/contracts/Unirep.sol';

// Uncomment this line to use console.log
// import "hardhat/console.sol";

interface IVerifier {
    function verifyProof(
        uint256[5] calldata publicSignals,
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

    mapping(uint256 => uint256[]) participants;
    mapping(uint256 => uint256) voted;
    int[] public scores;
    uint public immutable numTeams;
    int public winnerScore;
    bool foundWinner = false;

    constructor(
        Unirep _unirep,
        IVerifier _dataVerifier,
        uint48 _epochLength,
        uint8 _numTeams
    ) {
        // set unirep address
        unirep = _unirep;

        // set verifier address
        dataVerifier = _dataVerifier;

        // sign up as an attester
        unirep.attesterSignUp(_epochLength);

        // how many numTeams
        numTeams = _numTeams;
        scores = new int[](numTeams);
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
        require(projectID < numTeams);
        unirep.verifyEpochKeyProof(publicSignals, proof);
        Unirep.EpochKeySignals memory signals = unirep.decodeEpochKeySignals(
            publicSignals
        );
        require(signals.revealNonce == 1);
        require(signals.nonce == 0);
        participants[projectID].push(signals.epochKey);
    }

    function vote(
        uint256 projectID,
        Emoji emoji,
        uint256[] memory publicSignals,
        uint256[8] memory proof
    ) public {
        require(projectID < numTeams);
        unirep.verifyEpochKeyProof(publicSignals, proof);
        Unirep.EpochKeySignals memory signals = unirep.decodeEpochKeySignals(
            publicSignals
        );
        require(voted[signals.epochKey] < 2);
        require(signals.revealNonce == 1);
        require(signals.nonce == 1);
        if (emoji == Emoji.THUMBS_UP || emoji == Emoji.THUMBS_DOWN) {
            voted[signals.epochKey] += 1;
            if (emoji == Emoji.THUMBS_UP) scores[projectID] += 1;
            else if (emoji == Emoji.THUMBS_DOWN) scores[projectID] -= 1;
        } else if (emoji == Emoji.HEART || emoji == Emoji.HEART_BROKEN) {
            voted[signals.epochKey] += 2;
            if (emoji == Emoji.HEART) scores[projectID] += 2;
            else if (emoji == Emoji.HEART_BROKEN) scores[projectID] -= 2;
        }

        uint[] memory members = participants[projectID];
        uint48 epoch = unirep.attesterCurrentEpoch(uint160(address(this)));
        require(epoch == 0);
        for (uint256 i = 0; i < members.length; i++) {
            unirep.attest(members[i], epoch, uint(emoji), 1);
        }
    }

    function claim(
        // address receiver,
        uint256[5] calldata publicSignals,
        uint256[8] calldata proof
    ) public {
        uint160 attesterId = uint160(address(this));
        require(unirep.attesterCurrentEpoch(attesterId) > 0);
        verifyDataProof(publicSignals, proof);
        uint48 epoch = 0; // the voting epoch
        uint256 stateTreeRoot = publicSignals[0];
        unirep.attesterStateTreeRootExists(attesterId, epoch, stateTreeRoot);

        int score = 0;
        score += int(publicSignals[1]) * 1; //thumbs up
        score -= int(publicSignals[2]) * 1; //thumbs down
        score += int(publicSignals[3]) * 2; //heart
        score -= int(publicSignals[4]) * 2; //heart broken

        if (!foundWinner) {
            _findWinner();
        }

        if (score >= winnerScore) {
            // TODO: mint NFT
        }
    }

    function _findWinner() internal {
        int firstHighest = -2 * int(numTeams);
        int secondHighest = -2 * int(numTeams);
        int thirdHighest = -2 * int(numTeams);
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
        uint256[5] calldata publicSignals,
        uint256[8] calldata proof
    ) public view returns (bool) {
        return dataVerifier.verifyProof(publicSignals, proof);
    }
}
