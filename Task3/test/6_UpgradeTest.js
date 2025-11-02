const { deployments, ethers, network, upgrades } = require("hardhat")
const { expect } = require("chai")

network.name == "sepolia" ? describe.skip :
describe("Upgrade Test",async() =>{
    let deployer, user1, user2
    let proxyAddr
    let aucImplV1Addr
    let proxyObj
    beforeEach(async()=>{
        [deployer,user1,user2] = await ethers.getSigners()
        let dmts = await deployments.fixture(["NFTAuction","NFTAuctionV1"])
        proxyAddr = dmts["AuctionFactoryProxy"].address
        aucImplV1Addr = dmts["NFTAuctionV1"].address
        //升级
        proxyObj = await ethers.getContractAt("AuctionFactory",proxyAddr)
        let V1Factory = await ethers.getContractFactory("AuctionFactoryV1")
        proxyObj = await upgrades.upgradeProxy(proxyObj,V1Factory,{call:"InitializeFeed"})
        await proxyObj.waitForDeployment()
    })
    
    it("Upgrade Factory Proxy",async()=>{
        let price = await proxyObj.GetToUSDPriceFeed(ethers.ZeroAddress)
        expect(price).to.greaterThan(1000)
    })

    it("Upgrade Auction",async()=>{
        await proxyObj.SetDefaultVersion(aucImplV1Addr)
        expect(await proxyObj.GetDefault()).to.eq(aucImplV1Addr)
    })

    it("AuctionV1 Test",async()=>{
        await proxyObj.SetDefaultVersion(aucImplV1Addr)
        let dmts = await deployments.fixture(["TestToken","NFToken"])
        tokenAddr = dmts["TestToken"].address
        nftokenAddr = dmts["NFToken"].address

        let tokenObj = await ethers.getContractAt("TestToken",tokenAddr)
        let decimals = ethers.getNumber(await tokenObj.decimals())
        await tokenObj.connect(user1).Mint()
        await tokenObj.connect(user2).Mint()
        let nftokenObj = await ethers.getContractAt("NFToken",nftokenAddr)
        await nftokenObj.Mint()

        let aucId
        proxyObj.on("CreateAuctionEvent",(saddr,id,nft,tid) => {
            aucId = id
        })
        let tx = await proxyObj.CreateAuction(35,nftokenAddr,0,ethers.parseEther("0.01"))
        await tx.wait()
        new Promise(resolve => setTimeout(resolve,50))
        
        let auctionAddr = await proxyObj.GetAuctionAddr(aucId)
        let auctionObj = await ethers.getContractAt("NFTAuctionV1",auctionAddr)

        expect(auctionObj.connect(user2).BidToken(tokenAddr,50*10**decimals)).to.be.revertedWith("To USDPrice Feed Not Exist")
        new Promise(resolve => setTimeout(resolve,100))

        //添加测试用币价格  借用USDC > USD 的价格
        let USDC_2_USD = "0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E"
        proxyObj.SetToUSDPriceFeed(tokenAddr,USDC_2_USD)
        await tokenObj.connect(user2).approve(auctionAddr,50*10**decimals)
        await auctionObj.connect(user2).BidToken(tokenAddr,50*10**decimals)
        
        await auctionObj.connect(user1).BidETH({value:ethers.parseEther("0.02")})

        await new Promise(resolve => setTimeout(resolve,33*1000))

        await nftokenObj.approve(auctionAddr,0)
        await auctionObj.EndAuction()
        expect(await nftokenObj.ownerOf(0)).to.eq(user1.address)
    })
})