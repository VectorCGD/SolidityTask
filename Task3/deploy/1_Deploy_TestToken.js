const { ethers, deployments } = require("hardhat")

module.exports = async() =>{
    let [deployer] = await ethers.getSigners()
    await deployments.deploy("TestToken",{
        from:deployer.address,
        log:true
    })
}

module.exports.tags = ["TestToken"]