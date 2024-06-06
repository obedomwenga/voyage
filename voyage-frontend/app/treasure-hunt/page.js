"use client";

import { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import Navbar from '../../components/NavBar';
import Footer from '../../components/LandingPage/Footer';
import Image from 'next/image';
import { ethers } from 'ethers';
import contractABI from '../../../artifacts/contracts/ VoyageTreasureHunt.sol/VoyageTreasureHunt.json'; // Adjust the path as necessary

const TreasureHunt = () => {
  const [clue, setClue] = useState("");
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);

  const contractAddress = "0x3305384F687d803372190B29A79F3Ff00D4eEb14"; // Replace with your actual contract address

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1Ijoib2JlZG9td2VuZ2EiLCJhIjoiY2x3ZmlvajJyMXFnbjJqcGxmMnVpcXU2NyJ9.xVSqRYlKN5P6gGF2H5WGOw'; // Replace with your Mapbox access token
    new mapboxgl.Map({
      container: 'map', // container ID
      style: 'mapbox://styles/mapbox/streets-v11', // style URL
      center: [0, 0], // starting position [lng, lat]
      zoom: 2, // starting zoom
    });
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);
      const signer = provider.getSigner();
      setSigner(signer);
      if (contractABI.abi.length > 0) {
        const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);
        setContract(contract);

        // Fetch the current clue
        contract.activeHuntInfo().then((huntInfo) => {
          setClue(huntInfo.treasureHunt.clue);
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
      const transaction = await contract.submitAnswer(guess, { value: ethers.parseUnits("0.1", "ether") }); // Adjust FTM fee if necessary
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
      <div className="h-screen">
        <div id="map" className="h-full w-full relative"></div>
        <div className="absolute top-0 right-0 p-4">
          <button className="bg-blue-500 px-4 py-2 rounded">Start Hunt</button>
        </div>
        <div className="absolute top-0 left-0 p-4 bg-white bg-opacity-75 rounded shadow-md">
          <h2 className="text-lg font-bold mb-2">Clue:</h2>
          <p className="mb-4">{clue}</p>
          <Image src="/Clue.jpg" alt="Treasure Hunt Clue" width={320} height={240} />
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
          {message && <p className="mt-4">{message}</p>}
        </div>
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default TreasureHunt;
