"use client"

import React, { useEffect, useRef } from "react"
import mapboxgl from "mapbox-gl"
import MapboxGeocoder from "@mapbox/mapbox-sdk/services/geocoding"

const MapComponent = ({
    hunts,
    currentClueIndex,
    handleHuntClick,
    setGuessLocation,
    setShowConfirm,
    setCountryName,
}) => {
    const mapContainer = useRef(null)
    const map = useRef(null)
    const marker = useRef(null)

    useEffect(() => {
        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

        // Initialize the geocoder inside the useEffect
        const geocoder = MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
        })

        // Initialize the map
        if (!map.current) {
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: "mapbox://styles/mapbox/streets-v11",
                center: [0, 0],
                zoom: 2,
            })

            // Add click event listener
            map.current.on("click", async (e) => {
                const { lng, lat } = e.lngLat
                const zoomLevel = map.current.getZoom()

                let types = ["place"] // Default type

                // Adjust types based on zoom level
                if (zoomLevel < 5) {
                    types = ["country"]
                } else if (zoomLevel >= 5 && zoomLevel < 10) {
                    types = ["place"]
                } else if (zoomLevel >= 10 && zoomLevel < 15) {
                    types = ["locality", "neighborhood"]
                } else {
                    types = ["poi.landmark", "poi"]
                }

                try {
                    const response = await geocoder
                        .reverseGeocode({
                            query: [lng, lat],
                            types: types,
                        })
                        .send()

                    let locationName = "Unknown location"
                    if (response.body.features.length > 0) {
                        // Extract the location name based on zoom level
                        locationName = response.body.features[0].text || "Unknown location"
                    }

                    setCountryName(locationName) // Update the location name state
                } catch (error) {
                    console.error("Error fetching location name:", error)
                    setCountryName("Error fetching location")
                }

                setGuessLocation({ lng, lat })
                setShowConfirm(true)

                // Remove previous marker if it exists
                if (marker.current) {
                    marker.current.remove()
                }

                // Create a new marker at the clicked location
                marker.current = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map.current)
            })
        }
    }, [setGuessLocation, setShowConfirm, setCountryName])

    // Clear and add new markers logic
    useEffect(() => {
        if (!map.current) return

        const markers = document.querySelectorAll(".mapboxgl-marker")
        markers.forEach((marker) => marker.remove())

        hunts.forEach((hunt, index) => {
            if (hunt.Coordinates) {
                const { lat, lng } = hunt.Coordinates
                if (lat !== undefined && lng !== undefined) {
                    new mapboxgl.Marker({ color: currentClueIndex === index ? "red" : "blue" })
                        .setLngLat([lng, lat])
                        .addTo(map.current)
                        .getElement()
                        .addEventListener("click", () => handleHuntClick(index))
                }
            }
        })
    }, [hunts, currentClueIndex, handleHuntClick])

    return (
        <div
            ref={mapContainer}
            className="map-container"
            style={{ height: "100%", width: "100%" }}
        />
    )
}

export default MapComponent
