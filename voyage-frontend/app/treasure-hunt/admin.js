"use client"

import React, { useEffect, useState } from "react"
import mapboxgl from "mapbox-gl"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Landingpage/Footer"
import { connectWallet, submitTreasureHunt } from "../../utils/contract"

const AdminPanel = () => {
    const [provider, setProvider] = useState(null)
    const [signer, setSigner] = useState(null)
    const [contract, setContract] = useState(null)
    const [message, setMessage] = useState("")
    const [clue, setClue] = useState("")
    const [url, setUrl] = useState("")
    const [signedAnswer, setSignedAnswer] = useState("")
    const [coordinates, setCoordinates] = useState([0, 0])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const initWallet = async () => {
            try {
                const { provider, signer, contractInstance } = await connectWallet()
                setProvider(provider)
                setSigner(signer)
                setContract(contractInstance)
            } catch (error) {
                setMessage("An error occurred while connecting the wallet.")
            }
        }
        initWallet()
    }, [])

    useEffect(() => {
        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
        const map = new mapboxgl.Map({
            container: "map",
            style: "mapbox://styles/mapbox/streets-v11",
            center: [0, 0],
            zoom: 2,
        })

        map.on("click", (e) => {
            setCoordinates([e.lngLat.lng, e.lngLat.lat])
            console.log("Coordinates:", e.lngLat.lng, e.lngLat.lat)
        })
    }, [])

    const handleFileUpload = async (e) => {
        const file = e.target.files[0]
        const formData = new FormData()
        formData.append("file", file)

        try {
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            })
            const data = await response.json()
            setUrl(data.url)
        } catch (error) {
            console.error("Error uploading file:", error)
        }
    }

    const handleSetupHunt = async (e) => {
        e.preventDefault()

        if (!clue || !url || !signedAnswer || coordinates.length !== 2) {
            setMessage("Please fill in all fields and set the coordinates by clicking on the map.")
            return
        }

        setIsLoading(true)

        try {
            const result = await submitTreasureHunt(contract, signedAnswer, clue, url)
            if (result.success) {
                setMessage("Hunt successfully created!")
            } else {
                setMessage("Error setting up hunt. Try again!")
            }
        } catch (error) {
            console.error("Error setting up hunt:", error)
            setMessage("Error setting up hunt. Try again!")
        }

        setIsLoading(false)
    }

    return (
        <div>
            <Navbar />
            <div className="relative h-screen">
                <div id="map" className="w-full h-full"></div>
                <div className="absolute top-0 right-0 w-full max-w-md p-4 bg-black bg-opacity-75 rounded shadow-md">
                    <h2 className="mb-2 text-lg font-bold text-white">Admin Panel</h2>
                    <form onSubmit={handleSetupHunt}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Clue</label>
                            <input
                                type="text"
                                value={clue}
                                onChange={(e) => setClue(e.target.value)}
                                className="block w-full p-2 mt-1 border border-gray-300 rounded-md shadow-sm"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Clue Image
                            </label>
                            <input
                                type="file"
                                onChange={handleFileUpload}
                                className="block w-full p-2 mt-1 border border-gray-300 rounded-md shadow-sm"
                            />
                        </div>
                        {url && (
                            <div className="mb-4">
                                <img src={url} alt="Clue" className="object-cover w-32 h-32" />
                            </div>
                        )}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                                Signed Answer
                            </label>
                            <input
                                type="text"
                                value={signedAnswer}
                                onChange={(e) => setSignedAnswer(e.target.value)}
                                className="block w-full p-2 mt-1 border border-gray-300 rounded-md shadow-sm"
                            />
                        </div>
                        <p className="text-white">Coordinates: {coordinates.join(", ")}</p>
                        <button
                            type="submit"
                            className="px-4 py-2 text-white bg-blue-500 rounded"
                            disabled={isLoading}
                        >
                            {isLoading ? "Submitting..." : "Setup Hunt"}
                        </button>
                        {message && <p className="mt-4 text-white">{message}</p>}
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default AdminPanel
