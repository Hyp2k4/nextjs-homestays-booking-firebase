"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { SearchSection } from "@/components/search-section"
import { PropertyCard } from "@/components/property-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { mockProperties, propertyAmenities } from "@/data/mock-properties"
import type { Property, SearchFilters } from "@/types/property"
import { Filter, Grid, List } from "lucide-react"

function SearchPageContent() {
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState<Property[]>(mockProperties)
  const [filters, setFilters] = useState<SearchFilters>({})
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"price" | "rating" | "newest">("rating")

  // Initialize filters from URL params
  useEffect(() => {
    const initialFilters: SearchFilters = {
      location: searchParams.get("location") || undefined,
      checkIn: searchParams.get("checkIn") || undefined,
      checkOut: searchParams.get("checkOut") || undefined,
      guests: searchParams.get("guests") ? Number.parseInt(searchParams.get("guests")!) : undefined,
      priceRange: { min: 0, max: 3000000 },
      propertyTypes: [],
      amenities: [],
      rating: 0,
    }
    setFilters(initialFilters)
  }, [searchParams])

  // Filter and sort properties
  useEffect(() => {
    let filtered = [...mockProperties]

    // Apply filters
    if (filters.location) {
      filtered = filtered.filter(
        (p) =>
          p.location.city.toLowerCase().includes(filters.location!.toLowerCase()) ||
          p.location.district.toLowerCase().includes(filters.location!.toLowerCase()),
      )
    }

    if (filters.guests) {
      filtered = filtered.filter((p) => p.capacity.guests >= filters.guests!)
    }

    if (filters.priceRange) {
      filtered = filtered.filter(
        (p) => p.price.perNight >= filters.priceRange!.min && p.price.perNight <= filters.priceRange!.max,
      )
    }

    if (filters.propertyTypes && filters.propertyTypes.length > 0) {
      filtered = filtered.filter((p) => filters.propertyTypes!.includes(p.propertyType))
    }

    if (filters.amenities && filters.amenities.length > 0) {
      filtered = filtered.filter((p) => filters.amenities!.some((amenity) => p.amenities.includes(amenity)))
    }

    if (filters.rating && filters.rating > 0) {
      filtered = filtered.filter((p) => p.rating.average >= filters.rating!)
    }

    // Apply sorting
    switch (sortBy) {
      case "price":
        filtered.sort((a, b) => a.price.perNight - b.price.perNight)
        break
      case "rating":
        filtered.sort((a, b) => b.rating.average - a.rating.average)
        break
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
    }

    setProperties(filtered)
  }, [filters, sortBy])

  const handleSearch = (newFilters: SearchFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <SearchSection onSearch={handleSearch} initialFilters={filters} />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-80 ${showFilters ? "block" : "hidden lg:block"}`}>
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-semibold text-lg">Bộ lọc</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setFilters({ priceRange: { min: 0, max: 3000000 }, propertyTypes: [], amenities: [], rating: 0 })
                    }
                  >
                    Xóa tất cả
                  </Button>
                </div>

                {/* Price Range */}
                <div className="space-y-3">
                  <h4 className="font-medium">Khoảng giá (VND/đêm)</h4>
                  <Slider
                    value={[filters.priceRange?.min || 0, filters.priceRange?.max || 3000000]}
                    onValueChange={([min, max]) => setFilters((prev) => ({ ...prev, priceRange: { min, max } }))}
                    max={3000000}
                    min={0}
                    step={100000}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{formatPrice(filters.priceRange?.min || 0)}</span>
                    <span>{formatPrice(filters.priceRange?.max || 3000000)}</span>
                  </div>
                </div>

                {/* Property Types */}
                <div className="space-y-3">
                  <h4 className="font-medium">Loại hình</h4>
                  <div className="space-y-2">
                    {["house", "apartment", "villa", "cabin"].map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={type}
                          checked={filters.propertyTypes?.includes(type) || false}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFilters((prev) => ({
                                ...prev,
                                propertyTypes: [...(prev.propertyTypes || []), type],
                              }))
                            } else {
                              setFilters((prev) => ({
                                ...prev,
                                propertyTypes: prev.propertyTypes?.filter((t) => t !== type) || [],
                              }))
                            }
                          }}
                        />
                        <label htmlFor={type} className="text-sm">
                          {type === "house"
                            ? "Nhà"
                            : type === "apartment"
                              ? "Căn hộ"
                              : type === "villa"
                                ? "Villa"
                                : "Cabin"}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div className="space-y-3">
                  <h4 className="font-medium">Đánh giá tối thiểu</h4>
                  <div className="space-y-2">
                    {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                      <div key={rating} className="flex items-center space-x-2">
                        <Checkbox
                          id={`rating-${rating}`}
                          checked={filters.rating === rating}
                          onCheckedChange={(checked) => {
                            setFilters((prev) => ({ ...prev, rating: checked ? rating : 0 }))
                          }}
                        />
                        <label htmlFor={`rating-${rating}`} className="text-sm">
                          {rating}+ sao
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div className="space-y-3">
                  <h4 className="font-medium">Tiện nghi</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {propertyAmenities.slice(0, 8).map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenity}
                          checked={filters.amenities?.includes(amenity) || false}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFilters((prev) => ({
                                ...prev,
                                amenities: [...(prev.amenities || []), amenity],
                              }))
                            } else {
                              setFilters((prev) => ({
                                ...prev,
                                amenities: prev.amenities?.filter((a) => a !== amenity) || [],
                              }))
                            }
                          }}
                        />
                        <label htmlFor={amenity} className="text-sm">
                          {amenity}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="font-serif font-semibold text-xl">{properties.length} homestay được tìm thấy</h2>
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden bg-transparent"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Bộ lọc
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "price" | "rating" | "newest")}
                  className="px-3 py-2 border border-border rounded-md bg-background text-sm"
                >
                  <option value="rating">Đánh giá cao nhất</option>
                  <option value="price">Giá thấp nhất</option>
                  <option value="newest">Mới nhất</option>
                </select>

                <div className="flex border border-border rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {(filters.location || filters.propertyTypes?.length || filters.amenities?.length || filters.rating) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {filters.location && (
                  <Badge variant="secondary" className="gap-1">
                    {filters.location}
                    <button onClick={() => setFilters((prev) => ({ ...prev, location: undefined }))}>×</button>
                  </Badge>
                )}
                {filters.propertyTypes?.map((type) => (
                  <Badge key={type} variant="secondary" className="gap-1">
                    {type}
                    <button
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          propertyTypes: prev.propertyTypes?.filter((t) => t !== type),
                        }))
                      }
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                {filters.amenities?.slice(0, 3).map((amenity) => (
                  <Badge key={amenity} variant="secondary" className="gap-1">
                    {amenity}
                    <button
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          amenities: prev.amenities?.filter((a) => a !== amenity),
                        }))
                      }
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                {filters.rating && filters.rating > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    {filters.rating}+ sao
                    <button onClick={() => setFilters((prev) => ({ ...prev, rating: 0 }))}>×</button>
                  </Badge>
                )}
              </div>
            )}

            {/* Properties Grid */}
            {properties.length > 0 ? (
              <div
                className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-6"}
              >
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="font-serif font-semibold text-xl mb-2">Không tìm thấy homestay nào</h3>
                <p className="text-muted-foreground mb-4">Thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
                <Button
                  onClick={() =>
                    setFilters({ priceRange: { min: 0, max: 3000000 }, propertyTypes: [], amenities: [], rating: 0 })
                  }
                >
                  Xóa tất cả bộ lọc
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  )
}
