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

    constructor(Unirep _unirep, IVerifier _dataVerifier, uint48 _epochLength) {
        // set unirep address
        unirep = _unirep;

        // set verifier address
        dataVerifier = _dataVerifier;

        // sign up as an attester
        unirep.attesterSignUp(_epochLength);
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
        unirep.verifyEpochKeyProof(publicSignals, proof);
        Unirep.EpochKeySignals memory signals = unirep.decodeEpochKeySignals(
            publicSignals
        );
        require(signals.revealNonce == 1);
        require(signals.nonce == 0);
        require(signals.attesterId == uint(uint160(address(this))));
        participants[projectID].push(signals.epochKey);
    }

    function vote(
        uint256 projectID,
        Emoji emoji,
        uint256[] memory publicSignals,
        uint256[8] memory proof
    ) public {
        unirep.verifyEpochKeyProof(publicSignals, proof);
        Unirep.EpochKeySignals memory signals = unirep.decodeEpochKeySignals(
            publicSignals
        );
        require(voted[signals.epochKey] < 2);
        require(signals.revealNonce == 1);
        require(signals.nonce == 1);
        require(signals.attesterId == uint(uint160(address(this))));
        if (emoji == Emoji.THUMBS_UP || emoji == Emoji.THUMBS_DOWN)
            voted[signals.epochKey] += 1;
        else if (emoji == Emoji.HEART || emoji == Emoji.HEART_BROKEN)
            voted[signals.epochKey] += 2;
        uint[] memory members = participants[projectID];
        uint48 epoch = unirep.attesterCurrentEpoch(uint160(address(this)));
        for (uint256 i = 0; i < members.length; i++) {
            unirep.attest(members[i], epoch, uint(emoji), 1);
        }
    }

    function claim(
        uint256[5] calldata publicSignals,
        uint256[8] calldata proof
    ) public view {
        verifyDataProof(publicSignals, proof);
        // mint NFT
    }

    function verifyDataProof(
        uint256[5] calldata publicSignals,
        uint256[8] calldata proof
    ) public view returns (bool) {
        return dataVerifier.verifyProof(publicSignals, proof);
    }
}
