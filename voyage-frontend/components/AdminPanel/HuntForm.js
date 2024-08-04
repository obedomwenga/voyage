import { ethers } from 'ethers';
import axios from 'axios';
import React, { useState } from 'react';
import voyageAbi from '../../../artifacts/contracts/VoyageTreasureHunt.sol/VoyageTreasureHunt.json'; // Ensure this path is correct

const HuntForm = ({ handleNewHunt, coordinates }) => {
  const [clue, setClue] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
        formData
      );
      setImageUrl(response.data.secure_url);
      setMessage("Image uploaded successfully.");
    } catch (error) {
      console.error("Error uploading file:", error);
      setMessage("Error uploading file. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!clue || !imageUrl || !answer) {
      setMessage("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      if (window.ethereum) {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        // Connect to the smart contract
        const voyageContract = new ethers.Contract(
          process.env.NEXT_PUBLIC_CONTRACT_ADDRESS, // Address of the deployed contract
          voyageAbi.abi, // Correctly access the ABI array
          signer
        );

        // Sign the answer
        const messageHash = ethers.utils.id(answer);
        const ethSignedMessageHash = ethers.utils.hashMessage(messageHash);
        const signedAnswer = await signer.signMessage(ethers.utils.arrayify(ethSignedMessageHash));

        // Submit the new hunt to the contract
        const tx = await voyageContract.submitTreasureHunt(signedAnswer, clue, imageUrl);
        await tx.wait();

        setMessage("Hunt successfully created and submitted!");
        setClue("");
        setImageUrl("");
        setAnswer("");
      } else {
        setMessage("Please install MetaMask to interact with the blockchain.");
      }
    } catch (error) {
      console.error("Error submitting hunt data:", error);
      setMessage("Error submitting hunt data. Please try again.");
    }

    setIsLoading(false);
  };

  return (
    <div className="bg-black bg-opacity-75 text-white p-4 rounded-md shadow-lg max-w-md w-full">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium">Clue</label>
          <input
            type="text"
            value={clue}
            onChange={(e) => setClue(e.target.value)}
            placeholder="Clue"
            className="w-full p-2 mt-1 bg-gray-200 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Image</label>
          <input
            type="file"
            onChange={handleFileUpload}
            className="w-full p-2 mt-1 bg-gray-200 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {imageUrl && (
            <div className="mt-4">
              <img src={imageUrl} alt="Clue" className="w-full h-auto rounded-md" />
            </div>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Answer</label>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Answer"
            className="w-full p-2 mt-1 bg-gray-200 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 mt-4 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          {isLoading ? 'Saving...' : 'Create Hunt'}
        </button>
        {message && <p className="mt-4">{message}</p>}
      </form>
    </div>
  );
};

export default HuntForm;
