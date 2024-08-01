"use client"

import React, { useEffect, useState } from "react"
import mapboxgl from "mapbox-gl"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Landingpage/Footer"
import WelcomeModal from "../../components/WelcomeModal"
import Image from "next/image"
import { ethers } from "ethers"
import contractABI from "../../../artifacts/contracts/ VoyageTreasureHunt.sol/VoyageTreasureHunt.json"

const TreasureHunt = () => {
    const [currentClueIndex, setCurrentClueIndex] = useState(null)
    const [guess, setGuess] = useState("")
    const [message, setMessage] = useState("")
    const [showWelcome, setShowWelcome] = useState(true)
    const [provider, setProvider] = useState(null)
    const [signer, setSigner] = useState(null)
    const [contract, setContract] = useState(null)
    const [hunts, setHunts] = useState([])

    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS

    useEffect(() => {
        fetch("/clues.json")
            .then((response) => response.json())
            .then((data) => {
                setHunts(data)
                console.log("Hunts fetched successfully:", data)
            })
            .catch((error) => console.error("Error fetching hunts:", error))
    }, [])

    useEffect(() => {
        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
        new mapboxgl.Map({
            container: "map",
            style: "mapbox://styles/mapbox/streets-v11",
            center: [0, 0],
            zoom: 2,
        })
    }, [])

    useEffect(() => {
        if (typeof window !== "undefined" && window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            setProvider(provider)
            const signer = provider.getSigner()
            setSigner(signer)
            if (contractABI.abi.length > 0) {
                const contract = new ethers.Contract(contractAddress, contractABI.abi, signer)
                setContract(contract)
            }
        }
    }, [])

    const handleGuessSubmit = async (e) => {
        e.preventDefault()
        if (!contract) {
            setMessage("Please connect your wallet first.")
            return
        }

        try {
            const transaction = await contract.submitAnswer(guess)
            await transaction.wait()
            setMessage("Congratulations! You found the treasure!")
        } catch (error) {
            console.error("Error submitting guess:", error)
            setMessage("Incorrect answer or error occurred. Try again!")
        }

        setGuess("")
    }

    const handleHuntClick = (index) => {
        setCurrentClueIndex(index)
    }

    return (
        <div>
            <Navbar />
            {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
            <div className="relative h-screen">
                <div id="map" className="w-full h-full"></div>
                <div className="absolute top-0 left-0 w-full max-w-md p-4 bg-black bg-opacity-75 rounded shadow-md">
                    {currentClueIndex === null ? (
                        <>
                            <h2 className="mb-2 text-lg font-bold text-white">Active Hunts</h2>
                            {hunts.length > 0 ? (
                                hunts.map((hunt, index) => (
                                    <div
                                        key={index}
                                        className="mb-4 text-white cursor-pointer"
                                        onClick={() => handleHuntClick(index)}
                                    >
                                        <h3>{hunt.PlaceID}</h3>
                                        <p>{hunt.Clue}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-white">No Active Hunts</p>
                            )}
                        </>
                    ) : (
                        <>
                            <h2 className="mb-2 text-lg font-bold text-white">Treasure Hunt</h2>
                            <p className="mb-4 text-white">Check out the riddle below!</p>
                            <p className="mb-4 text-white">
                                Reward: {hunts[currentClueIndex].Rewards}
                            </p>
                            <Image
                                src={hunts[currentClueIndex].URL}
                                alt="Treasure Hunt Clue"
                                width={320}
                                height={240}
                            />
                            <p className="text-white">{hunts[currentClueIndex].Clue}</p>
                            <form onSubmit={handleGuessSubmit}>
                                <input
                                    type="text"
                                    value={guess}
                                    onChange={(e) => setGuess(e.target.value)}
                                    placeholder="Enter your guess"
                                    className="w-full px-4 py-2 mb-4 border rounded"
                                />
                                <button
                                    type="submit"
                                    className="w-full px-4 py-2 bg-blue-500 rounded"
                                >
                                    Submit
                                </button>
                            </form>
                            {message && <p className="mt-4 text-white">{message}</p>}
                            <button
                                onClick={() => setCurrentClueIndex(null)}
                                className="mt-4 text-white"
                            >
                                Back to hunts
                            </button>
                        </>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default TreasureHunt
