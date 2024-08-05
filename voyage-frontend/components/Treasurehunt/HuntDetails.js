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

    return (
        <div className="p-4 text-white bg-black bg-opacity-75 rounded shadow-md">
            <h2 className="mb-2 text-lg font-bold">Treasure Hunt</h2>
            <p className="mb-4">Check out the riddle below!</p>
            <p className="mb-4">Reward: {hunt.Rewards} VOY</p> {/* Display the reward amount */}
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
                />
                <button type="submit" className="w-full p-2 text-white bg-blue-500 rounded">
                    Submit Guess
                </button>
            </form>
            {message && <p className="mt-4">{message}</p>}
            <button
                onClick={() => setCurrentClueIndex(null)}
                className="w-full p-2 mt-4 text-white bg-gray-500 rounded"
            >
                Back to Hunts
            </button>
        </div>
    )
}

export default HuntDetails
