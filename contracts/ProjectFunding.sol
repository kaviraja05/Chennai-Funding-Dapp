// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ProjectFunding
 * @dev A contract for transparent community project funding in Chennai
 */
contract ProjectFunding {
    // Project structure
    struct Project {
        uint256 id;
        string name;
        string description;
        string location; // Location in Chennai
        uint256 fundingGoal;
        uint256 fundsRaised;
        address payable beneficiary;
        bool isCompleted;
        bool isFundingActive;
        uint256 createdAt;
    }

    // Donation structure
    struct Donation {
        address donor;
        uint256 projectId;
        uint256 amount;
        uint256 timestamp;
    }

    // Withdrawal structure
    struct Withdrawal {
        address beneficiary;
        uint256 projectId;
        uint256 amount;
        uint256 timestamp;
    }

    // State variables
    uint256 private projectCounter;
    mapping(uint256 => Project) public projects;
    mapping(uint256 => Donation[]) public projectDonations;
    mapping(uint256 => Withdrawal[]) public projectWithdrawals;
    mapping(address => uint256[]) public userDonatedProjects;
    mapping(address => uint256[]) public userCreatedProjects;

    // Events
    event ProjectCreated(
        uint256 indexed projectId,
        string name,
        address indexed beneficiary,
        uint256 fundingGoal,
        uint256 timestamp
    );

    event DonationReceived(
        uint256 indexed projectId,
        address indexed donor,
        uint256 amount,
        uint256 timestamp
    );

    event FundsWithdrawn(
        uint256 indexed projectId,
        address indexed beneficiary,
        uint256 amount,
        uint256 timestamp
    );

    event ProjectCompleted(
        uint256 indexed projectId,
        uint256 timestamp
    );

    event FundingStatusChanged(
        uint256 indexed projectId,
        bool isFundingActive,
        uint256 timestamp
    );

    /**
     * @dev Creates a new project
     * @param _name Project name
     * @param _description Project description
     * @param _location Project location in Chennai
     * @param _fundingGoal Funding goal in wei
     * @param _beneficiary Address that will receive the funds
     */
    function createProject(
        string memory _name,
        string memory _description,
        string memory _location,
        uint256 _fundingGoal,
        address payable _beneficiary
    ) external returns (uint256) {
        require(bytes(_name).length > 0, "Project name cannot be empty");
        require(bytes(_description).length > 0, "Project description cannot be empty");
        require(bytes(_location).length > 0, "Project location cannot be empty");
        require(_fundingGoal > 0, "Funding goal must be greater than 0");
        require(_beneficiary != address(0), "Invalid beneficiary address");

        projectCounter++;
        uint256 projectId = projectCounter;

        Project memory newProject = Project({
            id: projectId,
            name: _name,
            description: _description,
            location: _location,
            fundingGoal: _fundingGoal,
            fundsRaised: 0,
            beneficiary: _beneficiary,
            isCompleted: false,
            isFundingActive: true,
            createdAt: block.timestamp
        });

        projects[projectId] = newProject;
        userCreatedProjects[msg.sender].push(projectId);

        emit ProjectCreated(
            projectId,
            _name,
            _beneficiary,
            _fundingGoal,
            block.timestamp
        );

        return projectId;
    }

    /**
     * @dev Allows users to donate to a project
     * @param _projectId ID of the project to donate to
     */
    function donateToProject(uint256 _projectId) external payable {
        require(_projectId > 0 && _projectId <= projectCounter, "Invalid project ID");
        require(msg.value > 0, "Donation amount must be greater than 0");
        
        Project storage project = projects[_projectId];
        require(project.isFundingActive, "Project funding is not active");
        require(!project.isCompleted, "Project is already completed");

        project.fundsRaised += msg.value;
        
        Donation memory newDonation = Donation({
            donor: msg.sender,
            projectId: _projectId,
            amount: msg.value,
            timestamp: block.timestamp
        });
        
        projectDonations[_projectId].push(newDonation);
        
        // Add to user's donated projects if not already in the list
        bool alreadyDonated = false;
        for (uint i = 0; i < userDonatedProjects[msg.sender].length; i++) {
            if (userDonatedProjects[msg.sender][i] == _projectId) {
                alreadyDonated = true;
                break;
            }
        }
        
        if (!alreadyDonated) {
            userDonatedProjects[msg.sender].push(_projectId);
        }
        
        emit DonationReceived(
            _projectId,
            msg.sender,
            msg.value,
            block.timestamp
        );
    }

    /**
     * @dev Allows the beneficiary to withdraw funds
     * @param _projectId ID of the project to withdraw funds from
     */
    function withdrawFunds(uint256 _projectId) external {
        require(_projectId > 0 && _projectId <= projectCounter, "Invalid project ID");
        
        Project storage project = projects[_projectId];
        require(msg.sender == project.beneficiary, "Only the beneficiary can withdraw funds");
        require(project.fundsRaised > 0, "No funds available to withdraw");
        
        uint256 amount = project.fundsRaised;
        project.fundsRaised = 0;
        
        Withdrawal memory newWithdrawal = Withdrawal({
            beneficiary: msg.sender,
            projectId: _projectId,
            amount: amount,
            timestamp: block.timestamp
        });
        
        projectWithdrawals[_projectId].push(newWithdrawal);
        
        emit FundsWithdrawn(
            _projectId,
            msg.sender,
            amount,
            block.timestamp
        );
        
        project.beneficiary.transfer(amount);
    }

    /**
     * @dev Marks a project as completed
     * @param _projectId ID of the project to mark as completed
     */
    function completeProject(uint256 _projectId) external {
        require(_projectId > 0 && _projectId <= projectCounter, "Invalid project ID");
        
        Project storage project = projects[_projectId];
        require(msg.sender == project.beneficiary, "Only the beneficiary can complete the project");
        require(!project.isCompleted, "Project is already completed");
        
        project.isCompleted = true;
        project.isFundingActive = false;
        
        emit ProjectCompleted(_projectId, block.timestamp);
    }

    /**
     * @dev Toggles the funding status of a project
     * @param _projectId ID of the project to toggle funding status
     * @param _isFundingActive New funding status
     */
    function toggleFundingStatus(uint256 _projectId, bool _isFundingActive) external {
        require(_projectId > 0 && _projectId <= projectCounter, "Invalid project ID");
        
        Project storage project = projects[_projectId];
        require(msg.sender == project.beneficiary, "Only the beneficiary can change funding status");
        require(!project.isCompleted, "Cannot change funding status of completed project");
        require(project.isFundingActive != _isFundingActive, "Funding status is already set to the requested value");
        
        project.isFundingActive = _isFundingActive;
        
        emit FundingStatusChanged(_projectId, _isFundingActive, block.timestamp);
    }

    /**
     * @dev Gets all projects
     * @return Array of all projects
     */
    function getAllProjects() external view returns (Project[] memory) {
        Project[] memory allProjects = new Project[](projectCounter);
        
        for (uint256 i = 1; i <= projectCounter; i++) {
            allProjects[i - 1] = projects[i];
        }
        
        return allProjects;
    }

    /**
     * @dev Gets all donations for a project
     * @param _projectId ID of the project
     * @return Array of all donations for the project
     */
    function getProjectDonations(uint256 _projectId) external view returns (Donation[] memory) {
        require(_projectId > 0 && _projectId <= projectCounter, "Invalid project ID");
        return projectDonations[_projectId];
    }

    /**
     * @dev Gets all withdrawals for a project
     * @param _projectId ID of the project
     * @return Array of all withdrawals for the project
     */
    function getProjectWithdrawals(uint256 _projectId) external view returns (Withdrawal[] memory) {
        require(_projectId > 0 && _projectId <= projectCounter, "Invalid project ID");
        return projectWithdrawals[_projectId];
    }

    /**
     * @dev Gets all projects created by a user
     * @param _user Address of the user
     * @return Array of project IDs created by the user
     */
    function getUserCreatedProjects(address _user) external view returns (uint256[] memory) {
        return userCreatedProjects[_user];
    }

    /**
     * @dev Gets all projects donated to by a user
     * @param _user Address of the user
     * @return Array of project IDs donated to by the user
     */
    function getUserDonatedProjects(address _user) external view returns (uint256[] memory) {
        return userDonatedProjects[_user];
    }
}
