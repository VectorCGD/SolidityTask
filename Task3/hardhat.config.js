require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("@openzeppelin/hardhat-upgrades");
require("dotenv").config()
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  //defaultNetwork: "localhost",
  solidity: "0.8.28",
  networks: {
    hardhat: {
      forking: {  
        url: `https://sepolia.infura.io/v3/${process.env.API_KEY}`
      },
      chainId: 31337
    },
    sepolia:{
      url: `https://sepolia.infura.io/v3/${process.env.API_KEY}`,
      accounts: [
        process.env.ACCOUNT1_KEY,
        process.env.ACCOUNT2_KEY,
        process.env.ACCOUNT3_KEY,
      ],
      chainId: 11155111
    }
  },
  mocha:{
    timeout: 200000
  },
  gasReporter:{
    enabled: false
  } 
};