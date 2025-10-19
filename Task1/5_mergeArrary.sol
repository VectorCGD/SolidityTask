// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract mergeArray{
    function merge(int[] calldata arr1,int[] calldata arr2) public pure returns(int[] memory){
        int[] memory result = new int[](arr1.length + arr2.length);
        uint n1 = 0;
        uint n2 = 0;
        for (uint256 i = 0; i < arr1.length + arr2.length; i++) {
            if (n1 >= arr1.length && n2 < arr2.length){
                result[i] = arr2[n2];
                n2++;
                continue;
            }
            if(n2>= arr2.length && n1 < arr1.length){
                result[i] = arr1[1];
                n1++;
                continue;
            }
            if(arr1[n1] > arr2[n2]){
                result[i] = arr2[n2];
                n2 = n2 + 1;
            }else{
                result[i] = arr1[n1];
                n1 = n1 + 1;
            }
        }
        return result;
    }
//[1,3,5,7,10,14,17,19,21],[2,4,6,10,15,16,19,22]
}