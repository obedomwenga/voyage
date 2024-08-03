import React, { useState } from 'react';
import axios from 'axios';

const HuntForm = ({ handleNewHunt, coordinates }) => {
  const [clue, setClue] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [answer, setAnswer] = useState('');
  const [reward, setReward] = useState('');
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
  
    if (!clue || !imageUrl || !answer || reward === '' || coordinates[0] === null || coordinates[1] === null) {
      setMessage("Please fill in all fields and set the coordinates.");
      return;
    }
  
    setIsLoading(true);
    setMessage("");
  
    try {
      const newClue = {
        Rewards: parseInt(reward, 10),
        Clue: clue,
        PlaceID: Math.floor(Math.random() * 1000000000), // Generate a random PlaceID
        URL: imageUrl,
        Answer: answer,
        Coordinates: { lat: coordinates[1], lng: coordinates[0] },
      };
  
      // Send the data to the backend
      const response = await axios.post('/api/save-clue', { clueData: newClue });
      if (response.status === 200) {
        setMessage("Hunt successfully created and saved!");
        setClue("");
        setImageUrl("");
        setAnswer("");
        setReward("");
        // Reset coordinates in parent state if needed
      } else {
        setMessage("Failed to save the hunt. Please try again.");
      }
    } catch (error) {
      console.error("Error saving hunt data:", error);
      setMessage("Error saving hunt data. Please try again.");
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
        <div className="mb-4">
          <label className="block text-sm font-medium">Reward (VOY)</label>
          <input
            type="number"
            value={reward}
            onChange={(e) => setReward(e.target.value)}
            placeholder="Reward"
            className="w-full p-2 mt-1 bg-gray-200 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Coordinates</label>
          <p className="mt-2">
            {coordinates[0] !== null && coordinates[1] !== null
              ? `Coordinates set: Latitude ${coordinates[1]}, Longitude ${coordinates[0]}`
              : "No coordinates set"}
          </p>
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
