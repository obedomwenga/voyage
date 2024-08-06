import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-sdk/services/geocoding';

const MapComponent = ({ hunts, currentClueIndex, handleHuntClick, setGuessLocation, setShowConfirm, setCountryName }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  const geocoder = MapboxGeocoder({ accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN });

  useEffect(() => {
    if (map.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [0, 0],
      zoom: 2,
    });

    map.current.on('click', async (e) => {
      const { lng, lat } = e.lngLat;
      try {
        const response = await geocoder.reverseGeocode({
          query: [lng, lat],
          types: ['country']
        }).send();

        const countryName = response.body.features[0]?.text || 'Unknown location';
        setCountryName(countryName); // Update the country name state
      } catch (error) {
        console.error('Error fetching country name:', error);
        setCountryName('Error fetching location');
      }

      setGuessLocation(e.lngLat);
      setShowConfirm(true);
      new mapboxgl.Marker().setLngLat(e.lngLat).addTo(map.current);
    });
  }, [geocoder, setGuessLocation, setShowConfirm, setCountryName]);

  // Clear and add new markers logic
  useEffect(() => {
    if (!map.current) return;

    const markers = document.querySelectorAll('.mapboxgl-marker');
    markers.forEach(marker => marker.remove());

    hunts.forEach((hunt, index) => {
      if (hunt.Coordinates) {
        const { lat, lng } = hunt.Coordinates;
        if (lat !== undefined && lng !== undefined) {
          new mapboxgl.Marker({ color: currentClueIndex === index ? 'red' : 'blue' })
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
