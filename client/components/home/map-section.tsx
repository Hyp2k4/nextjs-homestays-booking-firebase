"use client"

import { useState } from "react"
import { MapPin, Filter, Grid, List, Star, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GoogleMapWrapper } from "@/components/google-map"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { toast } from "sonner"

const mapProperties = [
  {
    id: 1,
    name: "Villa Sapa View",
    location: "Sapa, Lào Cai",
    price: 1200000,
    rating: 4.8,
    reviews: 124,
    image: "/images/property-1.jpg",
    coordinates: { lat: 22.3364, lng: 103.8438 },
    type: "villa",
    amenities: ["wifi", "parking", "breakfast"]
  },
  {
    id: 2,
    name: "Homestay Hội An",
    location: "Hội An, Quảng Nam",
    price: 800000,
    rating: 4.9,
    reviews: 89,
    image: "/images/property-2.jpg",
    coordinates: { lat: 15.8801, lng: 108.3380 },
    type: "homestay",
    amenities: ["wifi", "ac", "breakfast"]
  },
  {
    id: 3,
    name: "Đà Lạt House",
    location: "Đà Lạt, Lâm Đồng",
    price: 950000,
    rating: 4.7,
    reviews: 156,
    image: "/images/property-3.jpg",
    coordinates: { lat: 11.9404, lng: 108.4583 },
    type: "house",
    amenities: ["wifi", "fireplace", "garden"]
  }
]

const regions = [
  { name: "Miền Bắc", count: 245, active: true },
  { name: "Miền Trung", count: 189, active: false },
  { name: "Miền Nam", count: 312, active: false }
]

export function MapSection() {
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<"map" | "list">("map")
  const [activeRegion, setActiveRegion] = useState("Miền Bắc")

  const handlePropertySelect = (propertyId: number) => {
    setSelectedProperty(propertyId)
    const property = mapProperties.find(p => p.id === propertyId)
    if (property) {
      toast.info(`Đã chọn: ${property.name}`)
    }
  }

  const handleRegionChange = (region: string) => {
    setActiveRegion(region)
    toast.success(`Đang hiển thị: ${region}`)
  }

  const handleWishlist = (propertyId: number) => {
    const property = mapProperties.find(p => p.id === propertyId)
    toast.success(`Đã thêm ${property?.name} vào danh sách yêu thích`)
  }

  return (
    <section className="py-16 bg-muted/20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">
            Khám Phá Trên Bản Đồ
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tìm kiếm homestay theo vị trí địa lý và khám phá những điểm đến thú vị
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Region Filters */}
          <div className="flex gap-2">
            {regions.map((region) => (
              <Button
                key={region.name}
                variant={activeRegion === region.name ? "default" : "outline"}
                onClick={() => handleRegionChange(region.name)}
                className="flex items-center gap-2"
              >
                <MapPin className="h-4 w-4" />
                {region.name}
                <Badge variant="secondary" className="ml-1">
                  {region.count}
                </Badge>
              </Button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 ml-auto">
            <Button
              variant={viewMode === "map" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("map")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
          {/* Properties List */}
          <div className="lg:col-span-1 space-y-4 overflow-y-auto">
            <h3 className="font-semibold text-lg mb-4">
              Homestay trong khu vực ({mapProperties.length})
            </h3>
            
            {mapProperties.map((property) => (
              <Card
                key={property.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  selectedProperty === property.id 
                    ? "ring-2 ring-primary shadow-lg" 
                    : ""
                }`}
                onClick={() => handlePropertySelect(property.id)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <OptimizedImage
                        src={property.image}
                        alt={property.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-sm line-clamp-1">
                          {property.name}
                        </h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleWishlist(property.id)
                          }}
                        >
                          <Heart className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-1 mb-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {property.location}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-medium">{property.rating}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          ({property.reviews})
                        </span>
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          {property.type}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm">
                          {property.price.toLocaleString('vi-VN')}đ
                        </span>
                        <span className="text-xs text-muted-foreground">/đêm</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="h-full overflow-hidden">
              {viewMode === "map" ? (
                <GoogleMapWrapper />
              ) : (
                <div className="p-6 h-full">
                  <h3 className="font-semibold text-lg mb-4">Danh sách homestay</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mapProperties.map((property) => (
                      <Card key={property.id} className="overflow-hidden">
                        <div className="aspect-video relative">
                          <OptimizedImage
                            src={property.image}
                            alt={property.name}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute top-2 right-2">
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-8 w-8 bg-white/90"
                              onClick={() => handleWishlist(property.id)}
                            >
                              <Heart className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-1 line-clamp-1">
                            {property.name}
                          </h4>
                          <div className="flex items-center gap-1 mb-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {property.location}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{property.rating}</span>
                              <span className="text-sm text-muted-foreground">
                                ({property.reviews})
                              </span>
                            </div>
                            <span className="font-bold">
                              {property.price.toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="text-center p-6">
            <div className="text-2xl font-bold text-primary mb-2">746</div>
            <div className="text-sm text-muted-foreground">Tổng homestay</div>
          </Card>
          <Card className="text-center p-6">
            <div className="text-2xl font-bold text-primary mb-2">63</div>
            <div className="text-sm text-muted-foreground">Tỉnh thành</div>
          </Card>
          <Card className="text-center p-6">
            <div className="text-2xl font-bold text-primary mb-2">4.8</div>
            <div className="text-sm text-muted-foreground">Đánh giá TB</div>
          </Card>
          <Card className="text-center p-6">
            <div className="text-2xl font-bold text-primary mb-2">12K+</div>
            <div className="text-sm text-muted-foreground">Khách hàng</div>
          </Card>
        </div>
      </div>
    </section>
  )
}
