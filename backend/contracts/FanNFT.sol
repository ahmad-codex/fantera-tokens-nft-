// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract FanNFT is ERC721URIStorage {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;
    IERC20 private fanToken;

    constructor(address fanTokenAddress) ERC721("FunnyApe NFT", "FApeNFT") {
        fanToken = IERC20(fanTokenAddress);
    }

    function mintNFT(string memory tokenURI) public returns (uint256) {
        uint256 balance = fanToken.balanceOf(msg.sender);
        require(balance > 0, "fanToken balance is 0");

        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }
}
