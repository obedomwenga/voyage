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
        if (!hunt || !hunt.startTime) return

        // Update current time every second
        const timerId = setInterval(() => setCurrentTime(new Date()), 1000)

        // Cleanup interval on component unmount
        return () => clearInterval(timerId)
    }, [hunt])

    if (!hunt) {
        return <div>Loading...</div> // Handle case where hunt is undefined
    }

    // Log the start time for debugging
    console.log("Raw hunt.startTime:", hunt.startTime)

    // Manual Parsing of Date String (assuming format "DD/MM/YYYY, HH:MM:SS")
    const parseDateString = (dateString) => {
        const [datePart, timePart] = dateString.split(", ")
        const [day, month, year] = datePart.split("/").map(Number)
        const [hours, minutes, seconds] = timePart.split(":").map(Number)

        return new Date(year, month - 1, day, hours, minutes, seconds)
    }

    const startTime = parseDateString(hunt.startTime)
    const isValidStartTime = !isNaN(startTime.getTime())

    console.log("Parsed startTime:", startTime)

    const endTime = isValidStartTime ? new Date(startTime.getTime() + 4 * 60 * 60 * 1000) : null

    // Options for consistent date and time formatting
    const options = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false, // Use 24-hour time format
    }

    // Convert times to human-readable formats with consistent options
    const startTimeReadable = isValidStartTime
        ? startTime.toLocaleString(undefined, options)
        : "Invalid start time"
    const endTimeReadable = endTime
        ? endTime.toLocaleString(undefined, options)
        : "Invalid end time"
    const currentTimeReadable = currentTime.toLocaleString(undefined, options)

    return (
        <div className="p-4 text-white bg-black bg-opacity-75 rounded shadow-md">
            <h2 className="mb-2 text-lg font-bold">Treasure Hunt</h2>
            <p className="mb-4">Check out the riddle below!</p>
            <p className="mb-2">Reward: {parseFloat(hunt.Rewards) / Math.pow(10, 18)} VOY</p>
            <p className="mb-4">
                <span role="img" aria-label="start time">
                    🕒
                </span>{" "}
                Start Time: {startTimeReadable}
            </p>
            <p className="mb-4">
                <span role="img" aria-label="end time">
                    ⏰
                </span>{" "}
                End Time: {endTimeReadable}
            </p>
            <p className="mb-4">
                <span role="img" aria-label="current time">
                    🕔
                </span>{" "}
                Current Time: {currentTimeReadable}
            </p>
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
