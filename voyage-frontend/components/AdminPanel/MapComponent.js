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

        // Initialize the map only once
        if (!map.current) {
            map.current = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: "mapbox://styles/mapbox/streets-v11",
                center: [0, 0], // Centered on the world map
                zoom: 2, // Lower zoom level for a broader view
            })

            map.current.on("mouseenter", () => {
                map.current.getCanvas().style.cursor = "crosshair"
            })

            map.current.on("mouseleave", () => {
                map.current.getCanvas().style.cursor = ""
            })

            map.current.on("click", async (e) => {
                const coords = [e.lngLat.lng, e.lngLat.lat]

                // Remove previous marker if it exists
                if (marker.current) {
                    marker.current.remove()
                }

                // Create a new marker at the clicked location
                marker.current = new mapboxgl.Marker().setLngLat(coords).addTo(map.current)

                const zoomLevel = map.current.getZoom()

                let locationName = "Unknown location"

                try {
                    // Geocoding based on zoom level
                    const geocoder = MapboxGeocoder({ accessToken: mapboxgl.accessToken })

                    if (zoomLevel < 14) {
                        let types
                        if (zoomLevel < 6) {
                            types = ["country"]
                        } else if (zoomLevel >= 6 && zoomLevel < 10) {
                            types = ["place"]
                        } else if (zoomLevel >= 10 && zoomLevel < 14) {
                            types = ["locality", "neighborhood"]
                        }

                        const response = await geocoder
                            .reverseGeocode({
                                query: coords,
                                types,
                            })
                            .send()

                        if (response.body.features.length > 0) {
                            locationName = response.body.features[0].text
                        }
                    } else {
                        const url = `https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/tilequery/${coords[0]},${coords[1]}.json?layers=poi_label&radius=50&access_token=${mapboxgl.accessToken}`
                        const response = await fetch(url)
                        const data = await response.json()

                        if (data.features.length > 0) {
                            locationName = data.features[0].properties.name || "Unknown location"
                        }
                    }

                    // Update location and coordinates without causing a re-render
                    setLocationName(locationName)
                    setCoordinates(coords)

                    if (handleMapClick) {
                        handleMapClick(locationName, coords)
                    }
                } catch (error) {
                    console.error("Error fetching location name:", error)
                    setLocationName("Error fetching location")
                }
            })
        }

        // Cleanup on unmount
        return () => {
            if (map.current) {
                map.current.remove()
                map.current = null
            }
        }
    }, [setCoordinates, setLocationName, handleMapClick])

    return (
        <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: "500px" }}></div>
    )
}

export default MapComponent
