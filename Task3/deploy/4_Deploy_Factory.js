const { deployments, upgrades, ethers } = require("hardhat");

module.exports = async() =>{
    let Factory = await ethers.getContractFactory("AuctionFactory")
    let froxyDeploy = await upgrades.deployProxy(Factory,[],{initializer:"Initialize"})
    let proxyObj = await froxyDeploy.waitForDeployment();

    let auctionImpl = await deployments.get("NFTAuction")

    let tx = await proxyObj.SetDefaultVersion(auctionImpl.address)
    await tx.wait()

    let proxyAddress =await proxyObj.getAddress()
    let proxyImplAddr = await upgrades.erc1967.getImplementationAddress(proxyAddress)

    await deployments.save("AuctionFactoryProxy",{
        address: proxyAddress,
        abi: Factory.interface.format("json")
    })
    await deployments.save("AuctionFactory",{
        address: proxyImplAddr,
        abi: Factory.interface.format("json")
    })
};

module.exports.tags = ["NFTAuction"]