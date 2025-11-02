const { ethers, deployments } = require("hardhat")

module.exports = async() =>{
    let [deployer] = await ethers.getSigners()
    await deployments.deploy("NFToken",{
        from:deployer.address,
        log:true
    })
}

module.exports.tags = ["NFToken","NFTAuction"]