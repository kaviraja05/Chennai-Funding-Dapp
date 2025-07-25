// Main application logic
document.addEventListener('DOMContentLoaded', async () => {
    // DOM Elements
    const connectWalletBtn = document.getElementById('connect-wallet');
    const walletStatusDiv = document.getElementById('wallet-status');
    const projectsContainer = document.getElementById('projects-container');
    const projectForm = document.getElementById('project-form');
    const createdProjectsContainer = document.getElementById('created-projects-container');
    const donatedProjectsContainer = document.getElementById('donated-projects-container');

    // App State
    let currentAccount = null;
    let projectFundingContract = null;
    let provider = null;
    let signer = null;

    // Initialize the application
    async function init() {
        try {
            // Check if MetaMask is installed
            if (typeof window.ethereum === 'undefined') {
                walletStatusDiv.innerHTML = `
                    <div class="alert alert-danger">
                        MetaMask is not installed. Please install MetaMask to use this application.
                        <a href="https://metamask.io/download.html" target="_blank" class="alert-link">Download MetaMask</a>
                    </div>
                `;
                return;
            }

            // Setup event listeners
            connectWalletBtn.addEventListener('click', connectWallet);
            projectForm.addEventListener('submit', handleProjectSubmit);

            // Add event listener for image preview
            const projectImageInput = document.getElementById('project-image');
            if (projectImageInput) {
                projectImageInput.addEventListener('change', function() {
                    const file = this.files[0];
                    if (file) {
                        // Check file size (max 2MB)
                        if (file.size > 2 * 1024 * 1024) {
                            showNotification('Image size exceeds 2MB limit. Please choose a smaller image.', 'warning');
                            this.value = ''; // Clear the input
                            return;
                        }

                        // Preview the image
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            const previewContainer = document.getElementById('image-preview-container');
                            if (!previewContainer) {
                                const container = document.createElement('div');
                                container.id = 'image-preview-container';
                                container.className = 'mb-3';
                                container.innerHTML = `
                                    <p>Image Preview:</p>
                                    <img src="${e.target.result}" class="img-thumbnail" style="max-height: 200px;">
                                `;
                                projectImageInput.parentNode.appendChild(container);
                            } else {
                                previewContainer.innerHTML = `
                                    <p>Image Preview:</p>
                                    <img src="${e.target.result}" class="img-thumbnail" style="max-height: 200px;">
                                `;
                            }
                        };
                        reader.readAsDataURL(file);
                    }
                });
            }

            // Check if already connected
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                await handleAccountsChanged(accounts);
            }

            // Listen for account changes
            window.ethereum.on('accountsChanged', handleAccountsChanged);

            // Listen for chain changes
            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });

        } catch (error) {
            console.error('Initialization error:', error);
            walletStatusDiv.innerHTML = `
                <div class="alert alert-danger">
                    Error initializing the application: ${error.message}
                </div>
            `;
        }
    }

    // Connect wallet function
    async function connectWallet() {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            await handleAccountsChanged(accounts);
        } catch (error) {
            console.error('Connection error:', error);
            walletStatusDiv.innerHTML = `
                <div class="alert alert-danger">
                    Error connecting to MetaMask: ${error.message}
                </div>
            `;
        }
    }

    // Handle account changes
    async function handleAccountsChanged(accounts) {
        if (accounts.length === 0) {
            // User disconnected their wallet
            currentAccount = null;
            walletStatusDiv.innerHTML = `
                <div class="alert alert-warning">
                    Please connect your wallet to interact with the platform.
                </div>
            `;
            connectWalletBtn.textContent = 'Connect Wallet';

            // Disable form buttons
            document.querySelectorAll('form button[type="submit"]').forEach(button => {
                button.disabled = true;
            });

            return;
        }

        currentAccount = accounts[0];
        connectWalletBtn.textContent = `${currentAccount.substring(0, 6)}...${currentAccount.substring(38)}`;

        walletStatusDiv.innerHTML = `
            <div class="alert alert-success">
                Connected: ${currentAccount}
            </div>
        `;

        // Enable form buttons
        document.querySelectorAll('form button[type="submit"]').forEach(button => {
            button.disabled = false;
        });

        // Initialize contract
        await initializeContract();

        // Load projects
        await loadProjects();

        // Load user projects
        await loadUserProjects();
    }

    // Initialize contract
    async function initializeContract() {
        try {
            // Check if MetaMask is installed
            if (typeof window.ethereum === 'undefined') {
                walletStatusDiv.innerHTML = `
                    <div class="alert alert-danger">
                        MetaMask is not installed. Please install MetaMask to use this application.
                    </div>
                `;
                return;
            }

            // Initialize provider with explicit network configuration
            provider = new ethers.providers.Web3Provider(window.ethereum);

            // Get the network information
            const network = await provider.getNetwork();
            console.log('Connected to network:', network);

            // Check if connected to the correct network (Hardhat's chainId is 31337, Sepolia is 11155111)
            const supportedNetworks = {
                31337: 'Hardhat',
                11155111: 'Sepolia'
            };

            if (!supportedNetworks[network.chainId]) {
                const supportedNetworksList = Object.entries(supportedNetworks)
                    .map(([id, name]) => `${name} (Chain ID: ${id})`)
                    .join(' or ');

                walletStatusDiv.innerHTML = `
                    <div class="alert alert-warning">
                        Please connect to a supported network: ${supportedNetworksList}.
                        <br>Current network: ${network.name} (Chain ID: ${network.chainId})
                        <br><br>
                        <button class="btn btn-sm btn-primary" onclick="window.location.reload()">Refresh Page</button>
                    </div>
                `;
                console.warn(`Wrong network. Please connect to ${supportedNetworksList}`);

                // Show notification
                if (typeof showNotification === 'function') {
                    showNotification(`Please connect to ${supportedNetworksList}`, 'warning');
                }

                return; // Don't proceed with contract initialization if on wrong network
            }

            signer = provider.getSigner();

            // Import the contract address from contract-config.js
            const contractAddress = window.contractConfig ? window.contractConfig.contractAddress : '0x5FbDB2315678afecb367f032d93F642f64180aa3';

            // Log a message to help with debugging
            console.log('Using contract address:', contractAddress);
            console.log('If this address is incorrect, please update the address in frontend/js/contract-config.js');

            // Log the ABI to check if it's correctly loaded
            console.log('Contract ABI available:', typeof contractABI !== 'undefined');

            if (typeof contractABI === 'undefined' || !contractABI || contractABI.length === 0) {
                throw new Error('Contract ABI is not properly defined. Check contract-interaction.js');
            }

            projectFundingContract = new ethers.Contract(
                contractAddress,
                contractABI,
                signer
            );

            // Check if contract is properly initialized
            console.log('Contract initialized:', projectFundingContract);
            console.log('Contract address:', projectFundingContract.address);

            // Log available functions
            console.log('Available contract functions:');
            for (const key in projectFundingContract.functions) {
                console.log(`- ${key}`);
            }

            // Test a simple contract call to verify connection
            try {
                // Try to call a view function that should always work
                const projects = await projectFundingContract.getAllProjects();
                console.log('Test contract call successful, found', projects.length, 'projects');
            } catch (callError) {
                console.error('Test contract call failed:', callError);
                throw new Error(`Contract connection test failed: ${callError.message}. Make sure your contract is deployed and the address is correct.`);
            }

        } catch (error) {
            console.error('Contract initialization error:', error);
            walletStatusDiv.innerHTML = `
                <div class="alert alert-danger">
                    Error initializing the contract: ${error.message}
                    <br><br>
                    <p>Possible solutions:</p>
                    <ul>
                        <li>Make sure your Hardhat node is running</li>
                        <li>Verify the contract is deployed to address 0x5FbDB2315678afecb367f032d93F642f64180aa3</li>
                        <li>Check that you're connected to the correct network (Chain ID: 31337)</li>
                    </ul>
                    <button class="btn btn-sm btn-primary" onclick="window.location.reload()">Refresh Page</button>
                </div>
            `;

            // Show notification
            if (typeof showNotification === 'function') {
                showNotification(`Contract error: ${error.message}`, 'danger');
            }
        }
    }

    // Load all projects
    async function loadProjects() {
        if (!projectFundingContract) return;

        try {
            projectsContainer.innerHTML = `
                <div class="col-12 text-center loading-container">
                    <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            `;

            // Get all projects from the contract
            const projects = await projectFundingContract.getAllProjects();

            // Update dashboard metrics
            updateDashboardMetrics(projects);

            if (projects.length === 0) {
                projectsContainer.innerHTML = `
                    <div class="col-12">
                        <div class="alert alert-info">
                            No projects have been created yet. Be the first to create a community project!
                        </div>
                    </div>
                `;
                return;
            }

            projectsContainer.innerHTML = '';

            projects.forEach(project => {
                const fundingPercentage = (project.fundsRaised * 100 / project.fundingGoal).toFixed(2);
                const statusClass = project.isCompleted ? 'status-completed' :
                                   (project.isFundingActive ? 'status-active' : 'status-paused');
                const statusText = project.isCompleted ? 'Completed' :
                                  (project.isFundingActive ? 'Active' : 'Paused');

                // Get project category (if available)
                const projectCategory = project.category || 'General';

                // Get project image from localStorage if available
                console.log('Loading project card for project ID:', project.id);
                const projectImage = getProjectImage(project.id);
                console.log('Project card image retrieved:', projectImage ? 'Image found' : 'No image found');

                const projectCard = document.createElement('div');
                projectCard.className = 'col-md-4 mb-4 slide-in';
                projectCard.innerHTML = `
                    <div class="card project-card" data-category="${projectCategory.toLowerCase()}">
                        ${projectImage ? `<div class="project-image-container"><img src="${projectImage}" class="project-image" alt="${project.name}" onerror="console.error('Card image failed to load:', this.src);"></div>` : '<!-- No image available -->'}
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <h5 class="card-title">${project.name}</h5>
                                <span class="status-badge ${statusClass}">${statusText}</span>
                            </div>
                            <span class="category-tag">${projectCategory}</span>
                            <h6 class="card-subtitle mb-2 text-muted">${project.location}</h6>
                            <p class="card-text">${project.description.substring(0, 100)}${project.description.length > 100 ? '...' : ''}</p>
                            <div class="progress mb-3">
                                <div class="progress-bar" role="progressbar" style="width: ${fundingPercentage}%"
                                    aria-valuenow="${fundingPercentage}" aria-valuemin="0" aria-valuemax="100"></div>
                            </div>
                            <div class="funding-stats mb-3">
                                <span>${ethers.utils.formatEther(project.fundsRaised)} ETH raised</span>
                                <span>${fundingPercentage}% funded</span>
                            </div>
                            <button class="btn btn-primary w-100 view-project-details" data-project-id="${project.id}">
                                View Details
                            </button>
                        </div>
                    </div>
                `;

                projectsContainer.appendChild(projectCard);

                // Add event listener to the view details button
                projectCard.querySelector('.view-project-details').addEventListener('click', () => {
                    openProjectDetails(project);
                });
            });

        } catch (error) {
            console.error('Error loading projects:', error);

            // Check if it's an ENS-related error
            if (error.code === 'UNSUPPORTED_OPERATION' && error.operation === 'getResolver') {
                projectsContainer.innerHTML = `
                    <div class="col-12">
                        <div class="alert alert-warning">
                            <strong>Network Configuration Issue:</strong> The current network does not support ENS.
                            Please make sure you're connected to the correct network in MetaMask.
                            <br><br>
                            <button class="btn btn-primary" onclick="window.location.reload()">Refresh Page</button>
                        </div>
                    </div>
                `;
            } else {
                projectsContainer.innerHTML = `
                    <div class="col-12">
                        <div class="alert alert-danger">
                            Error loading projects: ${error.message}
                        </div>
                    </div>
                `;
            }
        }
    }

    // Update dashboard metrics
    function updateDashboardMetrics(projects) {
        try {
            // Calculate metrics
            const totalProjects = projects.length;

            let totalFunded = ethers.BigNumber.from(0);
            let activeProjects = 0;
            let completedProjects = 0;

            projects.forEach(project => {
                totalFunded = totalFunded.add(project.fundsRaised);

                if (project.isCompleted) {
                    completedProjects++;
                } else if (project.isFundingActive) {
                    activeProjects++;
                }
            });

            // Update dashboard elements
            document.getElementById('total-projects').textContent = totalProjects;
            document.getElementById('total-funded').textContent = `${parseFloat(ethers.utils.formatEther(totalFunded)).toFixed(2)} ETH`;
            document.getElementById('active-projects').textContent = activeProjects;
            document.getElementById('completed-projects').textContent = completedProjects;

        } catch (error) {
            console.error('Error updating dashboard metrics:', error);
        }
    }

    // Load user projects (created and donated)
    async function loadUserProjects() {
        if (!projectFundingContract || !currentAccount) return;

        try {
            // Load created projects
            createdProjectsContainer.innerHTML = `
                <div class="text-center loading-container">
                    <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            `;

            const createdProjectIds = await projectFundingContract.getUserCreatedProjects(currentAccount);

            if (createdProjectIds.length === 0) {
                createdProjectsContainer.innerHTML = `
                    <div class="alert alert-info">
                        You haven't created any projects yet.
                    </div>
                `;
            } else {
                createdProjectsContainer.innerHTML = '<div class="row"></div>';
                const createdProjectsRow = createdProjectsContainer.querySelector('.row');

                for (const projectId of createdProjectIds) {
                    const project = await projectFundingContract.projects(projectId);

                    const fundingPercentage = (project.fundsRaised * 100 / project.fundingGoal).toFixed(2);
                    const statusClass = project.isCompleted ? 'status-completed' :
                                       (project.isFundingActive ? 'status-active' : 'status-paused');
                    const statusText = project.isCompleted ? 'Completed' :
                                      (project.isFundingActive ? 'Active' : 'Paused');

                    // Get project image from localStorage
                    const projectImage = getProjectImage(projectId);

                    const projectCard = document.createElement('div');
                    projectCard.className = 'col-md-6';
                    projectCard.innerHTML = `
                        <div class="card project-card">
                            ${projectImage ? `<div class="project-image-container"><img src="${projectImage}" class="project-image" alt="${project.name}" onerror="console.error('User project image failed to load:', this.src);"></div>` : '<!-- No image available -->'}
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <h5 class="card-title">${project.name}</h5>
                                    <span class="status-badge ${statusClass}">${statusText}</span>
                                </div>
                                <div class="progress mb-3">
                                    <div class="progress-bar" role="progressbar" style="width: ${fundingPercentage}%"
                                        aria-valuenow="${fundingPercentage}" aria-valuemin="0" aria-valuemax="100"></div>
                                </div>
                                <p class="text-center">
                                    ${ethers.utils.formatEther(project.fundsRaised)} ETH / ${ethers.utils.formatEther(project.fundingGoal)} ETH
                                </p>
                                <button class="btn btn-primary w-100 view-project-details" data-project-id="${project.id}">
                                    Manage Project
                                </button>
                            </div>
                        </div>
                    `;

                    createdProjectsRow.appendChild(projectCard);

                    // Add event listener to the view details button
                    projectCard.querySelector('.view-project-details').addEventListener('click', () => {
                        openProjectDetails(project, true);
                    });
                }
            }

            // Load donated projects
            donatedProjectsContainer.innerHTML = `
                <div class="text-center loading-container">
                    <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            `;

            const donatedProjectIds = await projectFundingContract.getUserDonatedProjects(currentAccount);

            if (donatedProjectIds.length === 0) {
                donatedProjectsContainer.innerHTML = `
                    <div class="alert alert-info">
                        You haven't donated to any projects yet.
                    </div>
                `;
            } else {
                donatedProjectsContainer.innerHTML = '<div class="row"></div>';
                const donatedProjectsRow = donatedProjectsContainer.querySelector('.row');

                for (const projectId of donatedProjectIds) {
                    const project = await projectFundingContract.projects(projectId);

                    const fundingPercentage = (project.fundsRaised * 100 / project.fundingGoal).toFixed(2);

                    // Get project image from localStorage
                    const projectImage = getProjectImage(projectId);

                    const projectCard = document.createElement('div');
                    projectCard.className = 'col-md-6';
                    projectCard.innerHTML = `
                        <div class="card project-card">
                            ${projectImage ? `<div class="project-image-container"><img src="${projectImage}" class="project-image" alt="${project.name}" onerror="console.error('Donated project image failed to load:', this.src);"></div>` : '<!-- No image available -->'}
                            <div class="card-body">
                                <h5 class="card-title">${project.name}</h5>
                                <div class="progress mb-3">
                                    <div class="progress-bar" role="progressbar" style="width: ${fundingPercentage}%"
                                        aria-valuenow="${fundingPercentage}" aria-valuemin="0" aria-valuemax="100"></div>
                                </div>
                                <p class="text-center">
                                    ${ethers.utils.formatEther(project.fundsRaised)} ETH / ${ethers.utils.formatEther(project.fundingGoal)} ETH
                                </p>
                                <button class="btn btn-primary w-100 view-project-details" data-project-id="${project.id}">
                                    View Details
                                </button>
                            </div>
                        </div>
                    `;

                    donatedProjectsRow.appendChild(projectCard);

                    // Add event listener to the view details button
                    projectCard.querySelector('.view-project-details').addEventListener('click', () => {
                        openProjectDetails(project);
                    });
                }
            }

        } catch (error) {
            console.error('Error loading user projects:', error);
            createdProjectsContainer.innerHTML = `
                <div class="alert alert-danger">
                    Error loading your created projects: ${error.message}
                </div>
            `;
            donatedProjectsContainer.innerHTML = `
                <div class="alert alert-danger">
                    Error loading your donated projects: ${error.message}
                </div>
            `;
        }
    }

    // Helper function to get project image from localStorage
    function getProjectImage(projectId) {
        try {
            const imageData = localStorage.getItem(`project_image_${projectId}`);
            console.log(`Getting image for project ${projectId}:`, imageData ? 'Image found' : 'No image found');
            return imageData;
        } catch (error) {
            console.error('Error getting project image from localStorage:', error);
            return null;
        }
    }

    // Helper function to save project image to localStorage
    function saveProjectImage(projectId, imageData) {
        try {
            console.log(`Saving image for project ${projectId}, data length:`, imageData.length);
            localStorage.setItem(`project_image_${projectId}`, imageData);

            // Verify the image was saved
            const savedData = localStorage.getItem(`project_image_${projectId}`);
            console.log(`Verification - Image saved for project ${projectId}:`, savedData ? 'Success' : 'Failed');

            return true;
        } catch (error) {
            console.error('Error saving project image to localStorage:', error);
            return false;
        }
    }

    // Handle project form submission
    async function handleProjectSubmit(event) {
        event.preventDefault();

        if (!projectFundingContract || !currentAccount) {
            showNotification('Please connect your wallet first', 'warning');
            return;
        }

        const name = document.getElementById('project-name').value;
        const description = document.getElementById('project-description').value;
        const location = document.getElementById('project-location').value;
        const category = document.getElementById('project-category').value;
        const fundingGoalEth = document.getElementById('funding-goal').value;
        const beneficiary = document.getElementById('beneficiary').value;
        const projectImage = document.getElementById('project-image').files[0];

        // Validate beneficiary address
        if (!beneficiary.match(/^0x[0-9a-fA-F]{40}$/)) {
            showNotification('Invalid beneficiary address format. It should start with 0x followed by 40 hexadecimal characters.', 'danger');
            return;
        }

        console.log('Creating project with params:', {
            name,
            description,
            location,
            category,
            fundingGoalEth,
            beneficiary,
            hasImage: !!projectImage
        });

        try {
            const fundingGoal = ethers.utils.parseEther(fundingGoalEth);
            console.log('Funding goal in Wei:', fundingGoal.toString());

            const submitButton = projectForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.innerHTML = `
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Creating...
            `;

            console.log('Calling createProject on contract:', projectFundingContract.address);

            // Try using a different approach to call the contract
            const signer = await provider.getSigner();
            const contractWithSigner = projectFundingContract.connect(signer);

            console.log('Contract with signer:', contractWithSigner.address);

            // Process the image if provided
            let imageData = null;
            if (projectImage) {
                const reader = new FileReader();
                imageData = await new Promise((resolve) => {
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(projectImage);
                });
            }

            const tx = await contractWithSigner.createProject(
                name,
                description,
                location,
                fundingGoal,
                beneficiary,
                { gasLimit: 3000000 } // Add explicit gas limit
            );

            console.log('Transaction sent:', tx.hash);
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt);

            // Get the project ID from the event logs
            let projectId = null;
            if (receipt && receipt.events) {
                console.log('Transaction receipt events:', receipt.events);
                const projectCreatedEvent = receipt.events.find(e => e.event === 'ProjectCreated');
                console.log('Project created event:', projectCreatedEvent);

                if (projectCreatedEvent && projectCreatedEvent.args) {
                    console.log('Project created event args:', projectCreatedEvent.args);
                    projectId = projectCreatedEvent.args.projectId.toString();
                    console.log('New project ID:', projectId);

                    // Save the image to localStorage if available
                    if (imageData && projectId) {
                        console.log('Image data available, saving to localStorage...');
                        const saved = saveProjectImage(projectId, imageData);
                        if (saved) {
                            console.log('Project image saved to localStorage');

                            // Test retrieving the image
                            const retrievedImage = getProjectImage(projectId);
                            console.log('Retrieved image test:', retrievedImage ? 'Success' : 'Failed');
                        } else {
                            console.warn('Failed to save project image to localStorage');
                        }
                    } else {
                        console.log('No image data or project ID available:', {
                            hasImageData: !!imageData,
                            projectId
                        });
                    }
                } else {
                    console.warn('ProjectCreated event not found or missing args');

                    // Fallback: Try to get the project ID from the transaction logs
                    console.log('Attempting fallback method to get project ID...');
                    try {
                        // Get the total number of projects
                        const projectCount = await projectFundingContract.getProjectCount();
                        console.log('Total project count:', projectCount.toString());

                        // The new project ID should be the latest one (count - 1)
                        const newProjectId = projectCount.sub(1).toString();
                        console.log('Fallback project ID:', newProjectId);

                        // Save the image to localStorage if available
                        if (imageData && newProjectId) {
                            console.log('Using fallback project ID to save image');
                            const saved = saveProjectImage(newProjectId, imageData);
                            if (saved) {
                                console.log('Project image saved to localStorage using fallback ID');
                            }
                        }
                    } catch (fallbackError) {
                        console.error('Fallback method failed:', fallbackError);
                    }
                }
            } else {
                console.warn('No events found in transaction receipt');

                // Fallback: Try to get the project ID from the contract
                console.log('Attempting fallback method to get project ID...');
                try {
                    // Get the total number of projects
                    const projectCount = await projectFundingContract.getProjectCount();
                    console.log('Total project count:', projectCount.toString());

                    // The new project ID should be the latest one (count - 1)
                    const newProjectId = projectCount.sub(1).toString();
                    console.log('Fallback project ID:', newProjectId);

                    // Save the image to localStorage if available
                    if (imageData && newProjectId) {
                        console.log('Using fallback project ID to save image');
                        const saved = saveProjectImage(newProjectId, imageData);
                        if (saved) {
                            console.log('Project image saved to localStorage using fallback ID');
                        }
                    }
                } catch (fallbackError) {
                    console.error('Fallback method failed:', fallbackError);
                }
            }

            showNotification('Project created successfully!', 'success');

            // Clear the image preview
            const previewContainer = document.getElementById('image-preview-container');
            if (previewContainer) {
                previewContainer.remove();
            }

            // Reset form
            projectForm.reset();

            // Reload projects
            await loadProjects();
            await loadUserProjects();

            // Scroll to projects section
            document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error('Error creating project:', error);

            // Extract more detailed error information
            let errorMessage = error.message;
            if (error.error) {
                console.error('Detailed error:', error.error);
                errorMessage = error.error.message || errorMessage;
            }

            // Check for common issues
            if (errorMessage.includes('execution reverted')) {
                const revertReason = errorMessage.match(/reason="([^"]+)"/);
                if (revertReason && revertReason[1]) {
                    errorMessage = `Contract execution reverted: ${revertReason[1]}`;
                }
            }

            showNotification(`Error creating project: ${errorMessage}`, 'danger');
        } finally {
            const submitButton = projectForm.querySelector('button[type="submit"]');
            submitButton.disabled = false;
            submitButton.textContent = 'Create Project';
        }
    }

    // Load project donations
    async function loadProjectDonations(projectId) {
        const donationsContainer = document.getElementById('donations-container');

        if (!projectFundingContract) {
            donationsContainer.innerHTML = `
                <div class="alert alert-danger">
                    Error loading donation history: Contract is not initialized. Please connect your wallet.
                </div>
            `;
            return;
        }

        try {
            // Get donations from the contract
            const donations = await projectFundingContract.getProjectDonations(projectId);

            if (donations.length === 0) {
                donationsContainer.innerHTML = `
                    <div class="alert alert-info">
                        No donations have been made to this project yet.
                    </div>
                `;
                return;
            }

            // Sort donations by timestamp (newest first)
            donations.sort((a, b) => b.timestamp - a.timestamp);

            // Create donations table
            donationsContainer.innerHTML = `
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Donor</th>
                                <th>Amount</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${donations.map(donation => `
                                <tr>
                                    <td class="address-display">${donation.donor}</td>
                                    <td>${ethers.utils.formatEther(donation.amount)} ETH</td>
                                    <td>${new Date(donation.timestamp * 1000).toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;

        } catch (error) {
            console.error('Error loading donations:', error);
            donationsContainer.innerHTML = `
                <div class="alert alert-danger">
                    Error loading donations: ${error.message}
                </div>
            `;
        }
    }

    // Load project statistics
    async function loadProjectStatistics(projectId) {
        const statsContainer = document.getElementById('project-stats-container');

        if (!projectFundingContract) {
            statsContainer.innerHTML = `
                <div class="alert alert-danger">
                    Error loading project statistics: Contract is not initialized. Please connect your wallet.
                </div>
            `;
            return;
        }

        try {
            // Get donations
            const donations = await projectFundingContract.getProjectDonations(projectId);

            // Get withdrawals
            const withdrawals = await projectFundingContract.getProjectWithdrawals(projectId);

            // Calculate statistics
            const totalDonations = donations.length;
            const uniqueDonors = new Set(donations.map(d => d.donor)).size;

            let totalWithdrawn = ethers.BigNumber.from(0);
            withdrawals.forEach(w => {
                totalWithdrawn = totalWithdrawn.add(w.amount);
            });

            // Display statistics
            statsContainer.innerHTML = `
                <div class="row">
                    <div class="col-md-4">
                        <div class="stat-item">
                            <h5>${totalDonations}</h5>
                            <p>Total Donations</p>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="stat-item">
                            <h5>${uniqueDonors}</h5>
                            <p>Unique Donors</p>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="stat-item">
                            <h5>${ethers.utils.formatEther(totalWithdrawn)} ETH</h5>
                            <p>Funds Withdrawn</p>
                        </div>
                    </div>
                </div>

                <h5 class="mt-4">Withdrawal History</h5>
                ${withdrawals.length === 0 ? `
                    <div class="alert alert-info">
                        No withdrawals have been made from this project yet.
                    </div>
                ` : `
                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Amount</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${withdrawals.map(withdrawal => `
                                    <tr>
                                        <td>${ethers.utils.formatEther(withdrawal.amount)} ETH</td>
                                        <td>${new Date(withdrawal.timestamp * 1000).toLocaleString()}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            `;

        } catch (error) {
            console.error('Error loading project statistics:', error);
            statsContainer.innerHTML = `
                <div class="alert alert-danger">
                    Error loading project statistics: ${error.message}
                </div>
            `;
        }
    }

    // Handle donation submission
    async function handleDonationSubmit(event) {
        event.preventDefault();

        if (!projectFundingContract || !currentAccount) {
            showNotification('Please connect your wallet first', 'warning');
            return;
        }

        const projectId = document.getElementById('project-id').value;
        const donationAmountEth = document.getElementById('donation-amount').value;

        try {
            if (!donationAmountEth || parseFloat(donationAmountEth) <= 0) {
                showNotification('Please enter a valid donation amount', 'warning');
                return;
            }

            const donationAmount = ethers.utils.parseEther(donationAmountEth);

            const submitButton = event.target.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.innerHTML = `
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Donating...
            `;

            console.log(`Donating ${donationAmountEth} ETH to project ${projectId}`);

            // Get a fresh signer and connect it to the contract
            const signer = await provider.getSigner();
            const contractWithSigner = projectFundingContract.connect(signer);

            // Add explicit gas limit and higher gas price
            const tx = await contractWithSigner.donateToProject(projectId, {
                value: donationAmount,
                gasLimit: 500000,  // Increase gas limit
                gasPrice: ethers.utils.parseUnits('50', 'gwei')  // Set higher gas price
            });

            console.log('Donation transaction hash:', tx.hash);

            // Wait for transaction confirmation
            const receipt = await tx.wait();
            console.log('Donation confirmed in block:', receipt.blockNumber);

            showNotification('Donation successful!', 'success');

            // Reload donations
            loadProjectDonations(projectId);

            // Reload projects
            await loadProjects();
            await loadUserProjects();

            // Reset form
            event.target.reset();

        } catch (error) {
            console.error('Error donating to project:', error);

            // More detailed error reporting
            let errorMessage = 'Error donating to project';

            if (error.code) {
                errorMessage += ` (Code: ${error.code})`;
            }

            if (error.message) {
                // Clean up the error message for better readability
                const cleanMessage = error.message.replace(/\(action="[^"]*", data=[^,]*,/, '');
                errorMessage += `: ${cleanMessage}`;
            }

            showNotification(errorMessage, 'danger');
        } finally {
            const submitButton = event.target.querySelector('button[type="submit"]');
            submitButton.disabled = false;
            submitButton.textContent = 'Donate';
        }
    }

    // Handle toggle funding
    async function handleToggleFunding(event) {
        const projectId = event.target.dataset.projectId;
        const isFundingActive = event.target.textContent.trim() === 'Pause Funding';

        try {
            event.target.disabled = true;
            event.target.innerHTML = `
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ${isFundingActive ? 'Pausing...' : 'Resuming...'}
            `;

            // Call the contract
            const signer = await provider.getSigner();
            const contractWithSigner = projectFundingContract.connect(signer);

            const tx = await contractWithSigner.toggleFundingActive(projectId, {
                gasLimit: 100000
            });

            console.log('Toggle funding transaction sent:', tx.hash);
            await tx.wait();
            console.log('Toggle funding transaction confirmed');

            showNotification(`Project funding ${isFundingActive ? 'paused' : 'resumed'} successfully!`, 'success');

            // Reload projects
            await loadProjects();
            await loadUserProjects();

            // Close the modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('project-details-modal'));
            modal.hide();

        } catch (error) {
            console.error('Error toggling project funding:', error);
            showNotification(`Error toggling project funding: ${error.message}`, 'danger');

            event.target.disabled = false;
            event.target.textContent = isFundingActive ? 'Pause Funding' : 'Resume Funding';
        }
    }

    // Handle complete project
    async function handleCompleteProject(event) {
        const projectId = event.target.dataset.projectId;

        try {
            event.target.disabled = true;
            event.target.innerHTML = `
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Completing...
            `;

            // Call the contract
            const signer = await provider.getSigner();
            const contractWithSigner = projectFundingContract.connect(signer);

            const tx = await contractWithSigner.completeProject(projectId, {
                gasLimit: 100000
            });

            console.log('Complete project transaction sent:', tx.hash);
            await tx.wait();
            console.log('Complete project transaction confirmed');

            showNotification('Project marked as completed successfully!', 'success');

            // Reload projects
            await loadProjects();
            await loadUserProjects();

            // Close the modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('project-details-modal'));
            modal.hide();

        } catch (error) {
            console.error('Error completing project:', error);
            showNotification(`Error completing project: ${error.message}`, 'danger');

            event.target.disabled = false;
            event.target.textContent = 'Mark as Completed';
        }
    }

    // Handle withdraw funds
    async function handleWithdrawFunds(event) {
        const projectId = event.target.dataset.projectId;

        try {
            event.target.disabled = true;
            event.target.innerHTML = `
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Withdrawing...
            `;

            // Call the contract
            const signer = await provider.getSigner();
            const contractWithSigner = projectFundingContract.connect(signer);

            const tx = await contractWithSigner.withdrawFunds(projectId, {
                gasLimit: 200000
            });

            console.log('Withdraw funds transaction sent:', tx.hash);
            await tx.wait();
            console.log('Withdraw funds transaction confirmed');

            showNotification('Funds withdrawn successfully!', 'success');

            // Reload projects
            await loadProjects();
            await loadUserProjects();

            // Reload project statistics
            loadProjectStatistics(projectId);

        } catch (error) {
            console.error('Error withdrawing funds:', error);
            showNotification(`Error withdrawing funds: ${error.message}`, 'danger');

            event.target.disabled = false;
            event.target.textContent = 'Withdraw Funds';
        }
    }

    // Open project details modal
    async function openProjectDetails(project, isOwner = false) {
        console.log('Opening project details with full project object:', project);

        // Make sure we have a valid project ID
        if (!project || !project.id) {
            console.error('Invalid project object or missing ID:', project);
            showNotification('Error: Invalid project data', 'danger');
            return;
        }

        const modal = new bootstrap.Modal(document.getElementById('project-details-modal'));
        const modalTitle = document.getElementById('modal-project-title');
        const projectDetailsContent = document.getElementById('project-details-content');

        // Set modal title
        modalTitle.textContent = project.name;

        // Calculate funding percentage
        const fundingPercentage = (project.fundsRaised * 100 / project.fundingGoal).toFixed(2);

        // Get project status
        const statusClass = project.isCompleted ? 'status-completed' :
                           (project.isFundingActive ? 'status-active' : 'status-paused');
        const statusText = project.isCompleted ? 'Completed' :
                          (project.isFundingActive ? 'Active' : 'Paused');

        // Get project category
        const projectCategory = project.category || 'General';

        // Get project image from localStorage
        console.log('Opening project details for project ID:', project.id);

        // Check if an image exists for this project
        checkProjectImage(project.id);

        const projectImage = getProjectImage(project.id);
        console.log('Project image retrieved:', projectImage ? 'Image found (length: ' + projectImage.length + ')' : 'No image found');

        // Create tabs for project details
        projectDetailsContent.innerHTML = `
            <ul class="nav nav-tabs" id="projectDetailsTabs" role="tablist">
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
            <div class="tab-content mt-3" id="projectDetailsTabContent">
                <div class="tab-pane fade show active" id="details" role="tabpanel">
                    ${projectImage ? `
                    <div class="text-center mb-4">
                        <img src="${projectImage}" class="img-fluid rounded" style="max-height: 300px; max-width: 100%;" alt="${project.name}" onerror="console.error('Image failed to load:', this.src);">
                    </div>
                    ` : '<!-- No image available -->'}
                    <div class="project-details">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h4>${project.name}</h4>
                            <span class="status-badge ${statusClass}">${statusText}</span>
                        </div>
                        <span class="category-tag">${projectCategory}</span>
                        <h6 class="text-muted mb-3">Location: ${project.location}</h6>
                        <p>${project.description}</p>

                        <div class="project-stats">
                            <div class="stat-item">
                                <h5>${ethers.utils.formatEther(project.fundsRaised)} ETH</h5>
                                <p>Raised</p>
                            </div>
                            <div class="stat-item">
                                <h5>${ethers.utils.formatEther(project.fundingGoal)} ETH</h5>
                                <p>Goal</p>
                            </div>
                            <div class="stat-item">
                                <h5>${fundingPercentage}%</h5>
                                <p>Funded</p>
                            </div>
                        </div>

                        <div class="progress mb-4">
                            <div class="progress-bar" role="progressbar" style="width: ${fundingPercentage}%"
                                aria-valuenow="${fundingPercentage}" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>

                        <div class="mb-4">
                            <h5>Beneficiary</h5>
                            <div class="address-display">${project.beneficiary}</div>
                        </div>

                        ${!project.isCompleted && project.isFundingActive ? `
                        <div class="card mb-4">
                            <div class="card-body">
                                <h5 class="card-title">Support This Project</h5>
                                <form id="donation-form">
                                    <input type="hidden" id="project-id" value="${project.id}">
                                    <div class="mb-3">
                                        <label for="donation-amount" class="form-label">Donation Amount (ETH)</label>
                                        <input type="number" step="0.01" min="0.01" class="form-control" id="donation-amount" required>
                                    </div>
                                    <button type="submit" class="btn btn-primary w-100" ${!currentAccount ? 'disabled' : ''}>
                                        Donate
                                    </button>
                                </form>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>

                <div class="tab-pane fade" id="donations" role="tabpanel">
                    <div id="donations-container">
                        <div class="text-center loading-container">
                            <div class="spinner-border" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    </div>
                </div>

                ${isOwner ? `
                <div class="tab-pane fade" id="manage" role="tabpanel">
                    <div class="card mb-4">
                        <div class="card-body">
                            <h5 class="card-title">Project Management</h5>
                            <div class="d-grid gap-2">
                                ${!project.isCompleted ? `
                                <button class="btn btn-${project.isFundingActive ? 'warning' : 'success'} toggle-funding-btn" data-project-id="${project.id}">
                                    ${project.isFundingActive ? 'Pause Funding' : 'Resume Funding'}
                                </button>
                                ` : ''}

                                ${!project.isCompleted ? `
                                <button class="btn btn-info complete-project-btn" data-project-id="${project.id}">
                                    Mark as Completed
                                </button>
                                ` : ''}

                                <button class="btn btn-primary withdraw-funds-btn" data-project-id="${project.id}" ${project.fundsRaised.eq(0) ? 'disabled' : ''}>
                                    Withdraw Funds
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Project Statistics</h5>
                            <div id="project-stats-container">
                                <div class="text-center loading-container">
                                    <div class="spinner-border" role="status">
                                        <span class="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                ` : ''}
            </div>
        `;

        // Show the modal
        modal.show();

        // Load donations
        if (!project.isCompleted || project.fundsRaised.gt(0)) {
            loadProjectDonations(project.id);
        }

        // Load project statistics if owner
        if (isOwner) {
            loadProjectStatistics(project.id);
        }

        // Add event listener to donation form
        const donationForm = document.getElementById('donation-form');
        if (donationForm) {
            donationForm.addEventListener('submit', handleDonationSubmit);
        }

        // Add event listeners to management buttons
        if (isOwner) {
            const toggleFundingBtn = document.querySelector('.toggle-funding-btn');
            if (toggleFundingBtn) {
                toggleFundingBtn.addEventListener('click', handleToggleFunding);
            }

            const completeProjectBtn = document.querySelector('.complete-project-btn');
            if (completeProjectBtn) {
                completeProjectBtn.addEventListener('click', handleCompleteProject);
            }

            const withdrawFundsBtn = document.querySelector('.withdraw-funds-btn');
            if (withdrawFundsBtn) {
                withdrawFundsBtn.addEventListener('click', handleWithdrawFunds);
            }
        }
    }

    // Function to clear all project images from localStorage
    function clearAllProjectImages() {
        try {
            const allKeys = Object.keys(localStorage);
            const imageKeys = allKeys.filter(k => k.startsWith('project_image_'));

            console.log('Clearing all project images from localStorage...');
            console.log('Found image keys:', imageKeys);

            imageKeys.forEach(key => {
                localStorage.removeItem(key);
                console.log('Removed key:', key);
            });

            console.log('All project images cleared from localStorage');
            return true;
        } catch (error) {
            console.error('Error clearing project images:', error);
            return false;
        }
    }

    // Function to check if an image exists for a specific project ID
    function checkProjectImage(projectId) {
        try {
            const key = `project_image_${projectId}`;
            const allKeys = Object.keys(localStorage);
            const imageKeys = allKeys.filter(k => k.startsWith('project_image_'));

            console.log('All localStorage keys:', allKeys);
            console.log('Image-related keys:', imageKeys);

            const hasImage = localStorage.getItem(key) !== null;
            console.log(`Image check for project ${projectId}: ${hasImage ? 'Found' : 'Not found'}`);

            return hasImage;
        } catch (error) {
            console.error('Error checking project image:', error);
            return false;
        }
    }

    // Test localStorage functionality
    function testLocalStorage() {
        try {
            const testKey = 'test_storage_key';
            const testValue = 'test_storage_value_' + Date.now();

            console.log('Testing localStorage functionality...');

            // Try to save to localStorage
            localStorage.setItem(testKey, testValue);

            // Try to retrieve from localStorage
            const retrievedValue = localStorage.getItem(testKey);

            // Check if the retrieved value matches
            const isWorking = retrievedValue === testValue;
            console.log('localStorage test result:', isWorking ? 'WORKING' : 'FAILED');

            // Clean up
            localStorage.removeItem(testKey);

            return isWorking;
        } catch (error) {
            console.error('localStorage test error:', error);
            return false;
        }
    }

    // Initialize the app
    init();

    // Test localStorage
    const localStorageWorking = testLocalStorage();
    if (!localStorageWorking) {
        showNotification('Warning: Local storage is not working. Project images may not be saved or displayed correctly.', 'warning');
    }

    // Add event listener for the clear images button
    const clearImagesButton = document.getElementById('clear-images');
    if (clearImagesButton) {
        clearImagesButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all project images? This cannot be undone.')) {
                const cleared = clearAllProjectImages();
                if (cleared) {
                    showNotification('All project images have been cleared from localStorage. Refresh the page to see the changes.', 'success');
                } else {
                    showNotification('Failed to clear project images.', 'danger');
                }
            }
        });
    }
});