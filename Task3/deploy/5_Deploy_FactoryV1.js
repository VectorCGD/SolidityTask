const { deployments, ethers } = require("hardhat");

module.exports = async() =>{
    let [deployer] = await ethers.getSigners()
    let factory = await deployments.deploy("AuctionFactoryV1",{
        from:deployer.address,
        log:true
    })
    let factoryObj = await ethers.getContractAt("AuctionFactoryV1",factory.address)
    await factoryObj.Initialize()
    await factoryObj.InitializeFeed()
};

module.exports.tags = ["AuctionFactoryV1"]