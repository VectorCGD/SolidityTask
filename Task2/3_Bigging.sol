// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
contract Bigging{
    event Donation(address indexed donator,uint value);
    address owner;
    address[] donators;
    mapping (address=>uint256) donatesAmount;
    uint256 dtimestamp;
    uint256 timelock = 60*60*24*30;

    modifier onlyOwner {
        require(msg.sender == owner,"permission denied");
        _;
    }

    constructor(){
        owner = msg.sender;
        dtimestamp = block.timestamp;
    }

    function donate()external payable{
        require(block.timestamp < dtimestamp + timelock,"donate is close");
        donatesAmount[msg.sender] = msg.value;
        emit Donation(msg.sender,msg.value);
        donators.push(msg.sender);
    }

    function withdraw()external onlyOwner{
        payable(msg.sender).transfer(address(this).balance);
    }

    function getDonation(address addr)public view returns(uint256){
        return donatesAmount[addr];
    }
    function maxDonators() public view returns(address[3] memory){
        address[] memory maxDor = new address[](3); 
        for (uint256 i = 0; i < donators.length; i++) {
            if(maxDor.length < 3){
                maxDor[maxDor.length] = donators[i];
                continue;
            }
            uint8 minIndex = 0;
            uint minAmount = donatesAmount[maxDor[0]];
            for (uint256 index = 1; index < maxDor.length; index++) {
                uint amount = donatesAmount[maxDor[index]];
                if( amount < minAmount){
                    minIndex = uint8(index);
                    minAmount = amount;
                }
            }
            uint256 curValue = donatesAmount[donators[i]];
            if(curValue > minAmount){
                maxDor[minIndex] = donators[i];
            }
        }
        return [maxDor[0],maxDor[1],maxDor[2]];
    }
}