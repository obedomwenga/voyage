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

    const geocoder = MapboxGeocoder({
        accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
    })

    useEffect(() => {
        if (map.current) return

        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/streets-v11",
            center: [0, 0],
            zoom: 2,
        })

        map.current.on("click", async (e) => {
            const { lng, lat } = e.lngLat

            try {
                const response = await geocoder
                    .reverseGeocode({
                        query: [lng, lat],
                        types: [
                            "poi.landmark",
                            "poi",
                            "place",
                            "locality",
                            "neighborhood",
                            "country",
                        ],
                    })
                    .send()

                let locationName = "Unknown location"
                if (response.body.features.length > 0) {
                    // Prioritize landmarks or POIs over general place names
                    const landmarkFeature = response.body.features.find((feature) =>
                        feature.place_type.includes("poi.landmark")
                    )
                    const poiFeature = response.body.features.find((feature) =>
                        feature.place_type.includes("poi")
                    )
                    const placeFeature = response.body.features.find((feature) =>
                        feature.place_type.includes("place")
                    )

                    if (landmarkFeature) {
                        locationName = landmarkFeature.text
                    } else if (poiFeature) {
                        locationName = poiFeature.text
                    } else if (placeFeature) {
                        locationName = placeFeature.text
                    }

                    // Add context (like city or region) to the location name
                    const context = response.body.features[0].context || []
                    const contextText = context.map((c) => c.text).join(", ")
                    if (contextText) {
                        locationName = `${locationName}, ${contextText}`
                    }
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
    }, [geocoder, setGuessLocation, setShowConfirm, setCountryName])

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
