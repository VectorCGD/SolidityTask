// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract reverse{
    function stringReverse(string calldata str)public pure returns(string memory){
        bytes memory bstr = bytes(str);
        uint fcount = bstr.length/2;
        for (uint256 i = 0; i < fcount; i++) {
            bytes1 temp = bstr[i];
            bstr[i] = bstr[bstr.length-1-i];
            bstr[bstr.length-1-i] = temp;
        }
        return string(bstr);
    }
}