// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./AuctionFactory.sol";
import { AggregatorV3Interface } from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract AuctionFactoryV1 is AuctionFactory
{
    mapping (address=>AggregatorV3Interface) feedDatas;
    //0x694AA1769357215DE4FAC081bf1f309aDC325306    ETH/USD
    function InitializeFeed()public _senderPermissionVerify{
        SetToUSDPriceFeed(address(0), 0x694AA1769357215DE4FAC081bf1f309aDC325306);
    }
    function SetToUSDPriceFeed(address tokenAddr,address feedAddr) public _senderPermissionVerify() {
        feedDatas[tokenAddr] = AggregatorV3Interface(feedAddr);
    }
    function GetToUSDPriceFeed(address tokenAddr) public view returns(int){
        AggregatorV3Interface targetFeed = feedDatas[tokenAddr];
        require(address(targetFeed) != address(0),"To USDPrice Feed Not Exist");
        (
            ,int answer,,,
        ) = targetFeed.latestRoundData();
        return answer;
    }
}