// components/Treasurehunt/MapComponent.js

import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

const MapComponent = ({ hunts, currentClueIndex, handleHuntClick }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return; // Initialize map only once
    
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [0, 0],
      zoom: 2,
    });

    map.current.on('load', () => {
      console.log("Map loaded successfully");
    });
  }, []);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    const markers = document.querySelectorAll('.mapboxgl-marker');
    markers.forEach(marker => marker.remove());

    // Add new markers
    hunts.forEach((hunt, index) => {
      const marker = new mapboxgl.Marker({ color: currentClueIndex === index ? 'red' : 'blue' })
        .setLngLat([hunt.Coordinates.lng, hunt.Coordinates.lat])
        .addTo(map.current)
        .getElement()
        .addEventListener('click', () => handleHuntClick(index));
    });
  }, [hunts, currentClueIndex, handleHuntClick]);

  return <div ref={mapContainer} className="map-container" style={{ height: '100%', width: '100%' }} />;
};

export default MapComponent;
