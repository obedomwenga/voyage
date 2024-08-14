"use client"

import React, { useEffect, useState } from "react"
import { ethers } from "ethers"
import Navbar from "../../components/Treasurehunt/Navbar"
import Footer from "../../components/Landingpage/Footer"
import WelcomeModal from "../../components/Treasurehunt/WelcomeModal"
import HuntList from "../../components/Treasurehunt/HuntList"
import HuntDetails from "../../components/Treasurehunt/HuntDetails"
import ResultPopup from "../../components/Treasurehunt/ResultPopup"
import Confetti from "react-confetti"
import contractABI from "../../../artifacts/contracts/VoyageTreasureHunt.sol/VoyageTreasureHuntv6.json"
import voyTokenABI from "../../../artifacts/contracts/voyToken.sol/ERC20Token.json"
import dynamic from "next/dynamic"

const MapComponent = dynamic(() => import("../../components/Treasurehunt/MapComponent"), {
    ssr: false,
})

const TreasureHunt = () => {
    const [currentClueIndex, setCurrentClueIndex] = useState(null)
    const [guessLocation, setGuessLocation] = useState("")
    const [countryName, setCountryName] = useState("") // State for country name
    const [answer, setAnswer] = useState("") // State for the answer input
    const [showConfirm, setShowConfirm] = useState(false)
    const [message, setMessage] = useState("")
    const [showWelcome, setShowWelcome] = useState(true)
    const [hunts, setHunts] = useState([])
    const [confetti, setConfetti] = useState(false)
    const [popupMessage, setPopupMessage] = useState("")
    const [isPopupOpen, setIsPopupOpen] = useState(false)
    const [isCorrect, setIsCorrect] = useState(false)
    const [provider, setProvider] = useState(null)
    const [signer, setSigner] = useState(null)
    const [contract, setContract] = useState(null)
    const [account, setAccount] = useState(null)
    const [balance, setBalance] = useState({ eth: 0, voy: 0 })
    const [loading, setLoading] = useState(false)
    const [activeHuntNonce, setActiveHuntNonce] = useState(null)

    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
    const voyTokenAddress = process.env.NEXT_PUBLIC_VOY_TOKEN_ADDRESS

    useEffect(() => {
        const init = async () => {
            if (typeof window !== "undefined" && window.ethereum) {
                try {
                    const newProvider = new ethers.providers.Web3Provider(window.ethereum)
                    setProvider(newProvider)
                    const newSigner = newProvider.getSigner()
                    setSigner(newSigner)

                    const newContract = new ethers.Contract(
                        contractAddress,
                        contractABI.abi,
                        newSigner
                    )
                    setContract(newContract)

                    const newAccount = await newSigner.getAddress()
                    setAccount(newAccount)
                    setMessage("Wallet connected successfully!")

                    await fetchActiveHunt(newContract)
                    await fetchBalances(newProvider, newSigner, newAccount)
                } catch (error) {
                    console.error("Error initializing application:", error)
                    setMessage("Failed to connect wallet. Please try again.")
                }
            } else {
                setMessage("MetaMask not detected. Please install MetaMask.")
            }
        }

        init()
    }, [contractAddress])

    useEffect(() => {
        let pollInterval

        const pollContractState = async () => {
            if (contract && activeHuntNonce && account) {
                try {
                    const hunt = await contract.treasureHunts(activeHuntNonce)
                    if (hunt.solved) {
                        if (hunt.winner.toLowerCase() === account.toLowerCase()) {
                            setConfetti(true)
                            setPopupMessage("Congratulations! You solved the hunt!")
                            setIsCorrect(true)
                            setIsPopupOpen(true)
                            setMessage("")
                            clearInterval(pollInterval) // Stop polling once solved
                        } else {
                            setPopupMessage("Incorrect answer. Please try again!")
                            setIsCorrect(false)
                            setIsPopupOpen(true)
                            clearInterval(pollInterval) // Stop polling if incorrect
                        }
                    }
                } catch (error) {
                    clearInterval(pollInterval)
                    console.error("Error polling contract state:", error)
                    setMessage("An error occurred. Please try again.")
                    setPopupMessage("An error occurred. Please try again.")
                    setIsCorrect(false)
                    setIsPopupOpen(true)
                }
            }
        }

        if (contract) {
            pollInterval = setInterval(pollContractState, 5000) // Poll every 5 seconds
        }

        return () => {
            if (pollInterval) clearInterval(pollInterval)
        }
    }, [contract, activeHuntNonce, account])

    const connectWallet = async () => {
        if (window.ethereum) {
            setLoading(true)
            try {
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
                const newProvider = new ethers.providers.Web3Provider(window.ethereum)
                const newSigner = newProvider.getSigner()
                const newAccount = await newSigner.getAddress()

                setProvider(newProvider)
                setSigner(newSigner)
                setAccount(newAccount)
                setMessage("Wallet connected successfully!")

                if (contract) {
                    await fetchActiveHunt(contract)
                    await fetchBalances(newProvider, newSigner, newAccount)
                }
            } catch (error) {
                console.error("Error connecting wallet:", error)
                setMessage("Failed to connect wallet. Please try again.")
            } finally {
                setLoading(false)
            }
        } else {
            setMessage("MetaMask not detected. Please install MetaMask.")
        }
    }

    const approveToken = async (amount) => {
        if (!provider || !signer || !voyTokenAddress) return

        try {
            const voyContract = new ethers.Contract(voyTokenAddress, voyTokenABI.abi, signer)
            const transaction = await voyContract.approve(contractAddress, amount)
            await transaction.wait()

            console.log(`Approved ${amount} tokens for contract ${contractAddress}`)
        } catch (error) {
            console.error("Error approving tokens:", error)
            setMessage("Failed to approve tokens. Please try again.")
        }
    }

    const fetchBalances = async (provider, signer, account) => {
        try {
            const ethBalance = await provider.getBalance(account)
            const formattedEthBalance = ethers.utils.formatUnits(ethBalance, 18)

            const voyContract = new ethers.Contract(voyTokenAddress, voyTokenABI.abi, signer)
            const voyBalance = await voyContract.balanceOf(account)
            const formattedVoyBalance = ethers.utils.formatUnits(voyBalance, 18)

            setBalance({
                eth: formattedEthBalance,
                voy: formattedVoyBalance,
            })
        } catch (error) {
            console.error("Error fetching balances:", error)
            setBalance({ eth: 0, voy: 0 })
        }
    }

    const fetchActiveHunt = async (contractInstance) => {
        try {
            const [hunt, reward] = await contractInstance.activeHuntInfo()
            const currentTime = Math.floor(Date.now() / 1000)
            const huntDuration = (await contractInstance.DURATION()).toNumber()
            const isHuntActive = !hunt.solved && currentTime < hunt.start.toNumber() + huntDuration

            if (isHuntActive) {
                setActiveHuntNonce(hunt.nonce.toString())
                setHunts([
                    {
                        id: hunt.nonce.toString(),
                        Clue: hunt.clue,
                        URL: hunt.url,
                        Rewards: reward.toString(),
                        startTime: new Date(hunt.start.toNumber() * 1000).toLocaleString(),
                        solved: hunt.solved,
                        winner: hunt.winner === ethers.constants.AddressZero ? null : hunt.winner,
                    },
                ])
                setMessage("")
            } else {
                setHunts([])
                setMessage("No active hunts available at the moment.")
            }
        } catch (error) {
            console.error("Error fetching active hunt:", error)
            setMessage("Failed to fetch active hunt.")
        }
    }

    const handleGuessSubmit = async (e) => {
        e.preventDefault()
        if (!contract) {
            setMessage("Please connect your wallet first.")
            return
        }
        if (!answer) {
            setMessage("Please enter an answer.")
            return
        }

        try {
            const amountToApprove = ethers.utils.parseUnits("100", 18)
            await approveToken(amountToApprove)

            const [hunt, reward] = await contract.activeHuntInfo()
            const currentTime = Math.floor(Date.now() / 1000)
            const huntDuration = (await contract.DURATION()).toNumber()
            const isHuntActive = !hunt.solved && currentTime < hunt.start.toNumber() + huntDuration

            if (!isHuntActive) {
                setMessage("The hunt has expired or is already solved.")
                return
            }

            const transaction = await contract.submitAnswer(answer)
            await transaction.wait()
            setMessage("Answer submitted. Waiting for verification...")

            const intervalId = setInterval(async () => {
                try {
                    const hunt = await contract.treasureHunts(activeHuntNonce)
                    if (hunt.solved) {
                        clearInterval(intervalId)
                        setMessage("")
                        if (hunt.winner.toLowerCase() === account.toLowerCase()) {
                            setConfetti(true)
                            setPopupMessage("Congratulations! You solved the hunt!")
                            setIsCorrect(true)
                        } else {
                            setPopupMessage("Incorrect answer. Please try again!")
                            setIsCorrect(false)
                        }
                        setIsPopupOpen(true)
                    } else {
                        const receipt = await provider.getTransactionReceipt(transaction.hash)
                        if (receipt && receipt.confirmations > 0) {
                            clearInterval(intervalId)
                            setMessage("Incorrect answer. Please try again.")
                            setPopupMessage("Incorrect answer. Please try again!")
                            setIsCorrect(false)
                            setIsPopupOpen(true)
                        }
                    }
                } catch (error) {
                    clearInterval(intervalId)
                    console.error("Error polling contract state:", error)
                    setMessage("An error occurred. Please try again.")
                    setPopupMessage("An error occurred. Please try again.")
                    setIsCorrect(false)
                    setIsPopupOpen(true)
                }
            }, 5000)
        } catch (error) {
            console.error("Error submitting guess:", error)
            setMessage("An error occurred. Please try again.")
            setPopupMessage("An error occurred. Please try again.")
            setIsCorrect(false)
            setIsPopupOpen(true)
        }

        setGuessLocation("")
        setCountryName("") // Clear country name
        setAnswer("") // Clear answer
        setShowConfirm(false)
    }

    const handleHuntClick = (id) => {
        const huntIndex = hunts.findIndex((hunt) => hunt.id === id)
        if (huntIndex !== -1) {
            setCurrentClueIndex(huntIndex)
            setMessage("")
            setConfetti(false)
        }
    }

    const handleAnswerChange = (e) => {
        setAnswer(e.target.value)
    }

    const handleMapClick = (countryName, coords) => {
        setCountryName(countryName)
        setShowConfirm(true)
    }

    const confirmAnswer = () => {
        setAnswer(countryName)
        setShowConfirm(false)
    }

    const handleClosePopup = () => {
        setIsPopupOpen(false)
    }

    return (
        <div>
            {confetti && <Confetti />}
            <Navbar
                account={account}
                balance={balance}
                connectWallet={connectWallet}
                disconnectWallet={() => setAccount(null)}
                loading={loading}
            />
            {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
            <div className="relative h-screen">
                <MapComponent
                    hunts={hunts}
                    currentClueIndex={currentClueIndex}
                    handleHuntClick={handleHuntClick}
                    setGuessLocation={setGuessLocation}
                    setShowConfirm={setShowConfirm}
                    setCountryName={setCountryName}
                    handleMapClick={handleMapClick} // Use this instead of setCountryName directly
                />
                <div className="absolute top-0 left-0 w-full max-w-md p-4 bg-black bg-opacity-75 rounded shadow-md">
                    {hunts.length > 0 ? (
                        currentClueIndex === null ? (
                            <HuntList
                                hunts={hunts}
                                activeHuntNonce={activeHuntNonce}
                                handleHuntClick={handleHuntClick}
                            />
                        ) : (
                            <HuntDetails
                                hunt={hunts[currentClueIndex]}
                                guess={answer} // Use answer state
                                setGuess={setAnswer}
                                handleGuessSubmit={handleGuessSubmit}
                                message={message}
                                setCurrentClueIndex={setCurrentClueIndex}
                                onAnswerChange={handleAnswerChange} // Handler for answer input
                            />
                        )
                    ) : (
                        <p className="text-white">No active hunts available.</p>
                    )}
                </div>
                {showConfirm && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="p-6 text-center bg-white rounded-lg shadow-lg">
                            <p className="mb-4">
                                Are you sure you want to use this location: {countryName}?
                            </p>
                            <div className="flex justify-center space-x-4">
                                <button
                                    className="px-4 py-2 text-white bg-green-500 rounded"
                                    onClick={confirmAnswer}
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
                {message && (
                    <p className="absolute bottom-0 right-0 p-4 bg-white bg-opacity-75 rounded shadow-md">
                        {message}
                    </p>
                )}
            </div>
            <Footer />
            <ResultPopup
                isOpen={isPopupOpen}
                onClose={handleClosePopup}
                message={popupMessage}
                isCorrect={isCorrect}
            />
        </div>
    )
}

export default TreasureHunt
