const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying VoyageTreasureHunt with the account:", deployer.address);

    // Set the addresses
    const voyTokenAddress = "0x6E3519a4957E132a9a6c27CaDB9E887B1FA086aa"; // Replace with the deployed VOY token address on BSC
    const feeCollectorAddress = "0x77e6372bFce29F13c7a96b31816EE7E506253706"; // Replace with your fee collector address

    // Deploy the contract
    const VoyageTreasureHunt = await ethers.getContractFactory("VoyageTreasureHunt");
    const voyageTreasureHunt = await VoyageTreasureHunt.deploy(voyTokenAddress, feeCollectorAddress);
    await voyageTreasureHunt.deployed();

    console.log("VoyageTreasureHunt deployed to:", voyageTreasureHunt.address);

    // Copy artifact to frontend
    const source = path.join(__dirname, '../artifacts/contracts/VoyageTreasureHunt.sol/VoyageTreasureHunt.json');
    if (!fs.existsSync(source)) {
        throw new Error(`Artifact not found at ${source}`);
    }

    const destinationDir = path.join(__dirname, '../../voyage-frontend/artifacts');
    if (!fs.existsSync(destinationDir)) {
        fs.mkdirSync(destinationDir, { recursive: true });
    }

    const destination = path.join(destinationDir, 'VoyageTreasureHunt.json');
    fs.copyFileSync(source, destination);
    console.log("Artifact copied to frontend directory");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
