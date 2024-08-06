import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from '@mapbox/mapbox-sdk/services/geocoding';

const MapComponent = ({ setCoordinates, setCountryName }) => {
  const mapContainerRef = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);

  // Initialize geocoding service
  const geocoder = MapboxGeocoder({ accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN });

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    map.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [0, 0],
      zoom: 2,
    });

    map.current.on("click", async (e) => {
      const coords = [e.lngLat.lng, e.lngLat.lat];
      setCoordinates(coords);

      // Remove previous marker if it exists
      if (marker.current) {
        marker.current.remove();
      }

      // Create a new marker at the clicked location
      marker.current = new mapboxgl.Marker()
        .setLngLat(coords)
        .addTo(map.current);

      // Reverse geocode to get country name
      try {
        const response = await geocoder.reverseGeocode({
          query: coords,
          types: ['country']
        }).send();
        const countryName = response.body.features[0]?.text || 'Unknown location';
        setCountryName(countryName);
      } catch (error) {
        console.error('Error fetching country name:', error);
        setCountryName('Error fetching location');
      }
    });

    return () => {
      // Cleanup on unmount
      map.current.remove();
    };
  }, [setCoordinates, setCountryName]);

  return <div ref={mapContainerRef} className="w-full h-full"></div>;
};

export default MapComponent;
