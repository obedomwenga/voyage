"use client"

import React, { useEffect, useRef } from "react"
import mapboxgl from "mapbox-gl"

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

        if (!map.current) {
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: "mapbox://styles/mapbox/streets-v11",
                center: [0, 0], // Default center
                zoom: 2, // Default zoom level
            })

            map.current.on("click", async (e) => {
                const { lng, lat } = e.lngLat
                const zoomLevel = map.current.getZoom()

                // Geocoding API for country, city, and neighborhood
                if (zoomLevel < 15) {
                    let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`

                    // Adjust the types based on zoom level
                    if (zoomLevel < 5) {
                        url += "&types=country"
                    } else if (zoomLevel >= 5 && zoomLevel < 10) {
                        url += "&types=place" // City level
                    } else {
                        url += "&types=locality,neighborhood" // Neighborhood level
                    }

                    try {
                        const response = await fetch(url)
                        const data = await response.json()

                        let locationName = "Unknown location"
                        if (data.features.length > 0) {
                            locationName =
                                data.features[0].place_name.split(",")[0] || "Unknown location"
                        }

                        // Update the location name state
                        setCountryName(locationName)
                    } catch (error) {
                        console.error("Error fetching location name:", error)
                        setCountryName("Error fetching location")
                    }
                } else {
                    // Tilequery API for points of interest (POIs)
                    try {
                        const url = `https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/tilequery/${lng},${lat}.json?layers=poi_label&radius=50&access_token=${mapboxgl.accessToken}`
                        const response = await fetch(url)
                        const data = await response.json()

                        let locationName = "Unknown location"
                        if (data.features.length > 0) {
                            locationName = data.features[0].properties.name || "Unknown location"
                        }

                        // Update the location name state
                        setCountryName(locationName)
                    } catch (error) {
                        console.error("Error fetching location name:", error)
                        setCountryName("Error fetching location")
                    }
                }

                // Set the guessed location and show confirmation dialog
                setGuessLocation({ lng, lat })
                setShowConfirm(true)

                if (marker.current) {
                    marker.current.remove()
                }

                marker.current = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map.current)
            })
        }
    }, [setGuessLocation, setShowConfirm, setCountryName])

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
