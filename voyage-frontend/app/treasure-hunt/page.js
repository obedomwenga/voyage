"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '../../components/Treasurehunt/Navbar';
import Footer from '../../components/Landingpage/Footer';
import WelcomeModal from '../../components/Treasurehunt/WelcomeModal';
import HuntList from '../../components/Treasurehunt/HuntList';
import HuntDetail from '../../components/Treasurehunt/HuntDetails';
import ResultPopup from '../../components/Treasurehunt/ResultPopup';
import Confetti from 'react-confetti';

// Dynamically import MapComponent with client-side rendering
const MapComponent = dynamic(() => import('../../components/Treasurehunt/MapComponent'), {
  ssr: false,
});

const TreasureHunt = () => {
  const [currentClueIndex, setCurrentClueIndex] = useState(null);
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);
  const [hunts, setHunts] = useState([]);
  const [submissionCooldown, setSubmissionCooldown] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    fetch('/clues.json')
      .then(response => response.json())
      .then(data => setHunts(data))
      .catch(error => console.error("Error fetching hunts:", error));
  }, []);

  const handleGuessSubmit = async (e) => {
    e.preventDefault();
    if (currentClueIndex === null) return;

    if (submissionCooldown) {
      setPopupMessage("Please wait 5 seconds before submitting another answer.");
      setIsPopupOpen(true);
      return;
    }

    setSubmissionCooldown(true);
    setTimeout(() => setSubmissionCooldown(false), 5000);

    const currentClue = hunts[currentClueIndex];

    if (guess.toLowerCase() === currentClue.Answer.toLowerCase()) {
      setPopupMessage(`Congratulations! You got it right, ${currentClue.Rewards} VOY have been transferred to your wallet.`);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 5000);  // Stop confetti after 5 seconds
    } else {
      setPopupMessage("Incorrect guess. Try again!");
    }

    setIsPopupOpen(true);
    setGuess("");
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
        <MapComponent hunts={hunts} currentClueIndex={currentClueIndex} handleHuntClick={handleHuntClick} />
        <div className="absolute top-0 left-0 p-4 bg-black bg-opacity-75 rounded shadow-md max-w-md w-full">
          {currentClueIndex === null ? (
            <HuntList hunts={hunts} handleHuntClick={handleHuntClick} />
          ) : (
            <HuntDetail
              hunt={hunts[currentClueIndex]}
              guess={guess}
              setGuess={setGuess}
              handleGuessSubmit={handleGuessSubmit}
              message={message}
              setCurrentClueIndex={setCurrentClueIndex}
            />
          )}
        </div>
      </div>
      <Footer />
      <ResultPopup isOpen={isPopupOpen} onClose={handleClosePopup} message={popupMessage} />
    </div>
  );
};

export default TreasureHunt;
