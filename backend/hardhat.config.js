require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  networks: {
    sepolia: {
      url: "https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID",
      accounts: []
    }
  }
};