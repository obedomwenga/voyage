import React from "react"
import Image from "next/image"

const HuntDetails = ({
    hunt,
    guess,
    setGuess,
    handleGuessSubmit,
    message,
    setCurrentClueIndex,
}) => {
    if (!hunt) {
        return <div>Loading...</div> // Handle case where hunt is undefined
    }

    // Log the start time for debugging
    console.log("Raw hunt.startTime:", hunt.startTime)

    // Manual Parsing of Date String (format "MM/DD/YYYY, HH:MM:SS AM/PM")
    const parseDateString = (dateString) => {
        const [datePart, timePart] = dateString.split(", ");
        const [month, day, year] = datePart.split("/").map(Number);
        const [time, modifier] = timePart.split(" ");
        let [hours, minutes, seconds] = time.split(":").map(Number);

        // Convert 12-hour format to 24-hour format
        if (modifier === "PM" && hours < 12) {
            hours += 12;
        } else if (modifier === "AM" && hours === 12) {
            hours = 0;
        }

        return new Date(year, month - 1, day, hours, minutes, seconds);
    }

    const startTime = parseDateString(hunt.startTime)
    const isValidStartTime = !isNaN(startTime.getTime())

    console.log("Parsed startTime:", startTime)

    // Options for consistent date and time formatting
    const options = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true, // Use 12-hour format for consistency with the input format
    }

    // Convert start time to a human-readable format
    const startTimeReadable = isValidStartTime
        ? startTime.toLocaleString(undefined, options)
        : "Invalid start time"

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
                <span role="img" aria-label="expiration time">
                    ⏰
                </span>{" "}
                Hunt expires in 4 hours
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

export default HuntDetails;
