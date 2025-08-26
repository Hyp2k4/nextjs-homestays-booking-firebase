"use client"

import { useState, useEffect } from "react"
import { ModernCard, ModernCardContent } from "@/components/ui/modern-card"
import { ModernButton } from "@/components/ui/modern-button"
import { Star, MapPin, Users, Heart, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { PropertyService } from "@/lib/property-service"
import { Property } from "@/types/property"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

export function ModernFeaturedProperties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const { user } = useAuth()

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await PropertyService.getFeaturedProperties()
        setProperties(data)
      } catch (error) {
        console.error("Error fetching featured properties:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.max(1, properties.length - 2))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.max(1, properties.length - 2)) % Math.max(1, properties.length - 2))
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-xl h-64 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Homestay{" "}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Nổi Bật
          </span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Khám phá những homestay được đánh giá cao nhất với dịch vụ tuyệt vời và vị trí đắc địa
        </p>
      </div>

      {/* Desktop Grid View */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-6">
        {properties.slice(0, 6).map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {/* Mobile/Tablet Carousel */}
      <div className="lg:hidden relative">
        <div className="overflow-hidden">
          <div 
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {properties.map((property) => (
              <div key={property.id} className="w-full flex-shrink-0 px-2">
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Controls */}
        {properties.length > 1 && (
          <>
            <ModernButton
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
              onClick={prevSlide}
            >
              <ChevronLeft className="h-5 w-5" />
            </ModernButton>
            <ModernButton
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
              onClick={nextSlide}
            >
              <ChevronRight className="h-5 w-5" />
            </ModernButton>
          </>
        )}

        {/* Carousel Indicators */}
        <div className="flex justify-center space-x-2 mt-6">
          {[...Array(Math.max(1, properties.length - 2))].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                index === currentSlide ? "bg-primary w-6" : "bg-gray-300"
              )}
            />
          ))}
        </div>
      </div>

      {/* View All Button */}
      <div className="text-center">
        <Link href="/homestays">
          <ModernButton variant="outline" size="lg">
            Xem tất cả homestay
            <ArrowRight className="h-4 w-4 ml-2" />
          </ModernButton>
        </Link>
      </div>
    </div>
  )
}

function PropertyCard({ property }: { property: Property }) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const { user } = useAuth()

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // TODO: Implement wishlist functionality
    setIsWishlisted(!isWishlisted)
  }

  return (
    <Link href={`/homestay/${property.id}`}>
      <ModernCard variant="elevated" className="group cursor-pointer overflow-hidden">
        <div className="relative">
          <div className="aspect-[4/3] relative overflow-hidden">
            <Image
              src={property.images[0] || "/placeholder.jpg"}
              alt={property.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Wishlist Button */}
          <ModernButton
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 bg-white/90 hover:bg-white shadow-sm"
            onClick={handleWishlistToggle}
          >
            <Heart 
              className={cn(
                "h-4 w-4 transition-colors",
                isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
              )} 
            />
          </ModernButton>

          {/* Featured Badge */}
          {property.featured && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
              Nổi bật
            </div>
          )}
        </div>

        <ModernCardContent className="p-4 space-y-3">
          {/* Title & Location */}
          <div>
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {property.name}
            </h3>
            <div className="flex items-center text-muted-foreground text-sm mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="line-clamp-1">{property.address}</span>
            </div>
          </div>

          {/* Rating & Capacity */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-sm">
                {property.rating.average.toFixed(1)}
              </span>
              <span className="text-muted-foreground text-sm">
                ({property.rating.count})
              </span>
            </div>
            <div className="flex items-center text-muted-foreground text-sm">
              <Users className="h-4 w-4 mr-1" />
              <span>{property.maxGuests} khách</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div>
              <span className="text-xl font-bold text-foreground">
                {property.pricePerNight.toLocaleString('vi-VN')}₫
              </span>
              <span className="text-muted-foreground text-sm ml-1">/đêm</span>
            </div>
            <ModernButton variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
              Xem chi tiết
              <ArrowRight className="h-4 w-4 ml-1" />
            </ModernButton>
          </div>
        </ModernCardContent>
      </ModernCard>
    </Link>
  )
}
