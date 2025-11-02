const { deployments, ethers } = require("hardhat");

module.exports = async() =>{
    let [deployer] = await ethers.getSigners()
    await deployments.deploy("NFTAuction",{
        from:deployer.address,
        log:true
    })
};

module.exports.tags = ["NFTAuction"]