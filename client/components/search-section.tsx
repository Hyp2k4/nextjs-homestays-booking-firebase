"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { MapPin, Calendar, Users, Search } from "lucide-react"
import { vietnameseCities } from "@/data/mock-properties"
import type { SearchFilters } from "@/types/property"

interface SearchSectionProps {
  onSearch?: (filters: SearchFilters) => void
  initialFilters?: SearchFilters
}

export function SearchSection({ onSearch, initialFilters }: SearchSectionProps) {
  const [location, setLocation] = useState(initialFilters?.location || "")
  const [checkIn, setCheckIn] = useState(initialFilters?.checkIn || "")
  const [checkOut, setCheckOut] = useState(initialFilters?.checkOut || "")
  const [guests, setGuests] = useState(initialFilters?.guests || 2)

  const handleSearch = () => {
    const filters: SearchFilters = {
      location: location || undefined,
      checkIn: checkIn || undefined,
      checkOut: checkOut || undefined,
      guests: guests || undefined,
    }

    if (onSearch) {
      onSearch(filters)
    } else {
      // Default behavior - redirect to search page
      const params = new URLSearchParams()
      if (location) params.set("location", location)
      if (checkIn) params.set("checkIn", checkIn)
      if (checkOut) params.set("checkOut", checkOut)
      if (guests) params.set("guests", guests.toString())

      window.location.href = `/search?${params.toString()}`
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <Card className="p-6 max-w-4xl mx-auto bg-card/80 backdrop-blur-sm border-border/50">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Location */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Địa điểm
          </label>
          <Input
            placeholder="Hà Nội, TP.HCM, Đà Nẵng..."
            className="bg-input border-border"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyPress={handleKeyPress}
            list="cities"
          />
          <datalist id="cities">
            {vietnameseCities.map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
        </div>

        {/* Check-in */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Nhận phòng
          </label>
          <Input
            type="date"
            className="bg-input border-border"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        {/* Check-out */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Trả phòng
          </label>
          <Input
            type="date"
            className="bg-input border-border"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            min={checkIn || new Date().toISOString().split("T")[0]}
          />
        </div>

        {/* Guests */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Khách
          </label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="2"
              min="1"
              max="20"
              className="bg-input border-border flex-1"
              value={guests}
              onChange={(e) => setGuests(Number.parseInt(e.target.value) || 2)}
            />
            <Button size="icon" className="shrink-0" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
