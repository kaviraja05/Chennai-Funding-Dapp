const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ProjectFunding", function () {
  let ProjectFunding;
  let projectFunding;
  let owner;
  let beneficiary;
  let donor1;
  let donor2;
  
  const PROJECT_NAME = "Chennai Beach Cleanup";
  const PROJECT_DESCRIPTION = "Community initiative to clean up Marina Beach";
  const PROJECT_LOCATION = "Marina Beach, Chennai";
  const FUNDING_GOAL = ethers.parseEther("1"); // 1 ETH
  
  beforeEach(async function () {
    [owner, beneficiary, donor1, donor2] = await ethers.getSigners();
    
    ProjectFunding = await ethers.getContractFactory("ProjectFunding");
    projectFunding = await ProjectFunding.deploy();
    await projectFunding.waitForDeployment();
  });
  
  describe("Project Creation", function () {
    it("Should create a new project", async function () {
      await expect(
        projectFunding.createProject(
          PROJECT_NAME,
          PROJECT_DESCRIPTION,
          PROJECT_LOCATION,
          FUNDING_GOAL,
          beneficiary.address
        )
      )
        .to.emit(projectFunding, "ProjectCreated")
        .withArgs(1, PROJECT_NAME, beneficiary.address, FUNDING_GOAL, await time.latest());
      
      const project = await projectFunding.projects(1);
      expect(project.name).to.equal(PROJECT_NAME);
      expect(project.description).to.equal(PROJECT_DESCRIPTION);
      expect(project.location).to.equal(PROJECT_LOCATION);
      expect(project.fundingGoal).to.equal(FUNDING_GOAL);
      expect(project.beneficiary).to.equal(beneficiary.address);
      expect(project.isCompleted).to.be.false;
      expect(project.isFundingActive).to.be.true;
    });
    
    it("Should not create a project with empty name", async function () {
      await expect(
        projectFunding.createProject(
          "",
          PROJECT_DESCRIPTION,
          PROJECT_LOCATION,
          FUNDING_GOAL,
          beneficiary.address
        )
      ).to.be.revertedWith("Project name cannot be empty");
    });
    
    it("Should not create a project with zero funding goal", async function () {
      await expect(
        projectFunding.createProject(
          PROJECT_NAME,
          PROJECT_DESCRIPTION,
          PROJECT_LOCATION,
          0,
          beneficiary.address
        )
      ).to.be.revertedWith("Funding goal must be greater than 0");
    });
  });
  
  describe("Donations", function () {
    beforeEach(async function () {
      await projectFunding.createProject(
        PROJECT_NAME,
        PROJECT_DESCRIPTION,
        PROJECT_LOCATION,
        FUNDING_GOAL,
        beneficiary.address
      );
    });
    
    it("Should allow donations to a project", async function () {
      const donationAmount = ethers.parseEther("0.5");
      
      await expect(
        projectFunding.connect(donor1).donateToProject(1, { value: donationAmount })
      )
        .to.emit(projectFunding, "DonationReceived")
        .withArgs(1, donor1.address, donationAmount, await time.latest());
      
      const project = await projectFunding.projects(1);
      expect(project.fundsRaised).to.equal(donationAmount);
      
      const donatedProjects = await projectFunding.getUserDonatedProjects(donor1.address);
      expect(donatedProjects.length).to.equal(1);
      expect(donatedProjects[0]).to.equal(1);
    });
    
    it("Should not allow donations to non-existent projects", async function () {
      await expect(
        projectFunding.connect(donor1).donateToProject(999, { value: ethers.parseEther("0.5") })
      ).to.be.revertedWith("Invalid project ID");
    });
    
    it("Should not allow zero donations", async function () {
      await expect(
        projectFunding.connect(donor1).donateToProject(1, { value: 0 })
      ).to.be.revertedWith("Donation amount must be greater than 0");
    });
  });
  
  describe("Fund Withdrawals", function () {
    beforeEach(async function () {
      await projectFunding.createProject(
        PROJECT_NAME,
        PROJECT_DESCRIPTION,
        PROJECT_LOCATION,
        FUNDING_GOAL,
        beneficiary.address
      );
      
      await projectFunding.connect(donor1).donateToProject(1, { value: ethers.parseEther("0.5") });
    });
    
    it("Should allow beneficiary to withdraw funds", async function () {
      const initialBalance = await ethers.provider.getBalance(beneficiary.address);
      
      await expect(projectFunding.connect(beneficiary).withdrawFunds(1))
        .to.emit(projectFunding, "FundsWithdrawn")
        .withArgs(1, beneficiary.address, ethers.parseEther("0.5"), await time.latest());
      
      const finalBalance = await ethers.provider.getBalance(beneficiary.address);
      expect(finalBalance).to.be.gt(initialBalance);
      
      const project = await projectFunding.projects(1);
      expect(project.fundsRaised).to.equal(0);
    });
    
    it("Should not allow non-beneficiary to withdraw funds", async function () {
      await expect(
        projectFunding.connect(donor1).withdrawFunds(1)
      ).to.be.revertedWith("Only the beneficiary can withdraw funds");
    });
  });
  
  describe("Project Completion", function () {
    beforeEach(async function () {
      await projectFunding.createProject(
        PROJECT_NAME,
        PROJECT_DESCRIPTION,
        PROJECT_LOCATION,
        FUNDING_GOAL,
        beneficiary.address
      );
    });
    
    it("Should allow beneficiary to complete a project", async function () {
      await expect(projectFunding.connect(beneficiary).completeProject(1))
        .to.emit(projectFunding, "ProjectCompleted")
        .withArgs(1, await time.latest());
      
      const project = await projectFunding.projects(1);
      expect(project.isCompleted).to.be.true;
      expect(project.isFundingActive).to.be.false;
    });
    
    it("Should not allow non-beneficiary to complete a project", async function () {
      await expect(
        projectFunding.connect(donor1).completeProject(1)
      ).to.be.revertedWith("Only the beneficiary can complete the project");
    });
  });
  
  describe("Funding Status", function () {
    beforeEach(async function () {
      await projectFunding.createProject(
        PROJECT_NAME,
        PROJECT_DESCRIPTION,
        PROJECT_LOCATION,
        FUNDING_GOAL,
        beneficiary.address
      );
    });
    
    it("Should allow beneficiary to toggle funding status", async function () {
      await expect(projectFunding.connect(beneficiary).toggleFundingStatus(1, false))
        .to.emit(projectFunding, "FundingStatusChanged")
        .withArgs(1, false, await time.latest());
      
      const project = await projectFunding.projects(1);
      expect(project.isFundingActive).to.be.false;
      
      await expect(projectFunding.connect(beneficiary).toggleFundingStatus(1, true))
        .to.emit(projectFunding, "FundingStatusChanged")
        .withArgs(1, true, await time.latest());
      
      const updatedProject = await projectFunding.projects(1);
      expect(updatedProject.isFundingActive).to.be.true;
    });
    
    it("Should not allow non-beneficiary to toggle funding status", async function () {
      await expect(
        projectFunding.connect(donor1).toggleFundingStatus(1, false)
      ).to.be.revertedWith("Only the beneficiary can change funding status");
    });
  });
});
