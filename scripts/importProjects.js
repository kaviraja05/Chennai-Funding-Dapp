const fs = require("fs");
const path = require("path");

async function main() {
  try {
    // Get network information
    const network = await ethers.provider.getNetwork();
    console.log(`Importing projects to ${network.name} (Chain ID: ${network.chainId})`);

    // Get the deployed contract
    const ProjectFunding = await ethers.getContractFactory("ProjectFunding");
    const contractAddress = require("../frontend/js/contract-config.js").contractAddress;
    const contract = await ProjectFunding.attach(contractAddress);

    console.log(`Connected to contract at ${contractAddress}`);

    // Read the backup file
    const backupPath = path.join(__dirname, "../data/projects-backup.json");

    if (!fs.existsSync(backupPath)) {
      console.error(`Backup file not found at ${backupPath}`);
      return;
    }

    const projects = JSON.parse(fs.readFileSync(backupPath));
    console.log(`Found ${projects.length} projects to import`);

    // Get the first account to use as the sender
    const [deployer] = await ethers.getSigners();

    // Import each project
    for (const project of projects) {
      console.log(`Importing project: ${project.name}`);

      // Create the project
      const tx = await contract.connect(deployer).createProject(
        project.name,
        project.description,
        project.location,
        project.fundingGoal,
        project.beneficiary
      );

      const receipt = await tx.wait();
      console.log(`Project created: ${project.name}`);

      // Get the project ID from the event logs
      let projectId;
      if (receipt && receipt.events) {
        const projectCreatedEvent = receipt.events.find(e => e.event === 'ProjectCreated');
        if (projectCreatedEvent && projectCreatedEvent.args) {
          projectId = projectCreatedEvent.args.projectId;
          console.log(`New project ID from event: ${projectId}`);
        }
      }

      if (!projectId) {
        // If we couldn't get the ID from events, try to find it by checking projects
        console.log("Couldn't get project ID from events, trying to find it manually...");
        let foundId = false;

        // Start from a reasonable ID (1) and check each project
        for (let i = 1; i <= 100 && !foundId; i++) {
          try {
            const checkProject = await contract.projects(i);
            if (checkProject.name === project.name &&
                checkProject.description === project.description &&
                checkProject.location === project.location) {
              projectId = i;
              foundId = true;
              console.log(`Found project ID manually: ${projectId}`);
            }
          } catch (error) {
            // Skip errors, just keep trying
          }
        }
      }

      if (!projectId) {
        console.log("WARNING: Could not determine project ID, skipping status updates");
        continue; // Skip to the next project
      }

      // If the project was not active, update its status
      if (!project.isFundingActive) {
        await contract.connect(deployer).toggleFundingStatus(projectId, false);
        console.log(`Project funding status set to inactive`);
      }

      // If the project was completed, mark it as completed
      if (project.isCompleted) {
        await contract.connect(deployer).completeProject(projectId);
        console.log(`Project marked as completed`);
      }
    }

    console.log(`Successfully imported ${projects.length} projects`);
  } catch (error) {
    console.error("Error importing projects:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
