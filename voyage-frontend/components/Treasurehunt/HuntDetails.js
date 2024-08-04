import React from 'react';
import Image from 'next/image';

const HuntDetails = ({ hunt, guess, setGuess, handleGuessSubmit, message, setCurrentClueIndex }) => {
  if (!hunt) {
    return <div>Loading...</div>; // Handle case where hunt is undefined
  }

  return (
    <div className="p-4 bg-black bg-opacity-75 rounded shadow-md text-white">
      <h2 className="text-lg font-bold mb-2">Treasure Hunt</h2>
      <p className="mb-4">Check out the riddle below!</p>
      <p className="mb-4">Reward: {hunt.Rewards} VOY</p> {/* Display the reward amount */}
      {hunt.URL ? (
        <div className="mb-4">
          <Image src={hunt.URL} alt="Treasure Hunt Clue" width={320} height={240} />
        </div>
      ) : (
        <p className="text-gray-400 mb-4">No image available</p>
      )}
      <p className="mb-4">{hunt.Clue}</p>
      <form onSubmit={handleGuessSubmit}>
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          className="p-2 rounded mb-2 w-full text-black"
          placeholder="Enter your guess"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">Submit Guess</button>
      </form>
      {message && <p className="mt-4">{message}</p>}
      <button onClick={() => setCurrentClueIndex(null)} className="mt-4 bg-gray-500 text-white p-2 rounded w-full">Back to Hunts</button>
    </div>
  );
};

export default HuntDetails;
