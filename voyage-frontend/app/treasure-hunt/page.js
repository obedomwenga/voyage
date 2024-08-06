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
import contractABI from "../../../artifacts/contracts/VoyageTreasureHunt.sol/VoyageTreasureHuntv5.json"
import voyTokenABI from "../../../artifacts/contracts/voyToken.sol/ERC20Token.json"
import dynamic from "next/dynamic"

const MapComponent = dynamic(() => import("../../components/Treasurehunt/MapComponent"), {
    ssr: false,
})

const TreasureHunt = () => {
    const [currentClueIndex, setCurrentClueIndex] = useState(null)
    const [guessLocation, setGuessLocation] = useState("")
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

    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
    const voyTokenAddress = process.env.NEXT_PUBLIC_VOY_TOKEN_ADDRESS

    useEffect(() => {
        const init = async () => {
            if (typeof window !== "undefined" && window.ethereum) {
                const newProvider = new ethers.providers.Web3Provider(window.ethereum)
                setProvider(newProvider)
                const newSigner = newProvider.getSigner()
                setSigner(newSigner)
                const newContract = new ethers.Contract(contractAddress, contractABI.abi, newSigner)
                setContract(newContract)
                try {
                    const newAccount = await newSigner.getAddress()
                    setAccount(newAccount)
                    setMessage("Wallet connected successfully!")
                    if (newContract) {
                        await fetchHunts(newContract)
                        await fetchBalances(newProvider, newSigner, newAccount)
                    }
                } catch (error) {
                    console.error("Error getting account:", error)
                }
            } else {
                setMessage("MetaMask not detected. Please install MetaMask.")
            }
        }

        init()
    }, [contractAddress])

    const connectWallet = async () => {
        if (window.ethereum) {
            setLoading(true)
            try {
                await window.ethereum.request({ method: "eth_requestAccounts" })
                const newProvider = new ethers.providers.Web3Provider(window.ethereum)
                const newSigner = newProvider.getSigner()
                const newAccount = await newSigner.getAddress()
                setProvider(newProvider)
                setSigner(newSigner)
                setAccount(newAccount)
                setMessage("Wallet connected successfully!")
                if (contract) {
                    await fetchHunts(contract)
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

    const fetchHunts = async (contractInstance) => {
        try {
            const huntCount = await contractInstance.huntCount()

            const huntsArray = []
            for (let i = 0; i < huntCount; i++) {
                const huntInfo = await contractInstance.huntInfo(i)

                console.log("Hunt info:", huntInfo) // For debugging

                huntsArray.push({
                    id: huntInfo.nonce.toString(),
                    Clue: huntInfo.clue,
                    URL: huntInfo.url,
                    Rewards: "600", // Manually set the reward amount as 600
                    startTime: new Date(huntInfo.start.toNumber() * 1000).toLocaleString(),
                    solved: huntInfo.solved,
                    winner:
                        huntInfo.winner === ethers.constants.AddressZero ? null : huntInfo.winner,
                })
            }
            setHunts(huntsArray)
        } catch (error) {
            console.error("Error fetching hunts:", error)
        }
    }

    const handleGuessSubmit = async (e) => {
        e.preventDefault()
        if (!contract) {
            setMessage("Please connect your wallet first.")
            return
        }
        if (!guessLocation) {
            setMessage("Please select a location on the map.")
            return
        }

        try {
            const guess = guessLocation
            const transaction = await contract.submitAnswer(guess) // Pass only the guess as an argument
            await transaction.wait()
            setMessage("Congratulations! You found the treasure!")
            setConfetti(true)
            setPopupMessage("Your guess was correct!")
            setIsCorrect(true)
            setIsPopupOpen(true)
        } catch (error) {
            console.error("Error submitting guess:", error)
            setMessage("Incorrect answer or error occurred. Try again!")
            setPopupMessage("Incorrect answer. Please try again!")
            setIsCorrect(false)
            setIsPopupOpen(true)
        }

        setGuessLocation("")
        setShowConfirm(false)
    }

    const handleHuntClick = (index) => {
        setCurrentClueIndex(index)
        setMessage("")
        setConfetti(false)
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
                />
                <div className="absolute top-0 left-0 w-full max-w-md p-4 bg-black bg-opacity-75 rounded shadow-md">
                    {currentClueIndex === null ? (
                        <HuntList hunts={hunts} handleHuntClick={handleHuntClick} />
                    ) : (
                        <HuntDetails
                            hunt={hunts[currentClueIndex]}
                            guess={guessLocation}
                            setGuess={setGuessLocation}
                            handleGuessSubmit={handleGuessSubmit}
                            message={message}
                            setCurrentClueIndex={setCurrentClueIndex}
                        />
                    )}
                </div>
                {showConfirm && (
                    <div className="absolute bottom-0 left-0 p-4 bg-white bg-opacity-75 rounded shadow-md">
                        <p>Are you sure you want to submit this location?</p>
                        <button
                            className="px-4 py-2 bg-green-500 rounded"
                            onClick={handleGuessSubmit}
                        >
                            Yes
                        </button>
                        <button
                            className="px-4 py-2 bg-red-500 rounded"
                            onClick={() => setShowConfirm(false)}
                        >
                            No
                        </button>
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
