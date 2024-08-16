import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react"
import { ethers } from "ethers"
import axios from "axios"
import Image from "next/image"
import voyageAbi from "../../../artifacts/contracts/VoyageTreasureHunt.sol/VoyageTreasureHuntv6.json"

const HuntForm = forwardRef(({ handleNewHunt, coordinates, locationName }, ref) => {
    const [clues, setClues] = useState([""])
    const [imageUrls, setImageUrls] = useState([""])
    const [answers, setAnswers] = useState([""])
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [activeHuntIndex, setActiveHuntIndex] = useState(0) // State to track the active hunt being edited

    useImperativeHandle(ref, () => ({
        updateAnswer(locationName) {
            const newAnswers = [...answers]
            newAnswers[activeHuntIndex] = locationName
            setAnswers(newAnswers)
        },
    }))

    useEffect(() => {
        // Update the answer for the active hunt index when the locationName changes
        if (locationName) {
            const newAnswers = [...answers]
            newAnswers[activeHuntIndex] = locationName
            setAnswers(newAnswers)
        }
    }, [locationName, activeHuntIndex, answers])

    const handleFileUpload = async (e, index) => {
        const file = e.target.files[0]
        const formData = new FormData()
        formData.append("file", file)
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET)

        try {
            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
                formData
            )
            const newImageUrls = [...imageUrls]
            newImageUrls[index] = response.data.secure_url
            setImageUrls(newImageUrls)
            setMessage("Image uploaded successfully.")
        } catch (error) {
            console.error("Error uploading file:", error)
            setMessage("Error uploading file. Please try again.")
        }
    }

    const generateSignedMessage = async (answerString) => {
        try {
            const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(answerString))
            console.log("Hash:", hash)

            const privateKey = "e40d7ec87c67e73fabeb65d8b62410238ebdaee7048992264e248d88655506be"
            const wallet = new ethers.Wallet(privateKey)
            const signedMessage = await wallet.signMessage(ethers.utils.arrayify(hash))
            console.log("Signed Message:", signedMessage)

            return signedMessage
        } catch (error) {
            console.error("Error generating signed message:", error)
            setMessage("Error signing message. Please try again.")
            return null
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (
            clues.some((clue) => !clue) ||
            imageUrls.some((url) => !url) ||
            answers.some((answer) => !answer)
        ) {
            setMessage("Please fill in all required fields.")
            return
        }

        setIsLoading(true)
        setMessage("")

        try {
            const signedAnswers = await Promise.all(
                answers.map((answer) => generateSignedMessage(answer))
            )

            if (signedAnswers.every((signed) => signed !== null)) {
                if (window.ethereum) {
                    await window.ethereum.request({ method: "eth_requestAccounts" })
                    const provider = new ethers.providers.Web3Provider(window.ethereum)
                    const signer = provider.getSigner()

                    const voyageContract = new ethers.Contract(
                        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
                        voyageAbi.abi,
                        signer
                    )

                    const tx = await voyageContract.submitTreasureHunts(
                        signedAnswers,
                        clues,
                        imageUrls
                    )
                    await tx.wait()

                    setMessage("Hunts successfully created and submitted!")
                    setClues([""])
                    setImageUrls([""])
                    setAnswers([""])
                } else {
                    setMessage("Please install MetaMask to interact with the blockchain.")
                }
            } else {
                setMessage("Error signing the answers. Please try again.")
            }
        } catch (error) {
            console.error("Error submitting hunt data:", error)
            setMessage("Error submitting hunt data. Please try again.")
        }

        setIsLoading(false)
    }

    const addHunt = () => {
        setClues([...clues, ""])
        setImageUrls([...imageUrls, ""])
        setAnswers([...answers, ""])
        setActiveHuntIndex(answers.length) // Set the active hunt index to the newly added hunt
    }

    return (
        <div className="w-full max-w-md p-4 text-white bg-black bg-opacity-75 rounded-md shadow-lg">
            <form onSubmit={handleSubmit}>
                {clues.map((clue, index) => (
                    <div key={index} onClick={() => setActiveHuntIndex(index)}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium">Clue</label>
                            <input
                                type="text"
                                value={clue}
                                onChange={(e) => {
                                    const newClues = [...clues]
                                    newClues[index] = e.target.value
                                    setClues(newClues)
                                }}
                                placeholder="Clue"
                                className="w-full p-2 mt-1 text-black bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium">Image</label>
                            <input
                                type="file"
                                onChange={(e) => handleFileUpload(e, index)}
                                className="w-full p-2 mt-1 text-black bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            {imageUrls[index] && (
                                <div className="mt-4">
                                    <Image
                                        src={imageUrls[index]}
                                        alt="Clue"
                                        width={320}
                                        height={240}
                                        className="w-full h-auto rounded-md"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium">Answer</label>
                            <input
                                type="text"
                                value={answers[index]}
                                onChange={(e) => {
                                    const newAnswers = [...answers]
                                    newAnswers[index] = e.target.value
                                    setAnswers(newAnswers)
                                }}
                                placeholder="Answer"
                                className="w-full p-2 mt-1 text-black bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addHunt}
                    className="w-full py-2 mt-4 text-white bg-blue-500 rounded-md hover:bg-blue-600"
                >
                    Add Another Hunt
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2 mt-4 text-white bg-green-500 rounded-md hover:bg-green-600"
                >
                    {isLoading ? "Saving..." : "Create Hunts"}
                </button>
                {message && <p className="mt-4">{message}</p>}
            </form>
        </div>
    )
})

HuntForm.displayName = "HuntForm" // Set the display name for debugging

export default HuntForm
