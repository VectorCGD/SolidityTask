// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./NFTAuction.sol";
import "./VerifyDeployer.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";

contract AuctionFactory is
Initializable,
UUPSUpgradeable,
VerifyDeployer
{
    event AuctionVersionChange(address version);
    event CreateAuctionEvent(address indexed seller,uint auctionId,address nft,uint tokenId);
    //创建新拍卖的默认版本号
    address dftVersion;
    //记录所有的拍卖交易
    address[] auctions;
    function Initialize()public initializer{
        changeAdmin(msg.sender);
    }
    
    function CreateAuction(
        uint64 _duration,
        address _nft,
        uint _tokenId,
        uint _defaultPrice
    )public returns(address){
        require(dftVersion != address(0),"Can't Create Acution");
        address auctionProxy = address(new ERC1967Proxy(dftVersion,""));
        //初始化拍卖数据
        NFTAuction(auctionProxy).Initialize(
            uint64(auctions.length),
            _duration,
            msg.sender,
            _nft,
            _tokenId,
            _defaultPrice,
            address(this)
        );
        emit CreateAuctionEvent(msg.sender, auctions.length,_nft,_tokenId);
        auctions.push(auctionProxy);
        return auctions[auctions.length-1];
    }

    function GetAuctionCount() public view returns(uint){
        return auctions.length;
    }

    //根据索引获取拍卖地址
    function GetAuctionAddr(uint index)public view returns(address) {
        return auctions[index];
    }
    
    function GetDefault()public view returns(address) {
        return dftVersion;
    }

    function SetDefaultVersion(address newVersion) external _senderPermissionVerify{
        address deployer = NFTAuction(newVersion).Admin();
        require(deployer != address(0),"new version is Not implementation contract");
        require(getAdmin() == deployer,"update permission denied");
        dftVersion = newVersion;
        emit AuctionVersionChange(newVersion);
    }
    
    function _authorizeUpgrade(address newImplementation) internal override _senderPermissionVerify {} 
}