
# sepolia 合约部署地址
基础拍卖功能 NFTAuction 实现合约地址 0x3aCf45C7a580C9ABD37F200138083427C875e53b

拍卖工厂 AuctionFactory 实现合约合约地址 0x339cf73C38c6859F67BE6eFEB2dAe8A46f9727BC

拍卖工厂代理地址    0x5Da9885e30CBdbB2F9902822006CF1083AE1ec88

升级后 NFTAuctionV1 实现合约地址 0xc3673fb16E071679E25230913626dcf6FEe6b575

升级后 AuctionFactoryV1 实现合约地址 0x339cf73C38c6859F67BE6eFEB2dAe8A46f9727BC

# 本地测试

安装依赖

```
npm install
```

运行项目test目录下所有单元测试 执行指令
```
npx hardhat test
```
# 测试报告
执行下面命令 生成测试报告
报告内容在项目 coverage 目录下
```
npx hardhat coverage
```

# 测试网集成测试
创建.env文件    配置测试用户
```
API_KEY =  
ACCOUNT1_KEY = 
ACCOUNT2_KEY = 
ACCOUNT3_KEY = 
```

运行指令    脚本文件 test/integration/Integration_Test.js
```
npx hardhat test --network sepolia
```
测试流程内容 
1.初始部署
2.进行拍卖
3.代理升级 同时升级工厂和拍卖逻辑
4.再拍卖 测试新功能
