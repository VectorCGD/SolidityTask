const { deployments, ethers, network } = require("hardhat")
const { expect } = require("chai")

network.name == "sepolia" ? describe.skip :
describe("ERC20 Token Test",async() =>{
    let deployer,user1,user2
    let tokenObj
    beforeEach(async()=>{
        [deployer,user1,user2] = await ethers.getSigners()
        let dmt = (await deployments.fixture(["TestToken"]))["TestToken"]
        tokenObj = await ethers.getContractAt("TestToken",dmt.address)
    })
    it("Transform",async()=>{
        await tokenObj.connect(user1).Mint()
        let balance1= await tokenObj.balanceOf(user1.address)
        expect(balance1).to.equal(100*10**6)

        await tokenObj.connect(user2).Mint()
        await tokenObj.connect(user2).transfer(user1,20*10**6)

        balance1 = await tokenObj.balanceOf(user1.address)
        expect(balance1).to.equal(120*10**6)
    })
})

