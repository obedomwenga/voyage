import React from "react"

const HuntList = ({ hunts, handleHuntClick }) => (
    <>
        <h2 className="mb-2 text-lg font-bold text-white">Active Hunts</h2>
        {hunts.length > 0 ? (
            hunts.map((hunt, index) => (
                <div
                    key={index}
                    className="p-4 mb-4 text-white bg-gray-900 rounded cursor-pointer hover:bg-gray-800"
                    onClick={() => handleHuntClick(index)}
                >
                    <h3 className="font-semibold">{hunt.id}</h3>
                    <p className="text-sm">{hunt.Clue}</p>
                </div>
            ))
        ) : (
            <p className="text-white">No Active Hunts</p>
        )}
    </>
)

export default HuntList
