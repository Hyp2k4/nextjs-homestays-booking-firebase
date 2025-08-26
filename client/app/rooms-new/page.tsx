"use client"

import { useState, useEffect } from "react"
import { TravelHeader } from "@/components/travel/header"
import { TravelFooter } from "@/components/travel/footer"
import { RoomCard } from "@/components/travel/cards"
import { GridSkeleton, RoomCardSkeleton, SearchLoading } from "@/components/travel/loading"
import { Button } from "@/components/ui/button"
import { 
  SlidersHorizontal, 
  Search, 
  MapPin, 
  DollarSign,
  Grid3X3,
  List,
  ChevronDown
} from "lucide-react"
import { PropertyService } from "@/lib/property-service"
import { Room } from "@/types/property"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const sortOptions = [
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest First" },
]

const priceRanges = [
  { value: "0-500000", label: "Under 500,000₫" },
  { value: "500000-1000000", label: "500,000₫ - 1,000,000₫" },
  { value: "1000000-2000000", label: "1,000,000₫ - 2,000,000₫" },
  { value: "2000000-5000000", label: "2,000,000₫ - 5,000,000₫" },
  { value: "5000000+", label: "Over 5,000,000₫" },
]

const roomTypes = [
  { value: "single", label: "Single Room" },
  { value: "double", label: "Double Room" },
  { value: "suite", label: "Suite" },
  { value: "family", label: "Family Room" },
  { value: "dormitory", label: "Dormitory" },
]

export default function RoomsNewPage() {
  const [rooms, setRooms] = useState<any[]>([])
  const [homestayById, setHomestayById] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  
  // Filters
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    priceRange: "",
    roomType: "",
    capacity: "",
    sortBy: "newest"
  })

  useEffect(() => {
    fetchRooms()
  }, [])

  useEffect(() => {
    if (!loading) {
      applyFilters()
    }
  }, [filters, loading])

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const { rooms: allRooms, homestayById: map } = await PropertyService.getAllPublicRooms()
      setRooms(allRooms)
      setHomestayById(map)
    } catch (error) {
      console.error("Error fetching rooms:", error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    setSearching(true)
    
    // Simulate search delay
    setTimeout(() => {
      setSearching(false)
    }, 500)
  }

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      location: "",
      priceRange: "",
      roomType: "",
      capacity: "",
      sortBy: "newest"
    })
  }

  // Apply filters to rooms
  const filteredRooms = rooms.filter((room) => {
    const homestay = homestayById[room.homestayId]
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesSearch = [
        room.roomName,
        room.roomType,
        room.description,
        homestay?.name
      ].some(field => field?.toLowerCase().includes(searchLower))
      
      if (!matchesSearch) return false
    }

    // Room type filter
    if (filters.roomType && room.roomType.toLowerCase() !== filters.roomType) {
      return false
    }

    // Capacity filter
    if (filters.capacity && room.capacity < parseInt(filters.capacity)) {
      return false
    }

    // Price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(p => 
        p.includes('+') ? Infinity : parseInt(p)
      )
      if (room.pricePerNight < min || (max !== Infinity && room.pricePerNight > max)) {
        return false
      }
    }

    return true
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case "price-low":
        return a.pricePerNight - b.pricePerNight
      case "price-high":
        return b.pricePerNight - a.pricePerNight
      case "rating":
        return (b.rating?.average || 0) - (a.rating?.average || 0)
      default:
        return 0 // Keep original order
    }
  })

  return (
    <div className="min-h-screen bg-neutral-50">
      <TravelHeader />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary-600 to-primary-500 text-white py-16">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Find Your Perfect Room
              </h1>
              <p className="text-xl text-primary-100 mb-8">
                Discover comfortable and affordable rooms across Vietnam
              </p>
              
              {/* Search Bar */}
              <div className="bg-white rounded-2xl p-6 shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Search rooms..."
                      value={filters.search}
                      onChange={(e) => updateFilter("search", e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Location"
                      value={filters.location}
                      onChange={(e) => updateFilter("location", e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  
                  <select
                    value={filters.capacity}
                    onChange={(e) => updateFilter("capacity", e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Any capacity</option>
                    <option value="1">1+ guests</option>
                    <option value="2">2+ guests</option>
                    <option value="4">4+ guests</option>
                    <option value="6">6+ guests</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters & Results */}
        <section className="py-8">
          <div className="container mx-auto px-4 lg:px-6">
            {/* Filter Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
              <div className="flex items-center space-x-4">
                {/* Quick Filters */}
                <div className="flex items-center space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Price Range
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => updateFilter("priceRange", "")}>
                        Any Price
                      </DropdownMenuItem>
                      {priceRanges.map((range) => (
                        <DropdownMenuItem
                          key={range.value}
                          onClick={() => updateFilter("priceRange", range.value)}
                        >
                          {range.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Room Type
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => updateFilter("roomType", "")}>
                        Any Type
                      </DropdownMenuItem>
                      {roomTypes.map((type) => (
                        <DropdownMenuItem
                          key={type.value}
                          onClick={() => updateFilter("roomType", type.value)}
                        >
                          {type.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Results Count */}
                <span className="text-neutral-600">
                  {searching ? "Searching..." : `${filteredRooms.length} rooms found`}
                </span>

                {/* Sort */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Sort by
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {sortOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => updateFilter("sortBy", option.value)}
                      >
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* View Mode */}
                <div className="flex border border-neutral-200 rounded-lg">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "p-2 rounded-l-lg transition-colors",
                      viewMode === "grid" 
                        ? "bg-primary-600 text-white" 
                        : "text-neutral-600 hover:bg-neutral-100"
                    )}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "p-2 rounded-r-lg transition-colors",
                      viewMode === "list" 
                        ? "bg-primary-600 text-white" 
                        : "text-neutral-600 hover:bg-neutral-100"
                    )}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Results */}
            {searching ? (
              <SearchLoading />
            ) : loading ? (
              <GridSkeleton 
                count={12} 
                columns={viewMode === "grid" ? 3 : 1} 
                CardSkeleton={RoomCardSkeleton}
              />
            ) : filteredRooms.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  No rooms found
                </h3>
                <p className="text-neutral-600 mb-6">
                  Try adjusting your search criteria or filters
                </p>
                <Button onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className={cn(
                "grid gap-6",
                viewMode === "grid" 
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                  : "grid-cols-1"
              )}>
                {filteredRooms.map((room) => {
                  const homestay = homestayById[room.homestayId]
                  return (
                    <RoomCard 
                      key={room.id} 
                      room={{
                        ...room,
                        homestayName: homestay?.name
                      }}
                      className={viewMode === "list" ? "md:flex md:max-w-none" : ""}
                    />
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      
      <TravelFooter />
    </div>
  )
}
