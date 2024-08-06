import React from "react"

const HuntList = ({ hunts, activeHuntNonce, handleHuntClick }) => {
    // Find the active hunt using the activeHuntNonce
    const activeHunt = hunts.find((hunt) => hunt.id === activeHuntNonce)

    return (
        <>
            <h2 className="mb-2 text-lg font-bold text-white">Active Hunt</h2>
            {activeHunt ? (
                <div
                    className="p-4 mb-4 text-white bg-gray-900 rounded cursor-pointer hover:bg-gray-800"
                    onClick={() => handleHuntClick(activeHunt.id)}
                >
                    <h3 className="font-semibold">Hunt ID: {activeHunt.id}</h3>
                    <p className="text-sm">{activeHunt.Clue}</p>
                </div>
            ) : (
                <p className="text-white">No Active Hunts</p>
            )}
        </>
    )
}

export default HuntList
