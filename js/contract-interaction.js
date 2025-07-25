// Contract ABI (will be replaced with actual ABI after compilation)
const contractABI =  [
  {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "projectId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "donor",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "DonationReceived",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "projectId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "isFundingActive",
          "type": "bool"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "FundingStatusChanged",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "projectId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "beneficiary",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "FundsWithdrawn",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "projectId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "ProjectCompleted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "projectId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "beneficiary",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "fundingGoal",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "ProjectCreated",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_projectId",
          "type": "uint256"
        }
      ],
      "name": "completeProject",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_description",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_location",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "_fundingGoal",
          "type": "uint256"
        },
        {
          "internalType": "address payable",
          "name": "_beneficiary",
          "type": "address"
        }
      ],
      "name": "createProject",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_projectId",
          "type": "uint256"
        }
      ],
      "name": "donateToProject",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAllProjects",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "description",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "location",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "fundingGoal",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "fundsRaised",
              "type": "uint256"
            },
            {
              "internalType": "address payable",
              "name": "beneficiary",
              "type": "address"
            },
            {
              "internalType": "bool",
              "name": "isCompleted",
              "type": "bool"
            },
            {
              "internalType": "bool",
              "name": "isFundingActive",
              "type": "bool"
            },
            {
              "internalType": "uint256",
              "name": "createdAt",
              "type": "uint256"
            }
          ],
          "internalType": "struct ProjectFunding.Project[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_projectId",
          "type": "uint256"
        }
      ],
      "name": "getProjectDonations",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "donor",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "projectId",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            }
          ],
          "internalType": "struct ProjectFunding.Donation[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_projectId",
          "type": "uint256"
        }
      ],
      "name": "getProjectWithdrawals",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "beneficiary",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "projectId",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            }
          ],
          "internalType": "struct ProjectFunding.Withdrawal[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_user",
          "type": "address"
        }
      ],
      "name": "getUserCreatedProjects",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_user",
          "type": "address"
        }
      ],
      "name": "getUserDonatedProjects",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "projectDonations",
      "outputs": [
        {
          "internalType": "address",
          "name": "donor",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "projectId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "projectWithdrawals",
      "outputs": [
        {
          "internalType": "address",
          "name": "beneficiary",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "projectId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "projects",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "description",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "location",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "fundingGoal",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "fundsRaised",
          "type": "uint256"
        },
        {
          "internalType": "address payable",
          "name": "beneficiary",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "isCompleted",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "isFundingActive",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "createdAt",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_projectId",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "_isFundingActive",
          "type": "bool"
        }
      ],
      "name": "toggleFundingStatus",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "userCreatedProjects",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "userDonatedProjects",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_projectId",
          "type": "uint256"
        }
      ],
      "name": "withdrawFunds",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
];

