"use client"; // Ensure this is a Client Component

import React, { useState } from "react";
import Navbar from "../../components/Treasurehunt/Navbar";
import Footer from "../../components/Landingpage/Footer";
import MapComponent from "../../components/AdminPanel/MapComponent";
import HuntForm from "../../components/AdminPanel/HuntForm";
import ExistingHunts from "../../components/AdminPanel/ExistingHunts";
import Messages from "../../components/AdminPanel/Messages";

const AdminPanel = () => {
  const [message, setMessage] = useState("");
  const [hunts, setHunts] = useState([]);
  const [coordinates, setCoordinates] = useState([null, null]);

  const handleNewHunt = (newHunt) => {
    setHunts([...hunts, newHunt]);
    setMessage("Hunt successfully created!");
  };

  return (
    <div className="relative h-screen">
      <Navbar />
      <div className="relative h-full">
        <MapComponent setCoordinates={setCoordinates} />
        <div className="absolute top-0 right-0 m-4 z-10">
          <HuntForm handleNewHunt={handleNewHunt} coordinates={coordinates} />
        </div>
        <div className="absolute top-0 left-0 m-4 z-10">
          <ExistingHunts hunts={hunts} />
        </div>
        <Messages message={message} />
      </div>
      <Footer />
    </div>
  );
};

export default AdminPanel;
