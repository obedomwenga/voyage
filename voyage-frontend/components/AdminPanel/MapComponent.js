"use client"

import React, { useEffect, useRef } from "react"
import mapboxgl from "mapbox-gl"
import MapboxGeocoder from "@mapbox/mapbox-sdk/services/geocoding"

const MapComponent = ({ setCoordinates, setLocationName, handleMapClick }) => {
    const mapContainerRef = useRef(null)
    const map = useRef(null)
    const marker = useRef(null)

    // Initialize geocoding service
    const geocoder = MapboxGeocoder({ accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN })

    useEffect(() => {
        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

        // Initialize the map
        map.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: "mapbox://styles/mapbox/streets-v11",
            center: [0, 0],
            zoom: 2,
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

            // Reverse geocode to get location name (cities, towns, points of interest, landmarks)
            try {
                const response = await geocoder
                    .reverseGeocode({
                        query: coords,
                        types: ["poi.landmark", "poi", "place", "locality", "neighborhood"], // Prioritize landmarks and POIs
                    })
                    .send()

                let locationName = "Unknown location"

                if (response.body.features.length > 0) {
                    // Find the most specific feature (landmark or POI)
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
