# Deploying to Sepolia Testnet

This guide explains how to deploy the Chennai Community Project Funding DApp to the Sepolia testnet.

## Prerequisites

1. **Infura API Key**: Sign up at [Infura](https://infura.io/) and create a new project to get an API key.

2. **Etherscan API Key**: Sign up at [Etherscan](https://etherscan.io/apis) to get an API key for contract verification.

3. **MetaMask Wallet**: Make sure you have MetaMask installed and set up with some Sepolia ETH.

4. **Sepolia ETH**: Get some Sepolia ETH from a faucet like [Sepolia Faucet](https://sepoliafaucet.com/).

## Setup

1. **Configure Environment Variables**:
   
   Edit the `.env` file in the project root:
   ```
   PRIVATE_KEY=your_wallet_private_key_here
   INFURA_API_KEY=your_infura_api_key_here
   ETHERSCAN_API_KEY=your_etherscan_api_key_here
   ```

   To get your private key from MetaMask:
   - Open MetaMask
   - Click on the three dots next to your account
   - Select "Account details"
   - Click "Export Private Key"
   - Enter your password
   - Copy the private key

   ⚠️ **IMPORTANT**: Never share your private key with anyone or commit it to a public repository!

## Deployment Steps

1. **Export Existing Projects** (if you have any on local network):
   ```
   npx hardhat run scripts/exportProjects.js --network localhost
   ```

2. **Deploy to Sepolia**:
   ```
   npx hardhat run scripts/deploy-sepolia.js --network sepolia
   ```
   This will:
   - Deploy the contract to Sepolia
   - Update the contract address in `frontend/js/contract-config.js`
   - Show the command to verify the contract

3. **Verify the Contract** (optional but recommended):
   ```
   npx hardhat verify --network sepolia YOUR_CONTRACT_ADDRESS
   ```
   Replace `YOUR_CONTRACT_ADDRESS` with the address from the previous step.

4. **Import Projects** (if you exported them in step 1):
   ```
   npx hardhat run scripts/importProjects.js --network sepolia
   ```

5. **Start the Frontend**:
   ```
   node start-frontend.js
   ```

6. **Connect MetaMask to Sepolia**:
   - Open MetaMask
   - Click on the network dropdown
   - Select "Sepolia Test Network"
   - If it's not there, go to Settings > Networks > Add Network and add Sepolia

## Troubleshooting

1. **Transaction Errors**:
   - Make sure you have enough Sepolia ETH for gas fees
   - Try increasing the gas limit in the transaction

2. **Contract Verification Errors**:
   - Make sure your Etherscan API key is correct
   - Check that the contract source code matches exactly what was deployed

3. **MetaMask Connection Issues**:
   - Make sure you're connected to the Sepolia network
   - Try resetting your account in MetaMask (Settings > Advanced > Reset Account)

## Maintaining Your DApp

Once deployed to Sepolia, your DApp will remain accessible as long as:

1. The Sepolia testnet exists (testnets can be deprecated over time)
2. You keep your frontend server running (or deploy it to a hosting service)

For a production application, you would deploy to the Ethereum mainnet and host your frontend on a service like Netlify, Vercel, or AWS.
