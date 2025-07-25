const fs = require("fs");
const path = require("path");

async function main() {
  try {
    // Get network information
    const network = await ethers.provider.getNetwork();
    console.log(`Exporting projects from ${network.name} (Chain ID: ${network.chainId})`);

    // Get the deployed contract
    const ProjectFunding = await ethers.getContractFactory("ProjectFunding");
    const contractAddress = require("../frontend/js/contract-config.js").contractAddress;
    const contract = await ProjectFunding.attach(contractAddress);

    console.log(`Connected to contract at ${contractAddress}`);

    // We'll use a different approach since getAllProjects() might not be working
    // First, let's try to find how many projects exist by trying project IDs
    let projectCounter = 0;
    let foundProjects = true;
    const projects = [];

    // Start from ID 1 and keep going until we hit an invalid ID
    for (let i = 1; foundProjects; i++) {
      try {
        // Try to get the project at this ID
        const project = await contract.projects(i);

        // If we get here, the project exists
        console.log(`Found project ${i}: ${project.name}`);
        projectCounter++;

        // Format the project data
        projects.push({
          id: project.id.toString(),
          name: project.name,
          description: project.description,
          location: project.location,
          fundingGoal: project.fundingGoal.toString(),
          fundsRaised: project.fundsRaised.toString(),
          beneficiary: project.beneficiary,
          isCompleted: project.isCompleted,
          isFundingActive: project.isFundingActive,
          createdAt: project.createdAt.toString()
        });
      } catch (error) {
        // If we get an error, we've reached the end of the projects
        console.log(`No more projects found after ID ${i-1}`);
        foundProjects = false;
      }
    }

    console.log(`Found ${projectCounter} projects`);

    if (projectCounter === 0) {
      console.log("No projects to export");
      return;
    }

    // Save to file
    const backupPath = path.join(__dirname, "../data");

    // Create the data directory if it doesn't exist
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
    }

    const filePath = path.join(backupPath, "projects-backup.json");
    fs.writeFileSync(filePath, JSON.stringify(projects, null, 2));

    console.log(`Successfully exported ${projects.length} projects to ${filePath}`);
  } catch (error) {
    console.error("Error exporting projects:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
