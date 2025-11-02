const { deployments, ethers, network } = require("hardhat")
//基础功能测试
const { expect } = require("chai")

network.name == "sepolia" ? describe.skip :
describe("NFTAuction Test",async() =>{
    let deployer,user1,user2
    let NFTokenInfo, nfTokenObj
    let factoryObj
    beforeEach(async()=>{
        [deployer, user1, user2] = await ethers.getSigners()
        let dmts = await deployments.fixture("NFTAuction")

        NFTokenInfo = dmts["NFToken"]
        nfTokenObj = await ethers.getContractAt("NFToken",NFTokenInfo.address)
        await nfTokenObj.Mint()

        let FactoryInfo = dmts["AuctionFactoryProxy"]
        factoryObj = await ethers.getContractAt("AuctionFactory",FactoryInfo.address)
    })

    it("Factory Init Permission Verify",async()=>{
        expect(factoryObj.connect(user1).Initialize()).to.be.revertedWith("permission denied")
    })

    it("Auction Update Permission Verify",async()=>{
        let aInfo = await deployments.get("NFTAuction")
        expect(factoryObj.connect(user2).SetDefaultVersion(aInfo.address)).to.be.revertedWith("function permission denied")
    })

    it("Create Auction Event",async()=>{
        let aid
        factoryObj.on("CreateAuctionEvent",(addr,id,nftAddr,tid)=>{
            aid = id
        })
        let tx = await factoryObj.CreateAuction(300,NFTokenInfo.address,0,ethers.parseEther("0.01"))
        await tx.wait()
        await new Promise(resolve =>setTimeout(resolve,100))

        expect(tx).to.emit(factoryObj,"CreateAuctionEvent")
        expect(await factoryObj.GetAuctionCount()).to.eq(ethers.getNumber(aid)+1)
        let auctionAddr = await factoryObj.GetAuctionAddr(aid)
        expect(auctionAddr).to.not.eq(ethers.ZeroAddress)   
    })

    it("NFT Auction",async() =>{
        let aid
        factoryObj.on("CreateAuctionEvent",(addr,id,nftAddr,tid)=>{ 
            aid = id
        })
        let tx = await factoryObj.CreateAuction(10,NFTokenInfo.address,0,ethers.parseEther("0.01"))
        await tx.wait()
        await new Promise(resolve =>setTimeout(resolve,100))

        let auctionAddr = await factoryObj.GetAuctionAddr(aid)
        expect(auctionAddr).to.not.eq(ethers.ZeroAddress) 
        let auctionObj = await ethers.getContractAt("NFTAuction",auctionAddr)
        expect(await auctionObj.ID()).to.eq(aid)
        //开始出价
        await auctionObj.connect(user1).BidETH({value:ethers.parseEther("0.011")})
        let u1Amount = await ethers.provider.getBalance(user1.address) + ethers.parseEther("0.011")

        await auctionObj.connect(user2).BidETH({value:ethers.parseEther("0.021")})
        expect(await ethers.provider.getBalance(user1.address)).to.eq(u1Amount)
        expect(await ethers.provider.getBalance(auctionAddr)).to.eq(ethers.parseEther("0.021"))

        expect(await auctionObj.Status()).to.eq("Auctioning")
        //出价过低
        expect(auctionObj.BidETH({value:ethers.parseEther("0.02")})).to.be.revertedWith("amount less then highest bid")
        await new Promise(resolve =>setTimeout(resolve,100))
        //NFT 卖家未授权无法转账
        expect(auctionObj.EndAuction()).to.be.revertedWith("NFToken is unauthorized")
        await new Promise(resolve =>setTimeout(resolve,100))

        await nfTokenObj.approve(auctionAddr,0)
        //拍卖未结束无法转账
        expect(auctionObj.EndAuction()).to.be.revertedWith("Can't to do during the auction period")
        await new Promise(resolve =>setTimeout(resolve,12*1000))
        //拍卖已结束不可再竞拍
        expect(auctionObj.BidETH({value:ethers.parseEther("0.022")})).to.be.revertedWith("Not during the auction period")
    })

    it("NFT Auction End Transfer",async() =>{
        let aid
        factoryObj.on("CreateAuctionEvent",(addr,id,nftAddr,tid)=>{ 
            aid = id
        })
        let tx = await factoryObj.CreateAuction(10,NFTokenInfo.address,0,ethers.parseEther("0.01"))
        await tx.wait()
        await new Promise(resolve =>setTimeout(resolve,100))
        let auctionAddr = await factoryObj.GetAuctionAddr(aid)
        let auctionObj = await ethers.getContractAt("NFTAuction",auctionAddr)
        //开始出价
        await auctionObj.connect(user1).BidETH({value:ethers.parseEther("0.011")})
        await auctionObj.connect(user2).BidETH({value:ethers.parseEther("0.021")})
        await new Promise(resolve =>setTimeout(resolve,12*1000))
        
        //nft授权 转账 完成交易 结束拍卖
        await nfTokenObj.approve(auctionAddr,0)
        let sellerAmount = await ethers.provider.getBalance(deployer.address) + ethers.parseEther("0.021")
        await auctionObj.connect(user2).EndAuction()
        //验证资金流向
        expect(await auctionObj.connect(user2).Status()).to.eq("End")
        expect(await nfTokenObj.connect(user2).ownerOf(0)).to.eq(user2.address)
        expect(await ethers.provider.getBalance(deployer.address)).to.eq(sellerAmount)
    })
})

