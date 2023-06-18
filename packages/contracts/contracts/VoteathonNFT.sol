// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC721URIStorage} from '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import {ERC721} from '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import {Counters} from '@openzeppelin/contracts/utils/Counters.sol';

contract VoteathonNFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    address public owner;
    address public voteathon;
    string public metadataURI;

    constructor(string memory _metadataURI) ERC721('VoteathonNFT', 'VoteNFT') {
        owner = msg.sender;
        metadataURI = _metadataURI;
    }

    function setVoteathonAddress(address _voteathon) public {
        require(msg.sender == owner);
        voteathon = _voteathon;
    }

    function awardItem(address winner) public returns (uint256) {
        require(msg.sender == voteathon);
        uint256 newItemId = _tokenIds.current();
        _mint(winner, newItemId);
        _setTokenURI(newItemId, metadataURI);

        _tokenIds.increment();
        return newItemId;
    }
}
