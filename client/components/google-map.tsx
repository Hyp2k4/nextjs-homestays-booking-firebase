"use client"

import React, { useState, useEffect } from "react"
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"

const containerStyle = {
  width: "100%",
  height: "500px",
  borderRadius: "0.5rem",
}

const defaultCenter = {
  lat: 20.2515,
  lng: 105.9745, // Default to Ninh Binh
}

export function GoogleMapWrapper() {
  const [center, setCenter] = useState(defaultCenter)
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  })

  useEffect(() => {
    const fetchMapSettings = async () => {
      const snap = await getDoc(doc(db, "settings", "map"))
      if (snap.exists()) {
        const data = snap.data()
        if (data.latitude && data.longitude) {
          setCenter({ lat: data.latitude, lng: data.longitude })
        }
      }
    }
    fetchMapSettings()
  }, [])

  if (!isLoaded) {
    return <div style={{ height: "500px", width: "100%", background: "#e0e0e0" }} />
  }

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={15}>
      <Marker position={center} />
    </GoogleMap>
  )
}
