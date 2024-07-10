const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying VoyageTreasureHunt with the account:", deployer.address);

    const voyTokenAddress = "0xadcAff8B7CbA30c0eAc4b9AbFD5426b855eb66be"; // Deployed VOY token address

    const VoyageTreasureHunt = await ethers.getContractFactory("VoyageTreasureHunt");
    const voyageTreasureHunt = await VoyageTreasureHunt.deploy(voyTokenAddress);

    await voyageTreasureHunt.deployed();

    console.log("VoyageTreasureHunt deployed to:", voyageTreasureHunt.address);

    // Ensure the source artifact exists
    const source = path.join(__dirname, '../artifacts/contracts/VoyageTreasureHunt.sol/VoyageTreasureHunt.json');
    if (!fs.existsSync(source)) {
        throw new Error(`Artifact not found at ${source}`);
    }

    // Ensure the destination directory exists
    const destinationDir = path.join(__dirname, '../../voyage-frontend/artifacts');
    if (!fs.existsSync(destinationDir)) {
        fs.mkdirSync(destinationDir, { recursive: true });
    }

    // Copy the artifact to the frontend directory
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
