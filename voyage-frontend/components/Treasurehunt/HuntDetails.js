import React, { useState, useEffect } from "react"
import Image from "next/image"

const HuntDetails = ({
    hunt,
    guess,
    setGuess,
    handleGuessSubmit,
    message,
    setCurrentClueIndex,
}) => {
    const [currentTime, setCurrentTime] = useState(new Date())

    useEffect(() => {
        // Update current time every second
        const timerId = setInterval(() => setCurrentTime(new Date()), 1000)

        return () => clearInterval(timerId) // Cleanup interval on component unmount
    }, [])

    if (!hunt) {
        return <div>Loading...</div> // Handle case where hunt is undefined
    }

    // Assuming the token has 18 decimals (common for ERC20 tokens)
    const tokenDecimals = 18
    const readableReward = parseFloat(hunt.Rewards) / Math.pow(10, tokenDecimals)

    // Parse the start time and calculate the end time (4 hours later)
    const startTime = new Date(hunt.startTime)
    const isValidStartTime = !isNaN(startTime.getTime())
    const endTime = isValidStartTime ? new Date(startTime.getTime() + 4 * 60 * 60 * 1000) : null

    // Convert times to human-readable formats
    const startTimeReadable = isValidStartTime ? startTime.toLocaleString() : "Invalid start time"
    const endTimeReadable = endTime ? endTime.toLocaleString() : "Invalid end time"
    const currentTimeReadable = currentTime.toLocaleString()

    return (
        <div className="p-4 text-white bg-black bg-opacity-75 rounded shadow-md">
            <h2 className="mb-2 text-lg font-bold">Treasure Hunt</h2>
            <p className="mb-4">Check out the riddle below!</p>
            <p className="mb-2">Reward: {readableReward} VOY</p> {/* Display the reward amount */}
            <p className="mb-4">Start Time: {startTimeReadable}</p> {/* Display the start time */}
            <p className="mb-4">End Time: {endTimeReadable}</p> {/* Display the end time */}
            <p className="mb-4">Current Time: {currentTimeReadable}</p>{" "}
            {/* Display the current time */}
            {hunt.URL ? (
                <div className="mb-4">
                    <Image src={hunt.URL} alt="Treasure Hunt Clue" width={320} height={240} />
                </div>
            ) : (
                <p className="mb-4 text-gray-400">No image available</p>
            )}
            <p className="mb-4">{hunt.Clue}</p>
            <form onSubmit={handleGuessSubmit}>
                <input
                    type="text"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    className="w-full p-2 mb-2 text-black rounded"
                    placeholder="Enter your guess"
                    aria-label="Enter your guess"
                />
                <button type="submit" className="w-full p-2 text-white bg-blue-500 rounded">
                    Submit Guess
                </button>
            </form>
            {message && <p className="mt-4">{message}</p>}
            <button
                onClick={() => setCurrentClueIndex(null)}
                className="w-full p-2 mt-4 text-white bg-gray-500 rounded"
                aria-label="Back to Hunts"
            >
                Back to Hunts
            </button>
        </div>
    )
}

export default HuntDetails
