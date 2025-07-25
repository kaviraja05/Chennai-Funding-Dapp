# Chennai Community Project Funding DApp

A transparent blockchain-based crowdfunding platform designed for local community initiatives in Chennai. This decentralized application (DApp) ensures transparency in donations and fund disbursement for community projects.

## Features

- Create project proposals with funding goals, descriptions, and beneficiary addresses
- Donate ETH to specific projects
- Track funds raised for each active project
- Allow project owners to withdraw collected funds
- Public traceability of all actions (project creation, donation, withdrawal)
- Web interface for browsing projects, viewing funding progress, and making donations

## Technology Stack

- **Blockchain Platform**: Ethereum/EVM Compatible Testnet
- **Smart Contract Language**: Solidity
- **Development Framework**: Hardhat
- **Frontend Libraries**: Ethers.js, Bootstrap 5
- **Frontend Technologies**: HTML, CSS, JavaScript

## Project Structure

```
project/
├── contracts/             # Smart contracts
│   └── ProjectFunding.sol # Main contract for project funding
├── scripts/               # Deployment scripts
│   ├── deploy.js          # Script to deploy the contract
│   ├── exportProjects.js  # Script to export projects to JSON
│   └── importProjects.js  # Script to import projects from JSON
├── test/                  # Test files
│   └── ProjectFunding.test.js # Tests for the contract
├── frontend/              # Frontend application
│   ├── index.html         # Main HTML file
│   ├── css/               # CSS styles
│   │   └── styles.css     # Custom styles
│   └── js/                # JavaScript files
│       ├── app.js         # Main application logic
│       ├── contract-interaction.js # Contract interaction functions
│       └── contract-config.js # Contract address configuration
├── data/                  # Data storage for project backups
│   └── projects-backup.json # Exported projects data
├── start-frontend.js      # Simple HTTP server for the frontend
├── start-dapp.bat         # One-click startup script for Windows
├── hardhat.config.js      # Hardhat configuration
└── README.md              # Project documentation
```

## Getting Started

### Prerequisites

- Node.js and npm
- MetaMask browser extension
- Git

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd chennai-community-funding
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Compile the smart contracts:
   ```
   npx hardhat compile
   ```

4. Run tests:
   ```
   npx hardhat test
   ```

5. Deploy to local network:
   ```
   npx hardhat node
   npx hardhat run scripts/deploy.js --network localhost
   ```

6. Deploy to testnet (e.g., Sepolia):
   ```
   npx hardhat run scripts/deploy.js --network sepolia
   ```

7. Update the contract address in `frontend/js/contract-config.js` with the deployed contract address.

8. Open the frontend application:
   ```
   # Use the included server script
   node start-frontend.js

   # Or use any simple HTTP server, e.g.:
   cd frontend
   npx http-server
   ```

9. For Windows users, you can use the one-click startup script:
   ```
   start-dapp.bat
   ```

## Smart Contract

The `ProjectFunding.sol` contract includes the following main functions:

- `createProject`: Create a new community project
- `donateToProject`: Donate ETH to a specific project
- `withdrawFunds`: Allow the beneficiary to withdraw collected funds
- `completeProject`: Mark a project as completed
- `toggleFundingStatus`: Pause or resume funding for a project
- Various getter functions to retrieve project and donation information

## Frontend

The frontend application provides an intuitive interface for:

- Browsing all community projects
- Creating new project proposals
- Making donations to projects
- Viewing project details and donation history
- Managing projects (for project owners)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Preserving Projects Between Contract Deployments

When you redeploy your contract, all on-chain data is lost. This DApp includes a solution to preserve your projects:

### Exporting Projects

Before redeploying your contract, export your projects:

```
npx hardhat run scripts/exportProjects.js --network localhost
```

This will save all projects to `data/projects-backup.json`.

### Importing Projects

After deploying a new contract, import your projects:

```
npx hardhat run scripts/importProjects.js --network localhost
```

This will recreate all projects from the backup file.

### Updating Contract Address

When you deploy a new contract, update the contract address in:

```
frontend/js/contract-config.js
```

## Acknowledgments

- Chennai community for inspiration
- Ethereum and Solidity developers
- Hardhat and ethers.js teams
