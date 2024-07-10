"use client";

import React, { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Landingpage/Footer';
import WelcomeModal from '../../components/WelcomeModal';
import Image from 'next/image';
import { ethers } from 'ethers';
import contractABI from '../../artifacts/contracts/VoyageTreasureHunt.sol/VoyageTreasureHunt.json';
import voyTokenABI from '../../artifacts/contracts/voyToken.sol/VoyToken.json'; // Ensure the correct import for the VOY token ABI
import Confetti from 'react-confetti';

const TreasureHunt = () => {
  const [currentClueIndex, setCurrentClueIndex] = useState(null); // null means no hunt selected
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [hunts, setHunts] = useState([]);
  const [submissionCooldown, setSubmissionCooldown] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [voyContract, setVoyContract] = useState(null);

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const voyTokenAddress = process.env.NEXT_PUBLIC_VOY_TOKEN_ADDRESS; // Ensure this is in your .env file

  useEffect(() => {
    fetch('/clues.json')
      .then(response => response.json())
      .then(data => setHunts(data))
      .catch(error => console.error("Error fetching hunts:", error));
  }, []);

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [0, 0],
      zoom: 2,
    });

    hunts.forEach((hunt, index) => {
      const marker = new mapboxgl.Marker()
        .setLngLat([hunt.Coordinates.lng, hunt.Coordinates.lat])
        .addTo(map)
        .getElement()
        .addEventListener('click', () => handleHuntClick(index));
    });
  }, [hunts]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);
      const signer = provider.getSigner();
      setSigner(signer);

      if (contractAddress) {
        const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);
        setContract(contract);
      }

      if (voyTokenAddress) {
        const voyContract = new ethers.Contract(voyTokenAddress, voyTokenABI.abi, signer);
        setVoyContract(voyContract);
      }
    }
  }, [contractAddress, voyTokenAddress]);

  const checkVoyBalance = async () => {
    if (!signer || !voyContract) return 0;
    try {
      const balance = await voyContract.balanceOf(await signer.getAddress());
      return ethers.utils.formatUnits(balance, 18);
    } catch (error) {
      console.error("Error checking VOY balance:", error);
      alert("Error checking balance.");
      return 0;
    }
  };

  const handleGuessSubmit = async (e) => {
    e.preventDefault();
    if (!contract) {
      setMessage("Please connect your wallet first.");
      return;
    }

    const voyBalance = await checkVoyBalance();

    if (voyBalance < 5000) {
      setMessage("You need at least 5000 VOY tokens to submit an answer.");
      return;
    }

    if (submissionCooldown) {
      setMessage("Please wait 5 seconds before submitting another answer.");
      return;
    }

    setSubmissionCooldown(true);
    setTimeout(() => setSubmissionCooldown(false), 5000);

    const currentClue = hunts[currentClueIndex];
    try {
      const transaction = await contract.submitAnswer(guess, { value: ethers.utils.parseEther("0.1") });
      await transaction.wait();
      setMessage(`Congratulations! You found the treasure and earned ${currentClue.Rewards}!`);
      setConfetti(true);
      showLocationOnMap(currentClue.Coordinates);
    } catch (error) {
      console.error("Error submitting guess:", error);
      setMessage("Error occurred. Try again!");
    }

    setGuess("");
  };

  const handleHuntClick = (index) => {
    setCurrentClueIndex(index);
    setMessage('');
    setConfetti(false);
  };

  const showLocationOnMap = (coordinates) => {
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [coordinates.lng, coordinates.lat],
      zoom: 10,
    });

    new mapboxgl.Marker()
      .setLngLat([coordinates.lng, coordinates.lat])
      .addTo(map);
  };

  return (
    <div>
      {confetti && <Confetti />}
      <Navbar onWalletConnected={(address) => console.log(`Wallet connected: ${address}`)} />
      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
      <div className="h-screen relative">
        <div id="map" className="h-full w-full"></div>
        <div className="absolute top-0 left-0 p-4 bg-black bg-opacity-75 rounded shadow-md max-w-md w-full">
          {currentClueIndex === null ? (
            <>
              <h2 className="text-lg font-bold mb-2 text-white">Active Hunts</h2>
              {hunts.length > 0 ? (
                hunts.map((hunt, index) => (
                  <div key={index} className="mb-4 cursor-pointer text-white" onClick={() => handleHuntClick(index)}>
                    <h3>{hunt.PlaceID}</h3>
                    <p>{hunt.Clue}</p>
                  </div>
                ))
              ) : (
                <p className="text-white">No Active Hunts</p>
              )}
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold mb-2 text-white">Treasure Hunt</h2>
              <p className="mb-4 text-white">Check out the riddle below!</p>
              <p className="mb-4 text-white">Reward: {hunts[currentClueIndex].Rewards}</p>
              <Image src={hunts[currentClueIndex].URL} alt="Treasure Hunt Clue" width={320} height={240} style={{ width: 'auto', height: 'auto' }} />
              <p className="text-white">{hunts[currentClueIndex].Clue}</p>
              <form onSubmit={handleGuessSubmit}>
                <input
                  type="text"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  placeholder="Enter your guess"
                  className="px-4 py-2 border rounded mb-4 w-full"
                />
                <button type="submit" className="bg-blue-500 px-4 py-2 rounded w-full">Submit</button>
              </form>
              {message && <p className="mt-4 text-white">{message}</p>}
              <button onClick={() => setCurrentClueIndex(null)} className="mt-4 text-white">Back to hunts</button>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TreasureHunt;
