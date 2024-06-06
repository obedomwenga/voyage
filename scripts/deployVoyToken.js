const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying VOY token with the account:", deployer.address);

    const initialSupply = ethers.utils.parseEther("100000000"); // 100 million tokens
    const Token = await ethers.getContractFactory("VoyToken"); // Ensure this matches your contract name
    const token = await Token.deploy(initialSupply);

    await token.deployed();

    console.log("VOY Token deployed to:", token.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
