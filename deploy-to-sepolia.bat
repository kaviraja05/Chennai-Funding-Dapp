@echo off
echo ===== Chennai Community Project Funding DApp - Sepolia Deployment =====
echo.

echo Checking environment variables...
if not exist .env (
    echo ERROR: .env file not found. Please create it with your private keys.
    echo See SEPOLIA_DEPLOYMENT.md for instructions.
    exit /b 1
)

echo.
echo Step 1: Backing up existing projects from local network...
echo.
npx hardhat run scripts/exportProjects.js --network localhost
if %ERRORLEVEL% neq 0 (
    echo WARNING: Could not export projects from local network.
    echo This is normal if you don't have a local node running or no projects created.
)

echo.
echo Step 2: Deploying contract to Sepolia...
echo.
npx hardhat run scripts/deploy-sepolia.js --network sepolia
if %ERRORLEVEL% neq 0 (
    echo ERROR: Deployment to Sepolia failed.
    echo Check your .env file and make sure you have Sepolia ETH.
    exit /b 1
)

echo.
echo Step 3: Importing projects to Sepolia...
echo.
npx hardhat run scripts/importProjects.js --network sepolia
if %ERRORLEVEL% neq 0 (
    echo WARNING: Could not import projects to Sepolia.
    echo This might be due to an error or there were no projects to import.
)

echo.
echo ===== Deployment Complete =====
echo.
echo Your DApp is now deployed to Sepolia!
echo.
echo To start the frontend server, run:
echo node start-frontend.js
echo.
echo Make sure to connect MetaMask to the Sepolia network.
echo.
echo See SEPOLIA_DEPLOYMENT.md for more details.
echo.
