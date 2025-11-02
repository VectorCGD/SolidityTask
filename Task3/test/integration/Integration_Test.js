const { deployments, ethers, network, upgrades } = require("hardhat")
//基础功能测试
const { expect } = require("chai")

network.name != "sepolia" ? describe.skip :
describe("Integration Test",async() =>{
    let deployer,user1,user2
    let nftAddress, nftObj
    let proxyAddress, proxyObj
    let USDC, tokenObj, decimals
    it("Deploy Original Contracts",async()=>{
        [deployer,user1,user2] = await ethers.getSigners()

        //Deploy [NFToken  NFTAuction   AuctionFactory    AuctionFactoryProxy]
        let dmts = await deployments.fixture(["NFTAuction"])
        nftAddress = dmts["NFToken"].address
        nftObj = await ethers.getContractAt("NFToken",nftAddress)
        await nftObj.Mint()

        proxyAddress = dmts["AuctionFactoryProxy"].address
        proxyObj = await ethers.getContractAt("AuctionFactory",proxyAddress)

    })

    it("Auction Basic Function",async()=>{
        let aucId
        proxyObj.on("CreateAuctionEvent",(saddr,id,nft,tid)=>{
            aucId = id
        })
        let createTx = await proxyObj.CreateAuction(80,nftAddress,0,ethers.parseEther("0.01"))
        let createTxRec = await createTx.wait()
        await new Promise(resolve =>{ 
            const check = setInterval(()=>{
                if(aucId !== undefined){
                    clearInterval(check)
                    resolve()
                }
            },100)
            setTimeout(resolve,5000)
        })
        expect(createTxRec).to.be.emit(proxyObj,"CreateAuctionEvent").withArgs(deployer.address,0,nftAddress,0)

        console.log(aucId)

        let auctionAddr = await proxyObj.GetAuctionAddr(aucId)
        let auctionObj = await ethers.getContractAt("NFTAuction",auctionAddr)

        await auctionObj.connect(user1).BidETH({value:ethers.parseEther("0.011")})
        await auctionObj.connect(user2).BidETH({value:ethers.parseEther("0.012")})

        let tx = await nftObj.approve(auctionAddr,0)
        await tx.wait()
        await new Promise(resolve => setTimeout(resolve,81*1000))

        let balance = await ethers.provider.getBalance(deployer.address) + ethers.parseEther("0.012")
        let endTx = await auctionObj.connect(user2).EndAuction()
        let endTxRec = await endTx.wait()
        expect(endTxRec).to.be.emit(proxyObj,"EndAuctionEvent")
                            .withArgs(deployer.address,ethers.parseEther("0.012"),user2.address)
        expect(await ethers.provider.getBalance(deployer.address)).to.eq(balance)
        expect(await nftObj.ownerOf(0)).to.eq(user2.address)
    })

    it("Upgrade Factory Proxy",async()=>{
        let dmts = await deployments.fixture(["NFTAuctionV1"])
        let FactoryV1 = await ethers.getContractFactory("AuctionFactoryV1")
        let dep = await upgrades.upgradeProxy(proxyAddress,FactoryV1)
        proxyObj = await dep.waitForDeployment()
        let impl = await upgrades.erc1967.getImplementationAddress(proxyAddress)

        console.log(await proxyObj.getAddress(),proxyAddress,impl)

        await new Promise(resolve => setTimeout(resolve,5*1000))
        let tx = await proxyObj.InitializeFeed()
        await tx.wait()

        let price = await proxyObj.GetToUSDPriceFeed(ethers.ZeroAddress)
        console.log(price)

        //USDC 代币
        USDC = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"
        //USDC > USD  价格合约
        let USDC_2_USD = "0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E"
        tx = await proxyObj.SetToUSDPriceFeed(USDC,USDC_2_USD)
        await tx.wait()

        price = await proxyObj.GetToUSDPriceFeed(USDC);
        expect(price).to.greaterThan(90000000)
        console.log(price)

        tx = await proxyObj.SetDefaultVersion(dmts["NFTAuctionV1"].address)
        await tx.wait()

        tokenObj = await ethers.getContractAt("ERC20",USDC)

        decimals = ethers.getNumber(await tokenObj.decimals())

        let rec = await nftObj.connect(user2).transferFrom(user2.address,deployer.address,0)
        await rec.wait()
    })

    it("Auction New Function",async() =>{
        let aucId
        proxyObj.on("CreateAuctionEvent",(saddr,id,nft,tid)=>{
            aucId = id
        })
        let createTx = await proxyObj.CreateAuction(80,nftAddress,0,ethers.parseEther("0.01"))
        let createTxRec = await createTx.wait()
        expect(createTxRec).to.be.emit(proxyObj,"CreateAuctionEvent").withArgs(deployer.address,1,nftAddress,0)
        await new Promise(resolve =>{ 
            const check = setInterval(()=>{
                if(aucId !== undefined){
                    clearInterval(check)
                    resolve()
                }
            },100)
            setTimeout(resolve,5000)
        })
        console.log(aucId)
        await new Promise(resolve => setTimeout(resolve,1000))
        let auctionAddr = await proxyObj.GetAuctionAddr(aucId)
        let auctionObj = await ethers.getContractAt("NFTAuctionV1",auctionAddr)

        await auctionObj.connect(user1).BidETH({value:ethers.parseEther("0.011")})

        let approveTx = await tokenObj.connect(user2).approve(auctionAddr,50*10**decimals)
        await approveTx.wait()
        let bidTx = await auctionObj.connect(user2).BidToken(USDC,50*10**decimals)
        await bidTx.wait()

        bidTx = await auctionObj.connect(user1).BidETH({value:ethers.parseEther("0.02")})
        await bidTx.wait()

        await nftObj.approve(auctionAddr,0)
        await new Promise(resolve => setTimeout(resolve,81*1000))

        let balance = await ethers.provider.getBalance(deployer.address) + ethers.parseEther("0.02")
        let tx = await auctionObj.connect(user1).EndAuction()
        await tx.wait()
        await new Promise(resolve => setTimeout(resolve,10*1000))

        expect(await ethers.provider.getBalance(deployer.address)).to.eq(balance)
        expect(await nftObj.ownerOf(0)).to.eq(user1.address)
    })

})