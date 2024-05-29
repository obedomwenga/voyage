"use client";

import Navbar from '../../components/LandingPage/LandingNavBar';
import Footer from '../../components/LandingPage/Footer';
import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

const TreasureHunt = () => {
  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1Ijoib2JlZG9td2VuZ2EiLCJhIjoiY2x3ZmlvajJyMXFnbjJqcGxmMnVpcXU2NyJ9.xVSqRYlKN5P6gGF2H5WGOw'; // Replace with your Mapbox access token
    new mapboxgl.Map({
      container: 'map', // container ID
      style: 'mapbox://styles/mapbox/streets-v11', // style URL
      center: [0, 0], // starting position [lng, lat]
      zoom: 2, // starting zoom
    });
  }, []);

  return (
    <div>
      <Navbar />
      <div className="h-screen">
        <div id="map" className="h-full w-full"></div>
        <div className="absolute top-0 right-0 p-4">
          <button className="bg-blue-500 px-4 py-2 rounded">Start Hunt</button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TreasureHunt;
