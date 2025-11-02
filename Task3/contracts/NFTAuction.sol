// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./AuctionFactory.sol";
import "./VerifyDeployer.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";

contract NFTAuction is
Initializable,
UUPSUpgradeable,
VerifyDeployer
{
    event BidEvent(address indexed bidder,uint amount);
    event BidBackEvent(address indexed target,uint amount);
    event EndAuctionEvent(address indexed seller,uint amount,address highestBidder);
    //编号
    uint64 id;
    //开始时间
    uint64 startTime;
    //持续时间
    uint64 duration;
    //初始报价
    uint defaultPrice; 
    //最高报价
    uint highestBid;
    //最高报价者
    address highestBidder;
    //卖家
    address seller;
    //nft地址
    address nfToken;
    //nfTokenId
    uint tokenId;
    //factory
    address factory;
    constructor(){
        changeAdmin(msg.sender);
    }
    
    modifier _initPermission{
        if(Admin() != msg.sender){
            require(factory == address(0),"can't reset data");
        }
        _;
    }

    function Initialize(
        uint64 _id,
        uint64 _duration,
        address _seller,
        address _nft,
        uint _tokenId,
        uint _defaultPrice,
        address _factory)
    public initializer _initPermission{
        id = _id;
        startTime = uint64(block.timestamp);
        duration = _duration;
        seller = _seller;
        nfToken = _nft;
        tokenId = _tokenId;
        defaultPrice = _defaultPrice;
        factory = _factory;
        changeAdmin(AuctionFactory(factory).Admin());
    }

    function ID()external view returns(uint){
        return id;
    }

    function Status()public view returns(string memory) {
        if(block.timestamp > startTime + duration) {
            return "End";
        }else{
            return "Auctioning";
        }
    }

    function BidETH()public virtual payable{
        require(block.timestamp > startTime && block.timestamp < startTime + duration,"Not during the auction period");
        require(msg.value > defaultPrice && msg.value > highestBid ,"amount less then highest bid");
        if(highestBidder != address(0)){
            payable(highestBidder).transfer(highestBid);
            emit BidBackEvent(highestBidder,highestBid);
        }
        highestBidder = msg.sender;
        highestBid = msg.value;
        emit BidEvent(highestBidder, highestBid);
    }

    function EndAuction()public virtual{
        require(highestBidder != address(0),"No buyers");
        require(address(this) == IERC721(nfToken).getApproved(tokenId),"NFToken is unauthorized");
        require(block.timestamp > startTime + duration,"Can't to do during the auction period");
        IERC721(nfToken).safeTransferFrom(seller,highestBidder,0);
        payable(seller).transfer(highestBid);
        emit EndAuctionEvent(seller, highestBid, highestBidder);
    }

    function _authorizeUpgrade(address newImplementation) internal override _senderPermissionVerify{ }
}