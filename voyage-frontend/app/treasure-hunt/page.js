"use client";

import React, { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import Navbar from '../../components/NavBar';
import Footer from '../../components/Landingpage/Footer';
import WelcomeModal from '../../components/WelcomeModal';
import Image from 'next/image';
import { ethers } from 'ethers'; // Correct import
import contractABI from '../../../artifacts/contracts/ VoyageTreasureHunt.sol/VoyageTreasureHunt.json'; // Adjust the path as necessary

const TreasureHunt = () => {
  const [currentClueIndex, setCurrentClueIndex] = useState(0);
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [clues, setClues] = useState([]);

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS; // Using environment variable for contract address

  useEffect(() => {
    // Fetch clues from the JSON file
    fetch('/clues.json')
      .then(response => response.json())
      .then(data => {
        setClues(data);
        console.log("Clues fetched successfully:", data);
      })
      .catch(error => console.error("Error fetching clues:", error));
  }, []);

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN; // Using environment variable for Mapbox access token
    new mapboxgl.Map({
      container: 'map', // container ID
      style: 'mapbox://styles/mapbox/streets-v11', // style URL
      center: [0, 0], // starting position [lng, lat]
      zoom: 2, // starting zoom
    });
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

        // Fetch the current clue
        contract.activeHuntInfo().then((huntInfo) => {
          setCurrentClueIndex(0); // Using the first clue for now
        });
      }
    }
  }, []);

  const handleGuessSubmit = async (e) => {
    e.preventDefault();
    if (!contract) {
      setMessage("Please connect your wallet first.");
      return;
    }

    try {
      const transaction = await contract.submitAnswer(guess, { value: ethers.utils.parseUnits("0.1", "ether") }); // Adjust ETH fee if necessary
      await transaction.wait();
      setMessage("Congratulations! You found the treasure!");
    } catch (error) {
      console.error("Error submitting guess:", error);
      setMessage("Incorrect answer or error occurred. Try again!");
    }

    setGuess("");
  };

  return (
    <div>
      <Navbar />
      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
      <div className="h-screen relative">
        <div id="map" className="h-full w-full"></div>
        <div className="absolute top-0 right-0 p-4">
          <button className="bg-blue-500 px-4 py-2 rounded">Start Hunt</button>
        </div>
        <div className="absolute top-0 left-0 p-4 bg-black bg-opacity-75 rounded shadow-md">
          <h2 className="text-lg font-bold mb-2 text-white">Treasure Hunt</h2>
          <p className="mb-4 text-white">Check out the riddle below!</p>
          <p className="mb-4 text-white">Reward: 500 VOY</p>
          {clues.length > 0 && (
            <>
              <Image src={clues[currentClueIndex].URL} alt="Treasure Hunt Clue" width={320} height={240} />
              <p className="text-white">{clues[currentClueIndex].Clue}</p>
            </>
          )}
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
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TreasureHunt;