// Project details modal functionality
function openProjectDetails(project, isOwner = false) {
    const modal = new bootstrap.Modal(document.getElementById('project-details-modal'));
    const modalTitle = document.getElementById('modal-project-title');
    const projectDetailsContent = document.getElementById('project-details-content');

    // Set modal title
    modalTitle.textContent = project.name;

    // Calculate funding percentage
    const fundingPercentage = (project.fundsRaised * 100 / project.fundingGoal).toFixed(2);

    // Determine project status
    const statusClass = project.isCompleted ? 'status-completed' :
                       (project.isFundingActive ? 'status-active' : 'status-paused');
    const statusText = project.isCompleted ? 'Completed' :
                      (project.isFundingActive ? 'Active' : 'Paused');

    // Format dates
    const createdDate = new Date(project.createdAt * 1000).toLocaleDateString();

    // Get project category (if available)
    const projectCategory = project.category || 'General';

    // Set project details content with tabs
    projectDetailsContent.innerHTML = `
        <ul class="nav nav-tabs" id="projectDetailTabs" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="details-tab" data-bs-toggle="tab" data-bs-target="#details" type="button" role="tab">Details</button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="donations-tab" data-bs-toggle="tab" data-bs-target="#donations" type="button" role="tab">Donations</button>
            </li>
            ${isOwner ? `
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="manage-tab" data-bs-toggle="tab" data-bs-target="#manage" type="button" role="tab">Manage</button>
            </li>
            ` : ''}
        </ul>

        <div class="tab-content p-3 border border-top-0 rounded-bottom" id="projectDetailTabsContent">
            <div class="tab-pane fade show active" id="details" role="tabpanel">
                <div class="project-details">
                    <div class="mb-3">
                        <span class="status-badge ${statusClass} float-end">${statusText}</span>
                        <h4>${project.name}</h4>
                        <p class="text-muted">${project.location}</p>
                        <span class="category-tag">${projectCategory}</span>
                    </div>

                    <div class="mb-3">
                        <h5>Description</h5>
                        <p>${project.description}</p>
                    </div>

                    <div class="mb-3">
                        <h5>Funding Progress</h5>
                        <div class="progress mb-2">
                            <div class="progress-bar" role="progressbar" style="width: ${fundingPercentage}%"
                                aria-valuenow="${fundingPercentage}" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                        <div class="funding-stats">
                            <span>${ethers.utils.formatEther(project.fundsRaised)} ETH raised</span>
                            <span>${fundingPercentage}% of ${ethers.utils.formatEther(project.fundingGoal)} ETH goal</span>
                        </div>
                    </div>

                    <div class="project-stats">
                        <div class="stat-item">
                            <h6>Beneficiary</h6>
                            <p class="address-display">${project.beneficiary}</p>
                        </div>
                        <div class="stat-item">
                            <h6>Created On</h6>
                            <p>${createdDate}</p>
                        </div>
                    </div>

                    ${!project.isCompleted && project.isFundingActive ? `
                    <div class="mt-4">
                        <h5>Make a Donation</h5>
                        <form id="donation-form">
                            <div class="mb-3">
                                <label for="donation-amount" class="form-label">Amount (ETH)</label>
                                <input type="number" step="0.001" class="form-control" id="donation-amount" required>
                            </div>
                            <button type="submit" class="btn btn-primary">Donate</button>
                        </form>
                    </div>
                    ` : ''}
                </div>
            </div>

            <div class="tab-pane fade" id="donations" role="tabpanel">
                <div class="donation-history" id="donation-history">
                    <div class="text-center p-3">
                        <div class="spinner-border spinner-border-sm" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        Loading donation history...
                    </div>
                </div>
            </div>

            ${isOwner ? `
            <div class="tab-pane fade" id="manage" role="tabpanel">
                <div class="project-management">
                    <h5 class="mb-3">Project Management</h5>
                    <div class="d-grid gap-2">
                        <button id="withdraw-funds" class="btn btn-success" ${project.fundsRaised.eq(0) ? 'disabled' : ''}>
                            Withdraw Funds (${ethers.utils.formatEther(project.fundsRaised)} ETH)
                        </button>
                        <button id="toggle-funding" class="btn btn-warning" ${project.isCompleted ? 'disabled' : ''}>
                            ${project.isFundingActive ? 'Pause Funding' : 'Resume Funding'}
                        </button>
                        <button id="complete-project" class="btn btn-danger" ${project.isCompleted ? 'disabled' : ''}>
                            Mark as Completed
                        </button>
                    </div>

                    <div class="mt-4">
                        <h5>Project Statistics</h5>
                        <div class="table-responsive">
                            <table class="table table-bordered">
                                <tbody>
                                    <tr>
                                        <th>Total Donations</th>
                                        <td id="total-donations">Loading...</td>
                                    </tr>
                                    <tr>
                                        <th>Unique Donors</th>
                                        <td id="unique-donors">Loading...</td>
                                    </tr>
                                    <tr>
                                        <th>Funds Withdrawn</th>
                                        <td id="funds-withdrawn">Loading...</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            ` : ''}
        </div>
    `;

    // Set up donation form submission if available
    // Note: We're not setting up the donation form handler here anymore
    // because it's now handled in app.js with handleDonationSubmit
    // This prevents conflicts between the two handlers

    // Set up project management buttons if owner
    if (isOwner) {
        setupProjectManagementButtons(project);
        loadProjectStatistics(project.id);
    }

    // Load donation history
    loadDonationHistory(project.id);

    // Show the modal
    modal.show();
}

