"use client"

import { useState, useEffect, useCallback } from "react"
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api"
import { ModernCard, ModernCardContent } from "@/components/ui/modern-card"
import { ModernButton } from "@/components/ui/modern-button"
import { Star, MapPin, Users, ArrowRight, Loader2 } from "lucide-react"
import { PropertyService } from "@/lib/property-service"
import { Property } from "@/types/property"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

const mapContainerStyle = {
  width: "100%",
  height: "500px",
}

const defaultCenter = {
  lat: 16.0544, // Vietnam center
  lng: 108.2022,
}

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "transit",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
  ],
}

interface MapProperty extends Property {
  lat: number
  lng: number
}

export function ModernMap() {
  const [properties, setProperties] = useState<MapProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProperty, setSelectedProperty] = useState<MapProperty | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [hasApiKey, setHasApiKey] = useState(false)

  // Check if Google Maps API key is available
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    setHasApiKey(!!apiKey && apiKey.length > 0)
  }, [])

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await PropertyService.getFeaturedProperties()
        
        // Add mock coordinates for demo (in real app, these would be stored in database)
        const propertiesWithCoords: MapProperty[] = data.map((property) => ({
          ...property,
          lat: 16.0544 + (Math.random() - 0.5) * 8, // Spread across Vietnam
          lng: 108.2022 + (Math.random() - 0.5) * 8,
        }))
        
        setProperties(propertiesWithCoords)
      } catch (error) {
        console.error("Error fetching properties for map:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  const onMapLoad = useCallback((_map: google.maps.Map) => {
    setMapLoaded(true)
  }, [])

  // Custom marker icon - only create when google is available
  const createMarkerIcon = useCallback(() => {
    if (typeof window === 'undefined' || !window.google) {
      return undefined
    }

    return {
      url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="#1e40af" stroke="white" stroke-width="4"/>
          <circle cx="20" cy="20" r="8" fill="white"/>
        </svg>
      `),
      scaledSize: new window.google.maps.Size(40, 40),
      anchor: new window.google.maps.Point(20, 20),
    }
  }, [mapLoaded])

  const handleMarkerClick = (property: MapProperty) => {
    setSelectedProperty(property)
  }

  const handleInfoWindowClose = () => {
    setSelectedProperty(null)
  }

  if (loading) {
    return (
      <ModernCard variant="elevated" className="h-[500px] flex items-center justify-center">
        <div className="flex items-center space-x-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Đang tải bản đồ...</span>
        </div>
      </ModernCard>
    )
  }

  // Fallback UI if no Google Maps API key
  if (!hasApiKey) {
    return (
      <div className="space-y-6">
        {/* Map Header */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Khám phá trên{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              bản đồ
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tìm hiểu vị trí các homestay và lựa chọn địa điểm phù hợp nhất cho chuyến đi của bạn
          </p>
        </div>

        {/* Fallback Content */}
        <ModernCard variant="elevated" className="h-[500px] flex items-center justify-center">
          <div className="text-center space-y-4">
            <MapPin className="h-16 w-16 text-muted-foreground mx-auto" />
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">Bản đồ tương tác</h3>
              <p className="text-muted-foreground max-w-md">
                Bản đồ sẽ hiển thị vị trí các homestay khi Google Maps API được cấu hình.
              </p>
            </div>

            {/* Property List as Fallback */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
              {properties.slice(0, 6).map((property) => (
                <div key={property.id} className="text-left p-4 border border-border rounded-lg">
                  <h4 className="font-semibold text-sm">{property.name}</h4>
                  <p className="text-xs text-muted-foreground">{property.address}</p>
                  <p className="text-xs text-primary font-medium mt-1">
                    {property.pricePerNight.toLocaleString('vi-VN')}₫/đêm
                  </p>
                </div>
              ))}
            </div>
          </div>
        </ModernCard>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Map Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Khám phá trên{" "}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            bản đồ
          </span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Tìm hiểu vị trí các homestay và lựa chọn địa điểm phù hợp nhất cho chuyến đi của bạn
        </p>
      </div>

      {/* Map Container */}
      <ModernCard variant="elevated" className="overflow-hidden">
        <LoadScript
          googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
          loadingElement={
            <div className="h-[500px] flex items-center justify-center">
              <div className="flex items-center space-x-3 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Đang tải Google Maps...</span>
              </div>
            </div>
          }
        >
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={defaultCenter}
            zoom={6}
            options={mapOptions}
            onLoad={onMapLoad}
          >
            {/* Property Markers */}
            {properties.map((property) => (
              <Marker
                key={property.id}
                position={{ lat: property.lat, lng: property.lng }}
                onClick={() => handleMarkerClick(property)}
                icon={createMarkerIcon()}
              />
            ))}

            {/* Info Window */}
            {selectedProperty && (
              <InfoWindow
                position={{ lat: selectedProperty.lat, lng: selectedProperty.lng }}
                onCloseClick={handleInfoWindowClose}
                options={{
                  pixelOffset: new google.maps.Size(0, -10),
                }}
              >
                <div className="w-80 p-0">
                  <PropertyInfoCard property={selectedProperty} />
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </ModernCard>

      {/* Map Legend */}
      <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-primary"></div>
          <span>Homestay có sẵn</span>
        </div>
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4" />
          <span>Nhấp vào marker để xem chi tiết</span>
        </div>
      </div>
    </div>
  )
}

function PropertyInfoCard({ property }: { property: MapProperty }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg">
      {/* Property Image */}
      <div className="relative h-32 w-full">
        <Image
          src={property.images[0] || "/placeholder.jpg"}
          alt={property.name}
          fill
          className="object-cover"
        />
        {property.featured && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            Nổi bật
          </div>
        )}
      </div>

      {/* Property Info */}
      <div className="p-4 space-y-3">
        {/* Title & Location */}
        <div>
          <h3 className="font-semibold text-lg text-foreground line-clamp-1">
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

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <div>
            <span className="text-lg font-bold text-foreground">
              {property.pricePerNight.toLocaleString('vi-VN')}₫
            </span>
            <span className="text-muted-foreground text-sm ml-1">/đêm</span>
          </div>
          <Link href={`/homestay/${property.id}`}>
            <ModernButton variant="default" size="sm">
              Xem chi tiết
              <ArrowRight className="h-4 w-4 ml-1" />
            </ModernButton>
          </Link>
        </div>
      </div>
    </div>
  )
}
