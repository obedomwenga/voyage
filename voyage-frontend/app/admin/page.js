"use client"

import React, { useState, useEffect, useRef } from "react"
import { ethers } from "ethers"
import Navbar from "../../components/Treasurehunt/Navbar"
import Footer from "../../components/Landingpage/Footer"
import MapComponent from "../../components/AdminPanel/MapComponent"
import HuntForm from "../../components/AdminPanel/HuntForm"
import ExistingHunts from "../../components/AdminPanel/ExistingHunts"
import Messages from "../../components/AdminPanel/Messages"
import voyageAbi from "../../artifacts/contracts/VoyageTreasureHunt.sol/VoyageTreasureHuntv6.json"
import voyTokenABI from "../../artifacts/contracts/voyToken.sol/ERC20Token.json"

const AdminPanel = () => {
    const [message, setMessage] = useState("")
    const [hunts, setHunts] = useState([])
    const [coordinates, setCoordinates] = useState([null, null])
    const [locationName, setLocationName] = useState("") // Changed from cityName to locationName
    const [showConfirm, setShowConfirm] = useState(false)
    const [account, setAccount] = useState(null)
    const [balance, setBalance] = useState({ eth: 0, voy: 0 })
    const [loading, setLoading] = useState(false)
    const huntFormRef = useRef(null)

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
                const fantomTestnetChainId = "0xfa2" // Fantom Testnet chain ID in hexadecimal

                if (chainId !== fantomTestnetChainId) {
                    try {
                        await window.ethereum.request({
                            method: "wallet_switchEthereumChain",
                            params: [{ chainId: fantomTestnetChainId }],
                        })
                    } catch (switchError) {
                        if (switchError.code === 4902) {
                            try {
                                await window.ethereum.request({
                                    method: "wallet_addEthereumChain",
                                    params: [
                                        {
                                            chainId: fantomTestnetChainId,
                                            chainName: "Fantom Testnet",
                                            rpcUrls: ["https://rpc.testnet.fantom.network/"],
                                            nativeCurrency: {
                                                name: "Test FTM",
                                                symbol: "tFTM",
                                                decimals: 18,
                                            },
                                            blockExplorerUrls: ["https://testnet.ftmscan.com"],
                                        },
                                    ],
                                })
                            } catch (addError) {
                                console.error("Error adding Fantom Testnet:", addError)
                                alert("Please manually switch to Fantom Testnet in your MetaMask.")
                                return
                            }
                        } else {
                            console.error("Error switching to Fantom Testnet:", switchError)
                            alert("Please manually switch to Fantom Testnet in your MetaMask.")
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

                for (let i = 1; i <= huntCount; i++) {
                    const huntInfo = await voyageContract.huntInfo(i)
                    const { nonce, clue, start, solved, winner } = huntInfo

                    huntsArray.push({
                        id: nonce.toString(),
                        clue,
                        startTime:
                            start.toNumber() > 0
                                ? new Date(start.toNumber() * 1000).toLocaleString()
                                : "Not started",
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

    const handleMapClick = (locationName, coords) => {
        setLocationName(locationName)
        setCoordinates(coords)
        setShowConfirm(true)
    }

    const confirmLocation = () => {
        setShowConfirm(false)
        setMessage(`Location set to: ${locationName}`)

        if (huntFormRef.current) {
            huntFormRef.current.updateAnswer(locationName)
        }
    }

    const handleNewHunt = async (newHunt) => {
        // Contract interaction logic for creating a new hunt
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
                <MapComponent
                    setCoordinates={setCoordinates}
                    setLocationName={setLocationName}
                    handleMapClick={handleMapClick} // Pass handleMapClick to MapComponent
                />
                <div className="absolute top-0 right-0 z-10 m-4">
                    <HuntForm
                        ref={huntFormRef}
                        handleNewHunt={handleNewHunt}
                        coordinates={coordinates}
                        locationName={locationName} // Pass the location name to HuntForm
                    />
                </div>
                <div className="absolute top-0 left-0 z-10 m-4">
                    <ExistingHunts hunts={hunts} />
                </div>
                <Messages message={message} />
            </div>
            {showConfirm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="p-6 text-center bg-white rounded-lg shadow-lg">
                        <p className="mb-4">
                            Are you sure you want to set this location: {locationName}?
                        </p>
                        <div className="flex justify-center space-x-4">
                            <button
                                className="px-4 py-2 text-white bg-green-500 rounded"
                                onClick={confirmLocation}
                            >
                                Yes
                            </button>
                            <button
                                className="px-4 py-2 text-white bg-red-500 rounded"
                                onClick={() => setShowConfirm(false)}
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    )
}

export default AdminPanel