// Setup project management buttons
function setupProjectManagementButtons(project) {
    const withdrawFundsBtn = document.getElementById('withdraw-funds');
    const toggleFundingBtn = document.getElementById('toggle-funding');
    const completeProjectBtn = document.getElementById('complete-project');

    // Set up event handlers
    withdrawFundsBtn.onclick = async () => {
        if (confirm('Are you sure you want to withdraw all available funds from this project?')) {
            await handleWithdrawal(project.id);
        }
    };

    toggleFundingBtn.onclick = async () => {
        const action = project.isFundingActive ? 'pause' : 'resume';
        if (confirm(`Are you sure you want to ${action} funding for this project?`)) {
            await handleToggleFunding(project.id, !project.isFundingActive);
        }
    };

    completeProjectBtn.onclick = async () => {
        if (confirm('Are you sure you want to mark this project as completed? This action cannot be undone.')) {
            await handleCompleteProject(project.id);
        }
    };
}

// Load project statistics for the management tab
async function loadProjectStatistics(projectId) {
    try {
        // Get donation history
        const donations = await projectFundingContract.getProjectDonations(projectId);

        // Get withdrawal history
        const withdrawals = await projectFundingContract.getProjectWithdrawals(projectId);

        // Calculate statistics
        const totalDonations = donations.length;

        // Get unique donors
        const uniqueDonors = new Set();
        let totalDonated = ethers.BigNumber.from(0);

        donations.forEach(donation => {
            uniqueDonors.add(donation.donor);
            totalDonated = totalDonated.add(donation.amount);
        });

        // Calculate total withdrawn
        let totalWithdrawn = ethers.BigNumber.from(0);
        withdrawals.forEach(withdrawal => {
            totalWithdrawn = totalWithdrawn.add(withdrawal.amount);
        });

        // Update the UI
        document.getElementById('total-donations').textContent = totalDonations;
        document.getElementById('unique-donors').textContent = uniqueDonors.size;
        document.getElementById('funds-withdrawn').textContent = `${ethers.utils.formatEther(totalWithdrawn)} ETH`;

    } catch (error) {
        console.error('Error loading project statistics:', error);
        document.getElementById('total-donations').textContent = 'Error loading data';
        document.getElementById('unique-donors').textContent = 'Error loading data';
        document.getElementById('funds-withdrawn').textContent = 'Error loading data';
    }
}

