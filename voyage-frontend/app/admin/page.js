"use client"

import React, { useState, useEffect } from "react"
import { ethers } from "ethers"
import Navbar from "../../components/Treasurehunt/Navbar"
import Footer from "../../components/Landingpage/Footer"
import MapComponent from "../../components/AdminPanel/MapComponent"
import HuntForm from "../../components/AdminPanel/HuntForm"
import ExistingHunts from "../../components/AdminPanel/ExistingHunts"
import Messages from "../../components/AdminPanel/Messages"
import voyageAbi from "../../../artifacts/contracts/VoyageTreasureHunt.sol/VoyageTreasureHuntv5.json"
import voyTokenABI from "../../../artifacts/contracts/voyToken.sol/ERC20Token.json"

const AdminPanel = () => {
    const [message, setMessage] = useState("")
    const [hunts, setHunts] = useState([])
    const [coordinates, setCoordinates] = useState([null, null])
    const [account, setAccount] = useState(null)
    const [balance, setBalance] = useState({ eth: 0, voy: 0 })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (window.ethereum && account) {
            fetchBalances()
            fetchHunts() // Fetch existing hunts when account is set
        }
    }, [account])

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                setLoading(true)
                const { chainId } = await window.ethereum.request({ method: "eth_chainId" })
                const bnbTestnetChainId = "0x61" // BNB Testnet chain ID in hexadecimal

                if (chainId !== bnbTestnetChainId) {
                    try {
                        await window.ethereum.request({
                            method: "wallet_switchEthereumChain",
                            params: [{ chainId: bnbTestnetChainId }],
                        })
                    } catch (switchError) {
                        if (switchError.code === 4902) {
                            try {
                                await window.ethereum.request({
                                    method: "wallet_addEthereumChain",
                                    params: [
                                        {
                                            chainId: bnbTestnetChainId,
                                            chainName: "BNB Testnet",
                                            rpcUrls: [
                                                "https://data-seed-prebsc-1-s1.binance.org:8545/",
                                            ],
                                            nativeCurrency: {
                                                name: "Test BNB",
                                                symbol: "tBNB",
                                                decimals: 18,
                                            },
                                            blockExplorerUrls: ["https://testnet.bscscan.com"],
                                        },
                                    ],
                                })
                            } catch (addError) {
                                console.error("Error adding BNB Testnet:", addError)
                                alert("Please manually switch to BNB Testnet in your MetaMask.")
                                return
                            }
                        } else {
                            console.error("Error switching to BNB Testnet:", switchError)
                            alert("Please manually switch to BNB Testnet in your MetaMask.")
                            return
                        }
                    }
                }

                await window.ethereum.request({ method: "eth_requestAccounts" })
                const provider = new ethers.providers.Web3Provider(window.ethereum)
                const signer = provider.getSigner()
                const address = await signer.getAddress()
                setAccount(address)

                fetchBalances(provider, signer, address)
            } catch (error) {
                console.error("Error connecting wallet:", error)
                alert("An error occurred while connecting the wallet.")
            } finally {
                setLoading(false)
            }
        } else {
            alert("MetaMask not detected. Please install MetaMask.")
        }
    }

    const disconnectWallet = () => {
        setAccount(null)
        setBalance({ eth: 0, voy: 0 })
    }

    const fetchBalances = async (provider, signer, address) => {
        try {
            const ethBalance = await provider.getBalance(address)
            const formattedEthBalance = ethers.utils.formatUnits(ethBalance, 18)

            const voyContract = new ethers.Contract(
                process.env.NEXT_PUBLIC_VOY_TOKEN_ADDRESS,
                voyTokenABI.abi,
                signer
            )
            const voyBalance = await voyContract.balanceOf(address)
            const formattedVoyBalance = ethers.utils.formatUnits(voyBalance, 18)

            setBalance({
                eth: formattedEthBalance,
                voy: formattedVoyBalance,
            })
        } catch (error) {
            console.error("Error fetching balances:", error)
        }
    }

    const fetchHunts = async () => {
        if (window.ethereum) {
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum)
                const signer = provider.getSigner()
                const voyageContract = new ethers.Contract(
                    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
                    voyageAbi.abi,
                    signer
                )

                const huntCount = await voyageContract.huntCount()
                const huntsArray = []

                for (let i = 0; i < huntCount; i++) {
                    const huntInfo = await voyageContract.huntInfo(i)
                    const { nonce, clue, start, solved, winner } = huntInfo

                    huntsArray.push({
                        id: nonce.toString(),
                        clue,
                        startTime: new Date(start.toNumber() * 1000).toLocaleString(),
                        solved,
                        winner: winner === ethers.constants.AddressZero ? null : winner,
                    })
                }

                setHunts(huntsArray)
            } catch (error) {
                console.error("Error fetching hunts:", error)
            }
        }
    }

    const handleNewHunt = async (newHunt) => {
        // Your contract interaction logic for creating a new hunt
    }

    return (
        <div className="relative h-screen">
            <Navbar
                account={account}
                balance={balance}
                connectWallet={connectWallet}
                disconnectWallet={disconnectWallet}
                loading={loading}
            />
            <div className="relative h-full">
                <MapComponent setCoordinates={setCoordinates} />
                <div className="absolute top-0 right-0 z-10 m-4">
                    <HuntForm handleNewHunt={handleNewHunt} coordinates={coordinates} />
                </div>
                <div className="absolute top-0 left-0 z-10 m-4">
                    <ExistingHunts hunts={hunts} />
                </div>
                <Messages message={message} />
            </div>
            <Footer />
        </div>
    )
}

export default AdminPanel
