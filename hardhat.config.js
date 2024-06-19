require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("hardhat-deploy");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("@nomiclabs/hardhat-etherscan"); // Add this line
require("dotenv").config();

const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL || "https://eth-mainnet.alchemyapi.io/v2/your-api-key";
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/9XcsCq-4UwwQnQSWhDU3jUZKaiI8lBoE";
const BnB_RPC_URL = process.env.BnB_RPC_URL || "https://bsc-dataseed.binance.org/";
const POLYGON_MAINNET_RPC_URL = process.env.POLYGON_MAINNET_RPC_URL || "https://polygon-mainnet.alchemyapi.io/v2/your-api-key";
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const MNEMONIC = process.env.MNEMONIC || "your-mnemonic";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "your-etherscan-api-key";
const BnB_API_KEY = process.env.BnB_API_KEY || "your-bscscan-api-key";
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "your-polygonscan-api-key";
const REPORT_GAS = process.env.REPORT_GAS || false;

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            gas: 12000000,
            allowUnlimitedContractSize: true,
        },
        localhost: {
            chainId: 31337,
        },
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
            saveDeployments: true,
            chainId: 11155111,
        },
        bnb: {
            url: BnB_RPC_URL,
            accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
            saveDeployments: true,
            chainId: 56,
        },
        mainnet: {
            url: MAINNET_RPC_URL,
            accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
            saveDeployments: true,
            chainId: 1,
        },
        polygon: {
            url: POLYGON_MAINNET_RPC_URL,
            accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
            saveDeployments: true,
            chainId: 137,
        },
    },
    etherscan: {
        apiKey: {
            sepolia: ETHERSCAN_API_KEY,
            polygon: POLYGONSCAN_API_KEY,
            bsc: BnB_API_KEY,
        },
    },
    gasReporter: {
        enabled: REPORT_GAS,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
    },
    contractSizer: {
        runOnCompile: true,
    },
    namedAccounts: {
        deployer: {
            default: 0,
            1: 0,
        },
        player: {
            default: 1,
        },
    },
    solidity: {
        compilers: [
            {
                version: "0.7.4",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 1000,
                    },
                },
            },
            {
                version: "0.8.0",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 1000,
                    },
                },
            },
            {
                version: "0.6.0",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 1000,
                    },
                },
            },
            {
                version: "0.8.7",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 1000,
                    },
                },
            },
            {
                version: "0.4.24",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 1000,
                    },
                },
            },
        ],
    },
    mocha: {
        timeout: 20000000, // 200 seconds max for running tests
    },
};
