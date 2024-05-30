const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying VoyageTreasureHunt with the account:", deployer.address);

    const voyTokenAddress = "0xadcAff8B7CbA30c0eAc4b9AbFD5426b855eb66be"; // Deployed VOY token address

    const VoyageTreasureHunt = await ethers.getContractFactory("VoyageTreasureHunt");
    const voyageTreasureHunt = await VoyageTreasureHunt.deploy(voyTokenAddress);

    await voyageTreasureHunt.deployed();

    console.log("VoyageTreasureHunt deployed to:", voyageTreasureHunt.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
