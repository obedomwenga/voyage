import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

const MapComponent = ({ hunts, currentClueIndex, handleHuntClick, setGuessLocation, setShowConfirm }) => {
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

    map.current.on('click', (e) => {
      setGuessLocation(e.lngLat);
      setShowConfirm(true);
      new mapboxgl.Marker().setLngLat(e.lngLat).addTo(map.current);
    });

    map.current.on('load', () => {
      console.log("Map loaded successfully");
    });
  }, [setGuessLocation, setShowConfirm]);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    const markers = document.querySelectorAll('.mapboxgl-marker');
    markers.forEach(marker => marker.remove());

    // Add new markers only if coordinates are available
    hunts.forEach((hunt, index) => {
      if (hunt.Coordinates) {
        const { lat, lng } = hunt.Coordinates;
        if (lat !== undefined && lng !== undefined) {
          const marker = new mapboxgl.Marker({ color: currentClueIndex === index ? 'red' : 'blue' })
            .setLngLat([lng, lat])
            .addTo(map.current)
            .getElement()
            .addEventListener('click', () => handleHuntClick(index));
        }
      }
    });
  }, [hunts, currentClueIndex, handleHuntClick]);

  return <div ref={mapContainer} className="map-container" style={{ height: '100%', width: '100%' }} />;
};

export default MapComponent;
