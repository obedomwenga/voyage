const { network, ethers } = require("hardhat")
const { developmentChains, VERIFICATION_BLOCK_CONFIRMATIONS } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS
    log("----------------------------------------------------")
    const voyTokenAddress = "0x6E3519a4957E132a9a6c27CaDB9E887B1FA086aa"
    const feewallet = "0x0a628e841942fE4677e91Bf5f956a0eB7dede68F"
    const args = [voyTokenAddress, feewallet] // Assuming deployer as the initial receiver of tokens
    const USDTDeployment = await deploy("VoyageTreasureHuntv5", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: waitBlockConfirmations,
    })

    // Verify the deployment
    if (!developmentChains.includes(network.name) && process.env.BnB_API_KEY) {
        log("Verifying...")
        await verify(USDTDeployment.address, args)
    }
    log("----------------------------------------------------")
}

module.exports.tags = ["all", "USDT"]
