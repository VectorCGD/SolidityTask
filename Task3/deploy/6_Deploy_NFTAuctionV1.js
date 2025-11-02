const { deployments, ethers } = require("hardhat");

module.exports = async() =>{
    let [deployer] = await ethers.getSigners()
    await deployments.deploy("NFTAuctionV1",{
        from:deployer.address,
        log:true
    })
};

module.exports.tags = ["NFTAuctionV1"]