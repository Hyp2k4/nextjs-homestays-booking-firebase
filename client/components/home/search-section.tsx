"use client"

import { useState } from "react"
import { Search, MapPin, Calendar, Users, Filter, SlidersHorizontal, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

const popularDestinations = [
  { name: "Sapa", count: 45, image: "/images/sapa.jpg" },
  { name: "Đà Lạt", count: 67, image: "/images/dalat.jpg" },
  { name: "Hội An", count: 89, image: "/images/hoian.jpg" },
  { name: "Phú Quốc", count: 34, image: "/images/phuquoc.jpg" },
  { name: "Mù Cang Chải", count: 23, image: "/images/mucangchai.jpg" },
  { name: "Ninh Bình", count: 56, image: "/images/ninhbinh.jpg" }
]

const amenities = [
  { id: "wifi", label: "WiFi miễn phí", icon: "📶" },
  { id: "parking", label: "Chỗ đậu xe", icon: "🚗" },
  { id: "pool", label: "Hồ bơi", icon: "🏊" },
  { id: "breakfast", label: "Bữa sáng", icon: "🍳" },
  { id: "ac", label: "Điều hòa", icon: "❄️" },
  { id: "kitchen", label: "Bếp", icon: "👨‍🍳" },
  { id: "pet", label: "Thú cưng", icon: "🐕" },
  { id: "gym", label: "Phòng gym", icon: "💪" }
]

export function SearchSection() {
  const [searchData, setSearchData] = useState({
    destination: "",
    checkIn: null as Date | null,
    checkOut: null as Date | null,
    guests: 2,
    priceRange: [0, 5000000],
    selectedAmenities: [] as string[]
  })
  
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSearch = () => {
    if (!searchData.destination) {
      toast.error("Vui lòng chọn điểm đến")
      return
    }
    
    toast.success("Đang tìm kiếm...")
    // Implement search logic
  }

  const handleDestinationSelect = (destination: string) => {
    setSearchData(prev => ({ ...prev, destination }))
    toast.success(`Đã chọn: ${destination}`)
  }

  const handleAmenityToggle = (amenityId: string) => {
    setSearchData(prev => ({
      ...prev,
      selectedAmenities: prev.selectedAmenities.includes(amenityId)
        ? prev.selectedAmenities.filter(id => id !== amenityId)
        : [...prev.selectedAmenities, amenityId]
    }))
  }

  return (
    <section className="py-12 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        {/* Main Search Card */}
        <Card className="p-6 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
            {/* Destination */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium mb-2 text-foreground">
                <MapPin className="inline h-4 w-4 mr-1" />
                Điểm đến
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Input
                    placeholder="Bạn muốn đi đâu?"
                    value={searchData.destination}
                    onChange={(e) => setSearchData(prev => ({ ...prev, destination: e.target.value }))}
                    className="h-12 cursor-pointer"
                  />
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="start">
                  <div className="p-4">
                    <h4 className="font-semibold mb-3">Điểm đến phổ biến</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {popularDestinations.map((dest) => (
                        <Button
                          key={dest.name}
                          variant="ghost"
                          className="h-auto p-3 justify-start"
                          onClick={() => handleDestinationSelect(dest.name)}
                        >
                          <div className="text-left">
                            <div className="font-medium">{dest.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {dest.count} homestay
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Check-in Date */}
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                <Calendar className="inline h-4 w-4 mr-1" />
                Ngày nhận phòng
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full h-12 justify-start">
                    {searchData.checkIn ? 
                      searchData.checkIn.toLocaleDateString('vi-VN') : 
                      "Chọn ngày"
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={searchData.checkIn}
                    onSelect={(date) => setSearchData(prev => ({ ...prev, checkIn: date }))}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Guests */}
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                <Users className="inline h-4 w-4 mr-1" />
                Số khách
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full h-12 justify-start">
                    {searchData.guests} khách
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64" align="start">
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Số khách</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setSearchData(prev => ({ 
                            ...prev, 
                            guests: Math.max(1, prev.guests - 1) 
                          }))}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{searchData.guests}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setSearchData(prev => ({ 
                            ...prev, 
                            guests: Math.min(20, prev.guests + 1) 
                          }))}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-primary"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Bộ lọc nâng cao
            </Button>
            
            <Button onClick={handleSearch} size="lg" className="px-8">
              <Search className="h-4 w-4 mr-2" />
              Tìm kiếm
            </Button>
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="border-t pt-4 space-y-6">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Khoảng giá (VNĐ/đêm)
                </label>
                <Slider
                  value={searchData.priceRange}
                  onValueChange={(value) => setSearchData(prev => ({ ...prev, priceRange: value }))}
                  max={10000000}
                  step={100000}
                  className="mb-2"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{searchData.priceRange[0].toLocaleString('vi-VN')}đ</span>
                  <span>{searchData.priceRange[1].toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Tiện nghi
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {amenities.map((amenity) => (
                    <div key={amenity.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity.id}
                        checked={searchData.selectedAmenities.includes(amenity.id)}
                        onCheckedChange={() => handleAmenityToggle(amenity.id)}
                      />
                      <label
                        htmlFor={amenity.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        <span className="mr-1">{amenity.icon}</span>
                        {amenity.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Quick Search Suggestions */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 text-center">Điểm đến phổ biến</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularDestinations.map((dest) => (
              <Card
                key={dest.name}
                className="cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden group"
                onClick={() => handleDestinationSelect(dest.name)}
              >
                <div className="aspect-square relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                  <div className="absolute bottom-2 left-2 z-20 text-white">
                    <h4 className="font-semibold text-sm">{dest.name}</h4>
                    <p className="text-xs opacity-90">{dest.count} homestay</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
