import { ethers } from "ethers"
import axios from "axios"
import React, { useState } from "react"
import voyageAbi from "../../../artifacts/contracts/VoyageTreasureHunt.sol/VoyageTreasureHuntv5.json" // Ensure this path is correct

const HuntForm = ({ handleNewHunt, coordinates }) => {
    const [clues, setClues] = useState([""])
    const [imageUrls, setImageUrls] = useState([""])
    const [answers, setAnswers] = useState([""])
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState("")

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

    // Function to generate and sign the hash
    const generateSignedMessage = async (answerString) => {
        try {
            // Generate the hash
            const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(answerString))
            console.log("Hash:", hash) // This is the bytes32 value

            // Sign the hash using the private key of the answer signer
            const privateKey = "e40d7ec87c67e73fabeb65d8b62410238ebdaee7048992264e248d88655506be" // Replace with actual private key
            const wallet = new ethers.Wallet(privateKey)
            const signedMessage = await wallet.signMessage(ethers.utils.arrayify(hash))
            console.log("Signed Message:", signedMessage) // This is the 65-byte signed message

            return signedMessage
        } catch (error) {
            console.error("Error generating signed message:", error)
            setMessage("Error signing message. Please try again.")
            return null
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Ensure all fields are filled out
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
                    // Request account access
                    await window.ethereum.request({ method: "eth_requestAccounts" })
                    const provider = new ethers.providers.Web3Provider(window.ethereum)
                    const signer = provider.getSigner()

                    // Connect to the smart contract
                    const voyageContract = new ethers.Contract(
                        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS, // Address of the deployed contract
                        voyageAbi.abi, // Correctly access the ABI array
                        signer
                    )

                    // Submit the new hunts to the contract
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
    }

    return (
        <div className="w-full max-w-md p-4 text-white bg-black bg-opacity-75 rounded-md shadow-lg">
            <form onSubmit={handleSubmit}>
                {clues.map((clue, index) => (
                    <div key={index}>
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
                                    <img
                                        src={imageUrls[index]}
                                        alt="Clue"
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
}

export default HuntForm
