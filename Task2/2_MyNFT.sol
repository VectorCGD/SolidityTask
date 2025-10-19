// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MyNFT is ERC721{
    uint public MAX_APES = 10000; // 总量

    constructor() ERC721("VectorNFT","vnft"){  
    }

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://QmS1ismfmHD3qYgcW8g8v2nLaNnLnxRYk1bz8AUHMzK4m8/";
    }
    
    function mintNFT(address to, uint tokenId) external {
        require(tokenId >= 0 && tokenId < MAX_APES, "tokenId out of range");
        _mint(to, tokenId);
    }
}