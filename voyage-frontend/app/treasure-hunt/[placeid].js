"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/router"
import mapboxgl from "mapbox-gl"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Landingpage/Footer"
import WelcomeModal from "../../components/WelcomeModal"
import Image from "next/image"
import { ethers } from "ethers"
import contractABI from "../../../artifacts/contracts/VoyageTreasureHunt.sol/VoyageTreasureHunt.json"

const TreasureHuntDetail = () => {
    const router = useRouter()
    const { placeid } = router.query
    const [hunt, setHunt] = useState(null)
    const [guess, setGuess] = useState("")
    const [message, setMessage] = useState("")
    const [showWelcome, setShowWelcome] = useState(true)
    const [provider, setProvider] = useState(null)
    const [signer, setSigner] = useState(null)
    const [contract, setContract] = useState(null)

    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS

    useEffect(() => {
        if (placeid) {
            fetch("/clues.json")
                .then((response) => response.json())
                .then((data) => {
                    const selectedHunt = data.find((hunt) => hunt.placeid === placeid)
                    setHunt(selectedHunt)
                })
                .catch((error) => console.error("Error fetching hunt details:", error))
        }
    }, [placeid])

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
    }, [contractAddress]) // Added contractAddress as a dependency

    const handleGuessSubmit = async (e) => {
        e.preventDefault()
        if (!contract) {
            setMessage("Please connect your wallet first.")
            return
        }

        try {
            const transaction = await contract.submitAnswer(guess, {
                value: ethers.utils.parseUnits("0.1", "ether"),
            })
            await transaction.wait()
            setMessage("Congratulations! You found the treasure!")
        } catch (error) {
            console.error("Error submitting guess:", error)
            setMessage("Incorrect answer or error occurred. Try again!")
        }

        setGuess("")
    }

    if (!hunt) {
        return <p>Loading...</p>
    }

    return (
        <div>
            <Navbar />
            {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
            <div className="relative h-screen">
                <div id="map" className="w-full h-full"></div>
                <div className="absolute top-0 right-0 p-4">
                    <button className="px-4 py-2 bg-blue-500 rounded">Start Hunt</button>
                </div>
                <div className="absolute top-0 left-0 p-4 bg-black bg-opacity-75 rounded shadow-md">
                    <h2 className="mb-2 text-lg font-bold text-white">{hunt.name}</h2>
                    <p className="mb-4 text-white">{hunt.description}</p>
                    <p className="mb-4 text-white">Reward: {hunt.reward} VOY</p>
                    <Image src={hunt.URL} alt="Treasure Hunt Clue" width={320} height={240} />
                    <p className="text-white">{hunt.Clue}</p>
                    <form onSubmit={handleGuessSubmit}>
                        <input
                            type="text"
                            value={guess}
                            onChange={(e) => setGuess(e.target.value)}
                            placeholder="Enter your guess"
                            className="w-full px-4 py-2 mb-4 border rounded"
                        />
                        <button type="submit" className="w-full px-4 py-2 bg-blue-500 rounded">
                            Submit
                        </button>
                    </form>
                    {message && <p className="mt-4 text-white">{message}</p>}
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default TreasureHuntDetail
