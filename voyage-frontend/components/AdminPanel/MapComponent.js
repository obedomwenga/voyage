"use client"

import React, { useEffect, useRef } from "react"
import mapboxgl from "mapbox-gl"
import MapboxGeocoder from "@mapbox/mapbox-sdk/services/geocoding"

const MapComponent = ({ setCoordinates, setLocationName, handleMapClick }) => {
    const mapContainerRef = useRef(null)
    const map = useRef(null)
    const marker = useRef(null)

    useEffect(() => {
        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

        // Initialize geocoding service inside useEffect
        const geocoder = MapboxGeocoder({ accessToken: mapboxgl.accessToken })

        // Initialize the map with a lower zoom level
        map.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: "mapbox://styles/mapbox/streets-v11",
            center: [0, 0], // Centered on the world map
            zoom: 2, // Lower zoom level for a broader view
        })

        // Change cursor to selection mode when hovering over the map
        map.current.on("mouseenter", () => {
            map.current.getCanvas().style.cursor = "crosshair" // Change this to your preferred cursor style
        })

        map.current.on("mouseleave", () => {
            map.current.getCanvas().style.cursor = "" // Reset cursor when leaving the map
        })

        // Add click event listener
        map.current.on("click", async (e) => {
            const coords = [e.lngLat.lng, e.lngLat.lat]
            setCoordinates(coords)

            // Remove previous marker if it exists
            if (marker.current) {
                marker.current.remove()
            }

            // Create a new marker at the clicked location
            marker.current = new mapboxgl.Marker().setLngLat(coords).addTo(map.current)

            const zoomLevel = map.current.getZoom()

            // Reverse geocode to get location name based on zoom level
            try {
                let types
                if (zoomLevel < 6) {
                    // If zoomed out, get country names
                    types = ["country"]
                } else if (zoomLevel >= 6 && zoomLevel < 10) {
                    // If zoomed in moderately, get city names
                    types = ["place"]
                } else if (zoomLevel >= 10 && zoomLevel < 14) {
                    // If zoomed in closer, get neighborhood and locality names
                    types = ["locality", "neighborhood"]
                } else {
                    // If zoomed in very close, get detailed information like landmarks and POIs
                    types = ["poi.landmark", "poi"]
                }

                const response = await geocoder
                    .reverseGeocode({
                        query: coords,
                        types, // Dynamically use different types based on zoom level
                    })
                    .send()

                let locationName = "Unknown location"

                if (response.body.features.length > 0) {
                    locationName = response.body.features[0].text // Use only the name, not the full address
                }

                // Set the name of the location (just the name, no address details)
                setLocationName(locationName)
                handleMapClick(locationName, coords) // Call the handleMapClick function
            } catch (error) {
                console.error("Error fetching location name:", error)
                setLocationName("Error fetching location")
            }
        })

        // Cleanup on unmount
        return () => {
            if (map.current) map.current.remove()
        }
    }, [setCoordinates, setLocationName, handleMapClick])

    return <div ref={mapContainerRef} className="w-full h-full"></div>
}

export default MapComponent
