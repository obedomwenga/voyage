"use client"

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '../../components/Treasurehunt/Navbar';
import Footer from '../../components/Landingpage/Footer';
import WelcomeModal from '../../components/Treasurehunt/WelcomeModal';
import HuntList from '../../components/Treasurehunt/HuntList';
import HuntDetail from '../../components/Treasurehunt/HuntDetails';
import ResultPopup from '../../components/Treasurehunt/ResultPopup';
import Confetti from 'react-confetti';
import { ethers } from 'ethers';
import contractABI from '../../../artifacts/contracts/VoyageTreasureHunt.sol/VoyageTreasureHunt.json';

// Dynamically import MapComponent with client-side rendering
const MapComponent = dynamic(() => import('../../components/Treasurehunt/MapComponent'), {
  ssr: false,
});

const TreasureHunt = () => {
  const [currentClueIndex, setCurrentClueIndex] = useState(null);
  const [guessLocation, setGuessLocation] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);
  const [hunts, setHunts] = useState([]);
  const [submissionCooldown, setSubmissionCooldown] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

  useEffect(() => {
    fetch('/clues.json')
      .then(response => response.json())
      .then(data => setHunts(data))
      .catch(error => console.error("Error fetching hunts:", error));
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);
      const signer = provider.getSigner();
      setSigner(signer);
      if (contractABI.abi.length > 0) {
        const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);
        setContract(contract);
      }
    }
  }, []);

  const handleGuessSubmit = async () => {
    if (!contract) {
      setMessage("Please connect your wallet first.");
      return;
    }
    if (!guessLocation) {
      setMessage("Please select a location on the map.");
      return;
    }

    try {
      const guess = `${guessLocation.lng},${guessLocation.lat}`;
      const transaction = await contract.submitAnswer(guess);
      await transaction.wait();
      setMessage("Congratulations! You found the treasure!");
    } catch (error) {
      console.error("Error submitting guess:", error);
      setMessage("Incorrect answer or error occurred. Try again!");
    }

    setGuessLocation(null);
    setShowConfirm(false);
  };

  const handleHuntClick = (index) => {
    setCurrentClueIndex(index);
    setMessage('');
    setConfetti(false);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  return (
    <div>
      {confetti && <Confetti />}
      <Navbar />
      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
      <div className="h-screen relative">
        <MapComponent hunts={hunts} currentClueIndex={currentClueIndex} handleHuntClick={handleHuntClick} setGuessLocation={setGuessLocation} setShowConfirm={setShowConfirm} />
        <div className="absolute top-0 left-0 p-4 bg-black bg-opacity-75 rounded shadow-md max-w-md w-full">
          {currentClueIndex === null ? (
            <HuntList hunts={hunts} handleHuntClick={handleHuntClick} />
          ) : (
            <HuntDetail
              hunt={hunts[currentClueIndex]}
              guess={guessLocation ? `${guessLocation.lng},${guessLocation.lat}` : ""}
              setGuess={setGuessLocation}
              handleGuessSubmit={handleGuessSubmit}
              message={message}
              setCurrentClueIndex={setCurrentClueIndex}
            />
          )}
        </div>
        {showConfirm && (
          <div className="absolute bottom-0 left-0 p-4 bg-white bg-opacity-75 rounded shadow-md">
            <p>Are you sure you want to submit this location?</p>
            <button className="bg-green-500 px-4 py-2 rounded" onClick={handleGuessSubmit}>Yes</button>
            <button className="bg-red-500 px-4 py-2 rounded" onClick={() => setShowConfirm(false)}>No</button>
          </div>
        )}
        {message && <p className="absolute bottom-0 right-0 p-4 bg-white bg-opacity-75 rounded shadow-md">{message}</p>}
      </div>
      <Footer />
      <ResultPopup isOpen={isPopupOpen} onClose={handleClosePopup} message={popupMessage} isCorrect={isCorrect} />
    </div>
  );
};

export default TreasureHunt
