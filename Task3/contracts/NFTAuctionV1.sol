// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./NFTAuction.sol";
import "./AuctionFactoryV1.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract NFTAuctionV1 is NFTAuction
{
    address private tokenAddr;
    function GetToUSDFeed(address bidToken) internal view returns(uint){
        return uint(AuctionFactoryV1(factory).GetToUSDPriceFeed(bidToken));
    }
    function comparePrices(uint amountPrice) internal view returns(bool){
        uint defPrice = defaultPrice * GetToUSDFeed(address(0));
        uint highestPrice = highestBid * GetToUSDFeed(tokenAddr);
        return amountPrice > defPrice && amountPrice > highestPrice;
    }

    modifier _bidTimeLimit{
        require(block.timestamp > startTime && block.timestamp < startTime + duration,"Not during the auction period");
        _;
    }
    //以太坊出价
    function BidETH()public override payable _bidTimeLimit{
        uint amountPrice = msg.value * GetToUSDFeed(address(0));
        require(comparePrices(amountPrice) ,"amount less then highest bid");
        UpdateHighestBid(msg.value,msg.sender,address(0));
    }
    //ERC20 出价
    function BidToken(address erc20,uint amount)public _bidTimeLimit{
        ERC20 token20 = ERC20(erc20);
        uint  amountPrice = (amount * 10 ** (18 - token20.decimals())) * GetToUSDFeed(erc20);
        require(comparePrices(amountPrice) ,"amount less then highest bid");
        require(token20.allowance(msg.sender,address(this)) >= amount,"Token approve not enough");
        token20.transferFrom(msg.sender, address(this), amount);
        UpdateHighestBid(amount,msg.sender,erc20);
    }

    function UpdateHighestBid(uint amount,address bidder,address tAddr)internal {
        uint oldBid = highestBid;
        address oldBidder = highestBidder;
        address oldToken = tokenAddr;

        highestBid = amount;
        highestBidder = bidder;
        tokenAddr = tAddr;

        if(oldBidder == address(0)) { return; }
        if (oldToken == address(0)){
            payable(oldBidder).transfer(oldBid);
        }else{
            ERC20(oldToken).transfer(oldBidder, oldBid);
        }
    }

    function EndAuction()public override {
        require(highestBidder != address(0),"No buyers");
        require(block.timestamp > startTime + duration,"Can't to do during the auction period");
        require(address(this) == IERC721(nfToken).getApproved(tokenId),"NFToken is unauthorized");
        IERC721(nfToken).safeTransferFrom(seller,highestBidder,0);
        if (tokenAddr == address(0)){
            payable(seller).transfer(highestBid);
        }else{
            IERC20(tokenAddr).transfer(seller, highestBid);
        }
    }

}