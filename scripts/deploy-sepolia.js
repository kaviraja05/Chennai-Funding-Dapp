const fs = require("fs");
const path = require("path");

async function main() {
  try {
    console.log("Deploying ProjectFunding contract to Sepolia...");

    // Get the contract factory
    const ProjectFunding = await ethers.getContractFactory("ProjectFunding");

    // Deploy the contract with explicit gas options
    console.log("Deploying with reduced gas settings...");

    // Check which version of ethers we're using
    const gasPrice = ethers.parseUnits ?
                    ethers.parseUnits('5', 'gwei') : // ethers v6
                    ethers.utils.parseUnits('5', 'gwei'); // ethers v5

    const projectFunding = await ProjectFunding.deploy({
      gasPrice: gasPrice,
      gasLimit: 3000000
    });

    // Wait for deployment to complete
    await projectFunding.waitForDeployment();

    // Get the contract address
    const contractAddress = await projectFunding.getAddress();
    console.log("ProjectFunding deployed to:", contractAddress);

    // Update the contract-config.js file
    const configPath = path.join(__dirname, "../frontend/js/contract-config.js");
    const configContent = `// Contract configuration
module.exports = {
  contractAddress: "${contractAddress}"
};
`;

    fs.writeFileSync(configPath, configContent);
    console.log(`Contract address updated in ${configPath}`);

    // Log verification command
    console.log("\nTo verify the contract on Etherscan, run:");
    console.log(`npx hardhat verify --network sepolia ${contractAddress}`);

    // Try to verify the contract automatically
    try {
        console.log("\nAttempting to verify contract automatically...");
        await hre.run("verify:verify", {
            address: contractAddress,
            constructorArguments: []
        });
        console.log("Contract verified successfully!");
    } catch (verifyError) {
        console.log("Automatic verification failed. You can try manually with the command above.");
        console.error("Verification error:", verifyError.message);
    }

    // Check if there's a backup file to import
    const backupPath = path.join(__dirname, "../data/projects-backup.json");
    if (fs.existsSync(backupPath)) {
      console.log("\nFound projects backup file. To import projects to the new contract, run:");
      console.log("npx hardhat run scripts/importProjects.js --network sepolia");
    }

  } catch (error) {
    console.error("Error deploying contract:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
