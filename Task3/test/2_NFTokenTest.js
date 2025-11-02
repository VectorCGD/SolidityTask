const { deployments, ethers, network } = require("hardhat")
const { expect } = require("chai")

network.name == "sepolia" ? describe.skip :
describe("ERC721 NFToken Test",async() =>{
    let deployer,user1,user2
    let nfTokenObj
    beforeEach(async() =>{
        [deployer,user1,user2] = await ethers.getSigners()
        let NFTokenInfo = (await deployments.fixture(["NFToken"]))["NFToken"]
        nfTokenObj = await ethers.getContractAt("NFToken",NFTokenInfo.address)
    })
    it("NFToken Mint and Transfer",async()=>{
        await nfTokenObj.Mint()
        expect(deployer.address).to.equal(await nfTokenObj.ownerOf(0))

        await nfTokenObj.safeTransferFrom(deployer.address,user1.address,0)
        expect(user1.address).to.equal(await nfTokenObj.ownerOf(0))
    })
})

