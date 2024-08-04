import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

const MapComponent = ({ setCoordinates }) => {
  const mapContainerRef = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    map.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [0, 0],
      zoom: 2,
    });

    map.current.on("click", (e) => {
      const coords = [e.lngLat.lng, e.lngLat.lat];
      setCoordinates(coords);
      console.log("Coordinates:", coords);

      // Remove previous marker if it exists
      if (marker.current) {
        marker.current.remove();
      }

      // Create a new marker at the clicked location
      marker.current = new mapboxgl.Marker()
        .setLngLat(coords)
        .addTo(map.current);
    });

    return () => {
      // Cleanup on unmount
      map.current.remove();
    };
  }, [setCoordinates]);

  return <div ref={mapContainerRef} className="w-full h-full"></div>;
};

export default MapComponent;
