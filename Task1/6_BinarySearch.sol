// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Search{
    function binarySearch(uint[] calldata data, uint target) public pure returns (int){
        uint left;
        uint right=data.length;
        while(left < right){
            uint mid=left + (right-left)/2; // to avoid overflow
            if(data[mid] < target){
                left=mid+1;
            }else if(data[mid] > target){
                right=mid;
            }else{
                return int(mid);
            }
        }
        return -1;
    }
}