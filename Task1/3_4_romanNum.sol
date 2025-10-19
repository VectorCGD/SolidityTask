// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract romanNumber{
    
    function intToRoman(int num)public pure returns(string memory){
        bytes memory romanStr = "IVXLCDM";

        uint8 index = 0;
        bytes memory result="";
        while(num > 0){
            bytes memory part ="";
            int8 n = int8(num % 10);
            if (n == 5){
                result = bytes.concat(romanStr[index+1],result);
            }else if(n == 4){
                part = bytes.concat(romanStr[index],romanStr[index+1]);
            }else if(n == 9){
                part = bytes.concat(romanStr[index],romanStr[index+2]);
            }else {
                int8 count = n - 5;
                if(count > 0){
                    part = bytes.concat(romanStr[index+1],part);
                    for (int8 i = 0; i < count; i++) {
                        part = bytes.concat(part,romanStr[index]);
                    }
                }else{
                    for (int8 i = 0; i < count + 5; i++) {
                        part = bytes.concat(part,romanStr[index]);
                    }
                }
            }
            index += 2;
            num /= 10;
            result = bytes.concat(part,result);
        }
        return string(result);
    }

    function romanToInt(string calldata str)public pure returns(uint num){
        bytes memory romanStr = "IVXLCDM";
        uint16[7] memory values = [1,5,10,50,100,500,1000];

        uint16 lastValue = 0;
        uint16 result  = 0;
        bytes memory romanNum = bytes(str);
        for (int i = int(romanNum.length - 1); i >= 0 ; i--) {
            uint16 curVal = 0;
            for (uint8 vi = 0; vi < romanStr.length; vi++) {
                if (romanStr[vi] == romanNum[uint(i)]){
                    curVal = values[vi];
                }
            }
            if (lastValue > curVal){
                result -= curVal;
                continue;          
            }
            result += curVal;
            lastValue = curVal;
        }
        return result;
    } 
}