// Load donation history for a project
async function loadDonationHistory(projectId) {
    const donationHistoryContainer = document.getElementById('donation-history');

    try {
        const donations = await projectFundingContract.getProjectDonations(projectId);

        if (donations.length === 0) {
            donationHistoryContainer.innerHTML = `
                <div class="alert alert-info">
                    No donations have been made to this project yet.
                </div>
            `;
            return;
        }

        donationHistoryContainer.innerHTML = `
            <div class="table-responsive">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Donor</th>
                            <th>Amount</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody id="donations-table-body">
                    </tbody>
                </table>
            </div>
        `;

        const tableBody = document.getElementById('donations-table-body');

        donations.forEach(donation => {
            const donationDate = new Date(donation.timestamp * 1000).toLocaleDateString();
            const row = document.createElement('tr');

            row.innerHTML = `
                <td><span class="truncate">${donation.donor}</span></td>
                <td>${ethers.utils.formatEther(donation.amount)} ETH</td>
                <td>${donationDate}</td>
            `;

            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Error loading donation history:', error);
        donationHistoryContainer.innerHTML = `
            <div class="alert alert-danger">
                Error loading donation history: ${error.message}
            </div>
        `;
    }
}

// Handle donation to a project
async function handleDonation(projectId) {
    try {
        const donationAmount = document.getElementById('donation-amount').value;

        if (!donationAmount || parseFloat(donationAmount) <= 0) {
            alert('Please enter a valid donation amount');
            return;
        }

        const donationAmountWei = ethers.utils.parseEther(donationAmount);

        const donateButton = document.querySelector('#donation-form button[type="submit"]');
        donateButton.disabled = true;
        donateButton.innerHTML = `
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Processing...
        `;

        // Get a fresh signer and connect it to the contract
        const signer = await provider.getSigner();
        const contractWithSigner = projectFundingContract.connect(signer);

        console.log(`Donating ${donationAmount} ETH to project ${projectId}`);

        // Add explicit gas limit and higher gas price
        const tx = await contractWithSigner.donateToProject(projectId, {
            value: donationAmountWei,
            gasLimit: 500000,  // Increase gas limit
            gasPrice: ethers.utils.parseUnits('50', 'gwei')  // Set higher gas price
        });

        console.log('Transaction hash:', tx.hash);

        // Wait for transaction confirmation
        const receipt = await tx.wait();
        console.log('Transaction confirmed in block:', receipt.blockNumber);

        alert('Donation successful!');

        // Reload the page to reflect changes
        window.location.reload();

    } catch (error) {
        console.error('Error making donation:', error);

        // More detailed error reporting
        let errorMessage = 'Error making donation';

        if (error.code) {
            errorMessage += ` (Code: ${error.code})`;
        }

        if (error.message) {
            // Clean up the error message for better readability
            const cleanMessage = error.message.replace(/\(action="[^"]*", data=[^,]*,/, '');
            errorMessage += `: ${cleanMessage}`;
        }

        alert(errorMessage);

        const donateButton = document.querySelector('#donation-form button[type="submit"]');
        donateButton.disabled = false;
        donateButton.textContent = 'Donate';
    }
}

// Handle withdrawal of funds
async function handleWithdrawal(projectId) {
    try {
        if (!confirm('Are you sure you want to withdraw all funds from this project?')) {
            return;
        }

        const withdrawButton = document.getElementById('withdraw-funds');
        withdrawButton.disabled = true;
        withdrawButton.innerHTML = `
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Processing...
        `;

        const tx = await projectFundingContract.withdrawFunds(projectId);
        await tx.wait();

        alert('Funds withdrawn successfully!');

        // Reload the page to reflect changes
        window.location.reload();

    } catch (error) {
        console.error('Error withdrawing funds:', error);
        alert(`Error withdrawing funds: ${error.message}`);

        const withdrawButton = document.getElementById('withdraw-funds');
        withdrawButton.disabled = false;
        withdrawButton.textContent = 'Withdraw Funds';
    }
}

// Handle toggling funding status
async function handleToggleFunding(projectId, newStatus) {
    try {
        const statusText = newStatus ? 'resume' : 'pause';

        if (!confirm(`Are you sure you want to ${statusText} funding for this project?`)) {
            return;
        }

        const toggleButton = document.getElementById('toggle-funding');
        toggleButton.disabled = true;
        toggleButton.innerHTML = `
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Processing...
        `;

        const tx = await projectFundingContract.toggleFundingStatus(projectId, newStatus);
        await tx.wait();

        alert(`Funding status updated successfully!`);

        // Reload the page to reflect changes
        window.location.reload();

    } catch (error) {
        console.error('Error updating funding status:', error);
        alert(`Error updating funding status: ${error.message}`);

        const toggleButton = document.getElementById('toggle-funding');
        toggleButton.disabled = false;
        toggleButton.textContent = newStatus ? 'Resume Funding' : 'Pause Funding';
    }
}

// Handle completing a project
async function handleCompleteProject(projectId) {
    try {
        if (!confirm('Are you sure you want to mark this project as completed? This action cannot be undone.')) {
            return;
        }

        const completeButton = document.getElementById('complete-project');
        completeButton.disabled = true;
        completeButton.innerHTML = `
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Processing...
        `;

        const tx = await projectFundingContract.completeProject(projectId);
        await tx.wait();

        alert('Project marked as completed successfully!');

        // Reload the page to reflect changes
        window.location.reload();

    } catch (error) {
        console.error('Error completing project:', error);
        alert(`Error completing project: ${error.message}`);

        const completeButton = document.getElementById('complete-project');
        completeButton.disabled = false;
        completeButton.textContent = 'Mark as Completed';
    }
}
