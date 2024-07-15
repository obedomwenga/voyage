const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const voyTokenAddress = process.env.NEXT_PUBLIC_VOY_TOKEN_ADDRESS;
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

  const voyToken = await ethers.getContractAt("VoyToken", voyTokenAddress);

  const amount = ethers.utils.parseEther("10000"); // Adjust the amount as needed

  const tx = await voyToken.transfer(contractAddress, amount);
  await tx.wait();

  console.log(`Transferred ${ethers.utils.formatEther(amount)} VOY tokens to the contract at address ${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
