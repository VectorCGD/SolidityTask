const { deployments, ethers, network } = require("hardhat")
const { expect } = require("chai")

network.name == "sepolia" ? describe.skip :
describe("AuctionV1 New Function",async() =>{
    let deployer, user1, user2
    let tokenObj, tokenAddr, decimals
    let nfTokenObj,nftAddress
    let factoryV1Obj, factoryV1Addr
    beforeEach(async()=>{
        [deployer,user1,user2] = await ethers.getSigners()
        let dmts = await deployments.fixture(["TestToken","NFToken","AuctionFactoryV1","NFTAuctionV1"])
        tokenAddr = dmts["TestToken"].address
        tokenObj = await ethers.getContractAt("TestToken",tokenAddr)
        decimals = ethers.getNumber(await tokenObj.decimals())
        //竞价者 获取一定数据的ERC20    用于参加拍卖
        await tokenObj.connect(user1).Mint()
        await tokenObj.connect(user2).Mint()

        nftAddress = dmts["NFToken"].address
        nfTokenObj = await ethers.getContractAt("NFToken",nftAddress)
        await nfTokenObj.Mint()

        factoryV1Addr = dmts["AuctionFactoryV1"].address
        factoryV1Obj = await ethers.getContractAt("AuctionFactoryV1",factoryV1Addr)
        await factoryV1Obj.SetDefaultVersion(dmts["NFTAuctionV1"].address)
        //添加测试用币价格  借用USDC > USD 的价格
        let USDC_2_USD = "0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E"
        await factoryV1Obj.SetToUSDPriceFeed(tokenAddr,USDC_2_USD)
    })
    it("Auction by multiple token payment",async()=>{
        //创建拍卖
        let aucId
        factoryV1Obj.on("CreateAuctionEvent",(saddr,id,nft,tid)=>{
            aucId = id;
        })
        let tx = await factoryV1Obj.CreateAuction(30,nftAddress,0,ethers.parseEther("0.01"))
        await tx.wait()
        await new Promise(resolve => setTimeout(resolve,100))

        let auctionAddr = await factoryV1Obj.GetAuctionAddr(aucId)
        let auctionObj = await ethers.getContractAt("NFTAuctionV1",auctionAddr)
        expect(auctionObj.connect(user1).BidETH({value:ethers.parseEther("0.01")})).to.be.
                                    revertedWith("amount less then highest bid")
        await new Promise(resolve => setTimeout(resolve,10))

        expect(auctionObj.connect(user2).BidToken(tokenAddr,45*10**decimals)).to.be.
                                    revertedWith("Token approve not enough")
        await new Promise(resolve => setTimeout(resolve,10))

        await tokenObj.connect(user2).approve(auctionAddr,45*10**decimals)
        await auctionObj.connect(user2).BidToken(tokenAddr,45*10**decimals)
        expect(await tokenObj.balanceOf(auctionAddr)).to.eq(45*10**decimals)

        await auctionObj.connect(user1).BidETH({value:ethers.parseEther("0.015")})
        expect(await ethers.provider.getBalance(auctionAddr)).to.eq(ethers.parseEther("0.015"))
        expect(await tokenObj.balanceOf(user2.address)).to.eq(100*10**decimals)

        expect(auctionObj.EndAuction()).to.be.revertedWith("Can't to do during the auction period")

        await new Promise(resolve => setTimeout(resolve,25*1000))

        expect(auctionObj.connect(user2).BidETH({value:ethers.parseEther("0.016")})).to.be.
                                        revertedWith("Not during the auction period")
    })
    it("Auction END",async()=>{
        //创建拍卖
        let aucId
        factoryV1Obj.on("CreateAuctionEvent",(saddr,id,nft,tid)=>{
            aucId = id;
        })
        let tx = await factoryV1Obj.CreateAuction(30,nftAddress,0,ethers.parseEther("0.01"))
        await tx.wait()
        await new Promise(resolve => setTimeout(resolve,100))

        let auctionAddr = await factoryV1Obj.GetAuctionAddr(aucId)
        let auctionObj = await ethers.getContractAt("NFTAuctionV1",auctionAddr)

        expect(auctionObj.connect(user1).BidToken(tokenAddr,30*10**decimals)).to.be.
                                    revertedWith("amount less then highest bid")
        await new Promise(resolve => setTimeout(resolve,10))

        await tokenObj.connect(user2).approve(auctionAddr,45*10**decimals)
        await auctionObj.connect(user2).BidToken(tokenAddr,45*10**decimals)

        await auctionObj.connect(user1).BidETH({value:ethers.parseEther("0.015")})
        let u1Balance = await ethers.provider.getBalance(user1.address) + ethers.parseEther("0.015")

        await tokenObj.connect(user2).approve(auctionAddr,65*10**decimals)
        await auctionObj.connect(user2).BidToken(tokenAddr,65*10**decimals)

        await new Promise(resolve => setTimeout(resolve,25*1000))

        expect(auctionObj.EndAuction()).to.be.revertedWith("NFToken is unauthorized")
        await new Promise(resolve => setTimeout(resolve,10))

        await nfTokenObj.approve(auctionAddr,0)
        await auctionObj.EndAuction()
        expect(await ethers.provider.getBalance(user1.address)).to.eq(u1Balance)
        expect(await tokenObj.balanceOf(user2.address)).to.eq(35*10**decimals)
        expect(await tokenObj.balanceOf(deployer.address)).to.eq(65*10**decimals)
        expect(await nfTokenObj.ownerOf(0)).to.eq(user2.address)
    })
})