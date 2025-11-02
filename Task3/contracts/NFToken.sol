// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFToken is ERC721 {
    uint currentId;
    constructor()ERC721("TestToken","TT") {}

    function _baseURI() internal pure override  returns (string memory) {
        return "baseURLInfor";
    }
    function Mint()public{
        _mint(msg.sender,currentId++);
    }
}