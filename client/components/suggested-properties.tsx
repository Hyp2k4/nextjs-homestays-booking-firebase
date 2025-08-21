"use client"

import { useState, useEffect } from "react"
import { PropertyService } from "@/lib/property-service"
import type { Property, Room } from "@/types/property"
import { PropertyCard } from "@/components/property-card"
import { RoomCard } from "./room-card"

interface SuggestedPropertiesProps {
  type: "homestay" | "room"
}

export function SuggestedProperties({ type }: SuggestedPropertiesProps) {
  const [items, setItems] = useState<(Property | Room)[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSuggestedItems = async () => {
      setLoading(true)
      try {
        if (type === "homestay") {
          const data = await PropertyService.getSuggestedProperties()
          setItems(data)
        } else {
          const data = await PropertyService.getSuggestedRooms()
          setItems(data)
        }
      } catch (error) {
        console.error(`Error fetching suggested ${type}s:`, error)
      } finally {
        setLoading(false)
      }
    }

    fetchSuggestedItems()
  }, [type])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Gợi ý cho bạn</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          if ("pricePerNight" in item && "maxGuests" in item) {
            return <PropertyCard key={item.id} property={item as Property} />
          } else {
            return <RoomCard key={item.id} room={item as Room} />
          }
        })}
      </div>
    </div>
  )
}
