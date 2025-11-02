const { deployments, ethers, network } = require("hardhat")
const { expect } = require("chai")

network.name == "sepolia" ? describe.skip :
describe("Auction Factory New Function",async() =>{
    let factoryV1Obj
    beforeEach(async()=>{
        let dmts = await deployments.fixture(["AuctionFactoryV1"])
        factoryV1Obj = await ethers.getContractAt("AuctionFactoryV1",dmts["AuctionFactoryV1"].address)
    })
    it("Price Feed Test",async()=>{
        //USDC          0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
        let USDC = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"
        //USDC > USD    0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E
        let USDC_2_USD = "0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E"
        await factoryV1Obj.SetToUSDPriceFeed(USDC,USDC_2_USD)

        let price = await factoryV1Obj.GetToUSDPriceFeed(ethers.ZeroAddress);
        console.log("ETH -> USD Price:",price)
        expect(price).to.greaterThan(100000000)

        price = await factoryV1Obj.GetToUSDPriceFeed(USDC);  //添加新的货币支付种类
        console.log("USDC -> USD Price:",price)
        expect(price).to.greaterThan(90000000)
        expect(price).to.lessThan(110000000)
        let token20 = await ethers.getContractAt("ERC20",USDC)
        console.log(await token20.decimals())
    })
})