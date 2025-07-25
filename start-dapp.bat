@echo off
echo Starting DApp...

echo.
echo ===== Step 1: Starting Hardhat Node =====
start cmd /k "npx hardhat node"

echo.
echo ===== Step 2: Deploying Contract =====
timeout /t 5
start cmd /k "npx hardhat run scripts/deploy.js --network localhost"

echo.
echo ===== Step 3: Starting Frontend Server =====
timeout /t 3
node start-frontend.js

echo.
echo DApp started successfully!
