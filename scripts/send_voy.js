const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    const voyTokenAddress = "0xD8ffBfdB5b9fe2Da607810F922522E85cD911839"; // Replace with the deployed VOY token address

    const VOY = await ethers.getContractAt("VoyToken", voyTokenAddress); // Ensure this matches your contract name

    const recipient = "0x77e6372bFce29F13c7a96b31816EE7E506253706"; // Replace with your wallet address
    const amount = ethers.utils.parseUnits("1000", 18); // Amount of tokens to send (e.g., 1000 VOY)

    try {
        // Manually set a high gas limit
        const gasLimit = ethers.utils.hexlify(100000); // 100,000 gas units

        const tx = await VOY.transfer(recipient, amount, { gasLimit });
        await tx.wait();

        console.log(`Sent ${ethers.utils.formatUnits(amount, 18)} VOY tokens to ${recipient}`);
    } catch (error) {
        console.error("Error sending VOY tokens:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
