/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");
// Note: We're not explicitly requiring hardhat-etherscan here
// because it's already included in hardhat-toolbox

// Check if environment variables are set
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";
const INFURA_API_KEY = process.env.INFURA_API_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

// Show warning if keys are not set
if (!process.env.PRIVATE_KEY) {
  console.warn("Warning: PRIVATE_KEY not found in .env file. Using default (which won't work for deployment)");
}

if (!process.env.INFURA_API_KEY) {
  console.warn("Warning: INFURA_API_KEY not found in .env file");
}

module.exports = {
  solidity: "0.8.19",
  networks: {
    hardhat: {
      chainId: 31337
    },
    sepolia: {
      // You can use either the template string with the API key from .env
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,

      accounts: [PRIVATE_KEY],
      gasPrice: 5000000000, // Reduced from 20 gwei to 5 gwei
      gas: 3000000,        // Reduced from 6000000 to 3000000
      // These lower values should make deployment cheaper
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  }
};
