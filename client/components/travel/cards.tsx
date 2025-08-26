"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Heart,
  Star,
  MapPin,
  Users,
  Wifi,
  Car,
  Coffee,
  ArrowRight,
  Calendar,
  Clock,
  Quote
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Property, Room } from "@/types/property"
import { useAuth } from "@/contexts/auth-context"
import { useRoomWishlistStatus } from "@/hooks/use-wishlist"

// Property Card Component
interface PropertyCardProps {
  property: Property
  className?: string
  size?: "sm" | "md" | "lg"
}

export function PropertyCard({ property, className, size = "md" }: PropertyCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const { user } = useAuth()

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsWishlisted(!isWishlisted)
  }

  const sizes = {
    sm: "aspect-[4/3]",
    md: "aspect-[4/3]",
    lg: "aspect-[16/10]"
  }

  return (
    <Link href={`/homestay/${property.id}`}>
      <div className={cn(
        "group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2",
        className
      )}>
        {/* Image Container */}
        <div className={cn("relative overflow-hidden", sizes[size])}>
          <Image
            src={property.images[0] || "/placeholder.jpg"}
            alt={property.name}
            fill
            className={cn(
              "object-cover transition-all duration-500 group-hover:scale-110",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Loading Skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 animate-pulse" />
          )}

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-4 right-4 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110"
          >
            <Heart 
              className={cn(
                "h-5 w-5 transition-colors",
                isWishlisted ? "fill-red-500 text-red-500" : "text-neutral-600"
              )} 
            />
          </button>

          {/* Featured Badge */}
          {property.featured && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-secondary-500 to-secondary-400 text-white px-3 py-1.5 rounded-full text-xs font-semibold">
              Featured
            </div>
          )}

          {/* Price Badge */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2">
            <div className="text-lg font-bold text-neutral-900">
              {property.pricePerNight.toLocaleString('vi-VN')}₫
            </div>
            <div className="text-xs text-neutral-600">per night</div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Location */}
          <div className="flex items-center text-neutral-500 text-sm mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="truncate">{property.address}</span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-lg text-neutral-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {property.name}
          </h3>

          {/* Rating & Capacity */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-sm text-neutral-900">
                {property.rating.average.toFixed(1)}
              </span>
              <span className="text-neutral-500 text-sm">
                ({property.rating.count})
              </span>
            </div>
            <div className="flex items-center text-neutral-500 text-sm">
              <Users className="h-4 w-4 mr-1" />
              <span>{property.maxGuests} guests</span>
            </div>
          </div>

          {/* Amenities */}
          <div className="flex items-center space-x-4 text-neutral-400">
            {property.amenities.wifi && <Wifi className="h-4 w-4" />}
            {property.amenities.parking && <Car className="h-4 w-4" />}
            {property.amenities.breakfast && <Coffee className="h-4 w-4" />}
          </div>
        </div>
      </div>
    </Link>
  )
}

// Room Card Component
interface RoomCardProps {
  room: Room & { homestayName?: string }
  className?: string
}

export function RoomCard({ room, className }: RoomCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const { isInWishlist, loading, toggle } = useRoomWishlistStatus(room.id)

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await toggle()
  }

  return (
    <Link href={`/room/${room.id}`}>
      <div className={cn(
        "group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2",
        className
      )}>
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={room.images[0] || "/placeholder.jpg"}
            alt={room.roomName}
            fill
            className={cn(
              "object-cover transition-all duration-500 group-hover:scale-110",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setImageLoaded(true)}
          />
          
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 animate-pulse" />
          )}

          {/* Wishlist Button - Only for rooms */}
          <button
            onClick={handleWishlistToggle}
            disabled={loading}
            className="absolute top-4 right-4 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 disabled:opacity-50"
          >
            <Heart
              className={cn(
                "h-5 w-5 transition-colors",
                isInWishlist ? "fill-red-500 text-red-500" : "text-neutral-600"
              )}
            />
          </button>

          {/* Price Badge */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2">
            <div className="text-lg font-bold text-neutral-900">
              {room.pricePerNight.toLocaleString('vi-VN')}₫
            </div>
            <div className="text-xs text-neutral-600">per night</div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Homestay Name */}
          {room.homestayName && (
            <div className="text-sm text-neutral-500 mb-2">
              {room.homestayName}
            </div>
          )}

          {/* Room Name */}
          <h3 className="font-semibold text-lg text-neutral-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {room.roomName}
          </h3>

          {/* Room Type & Capacity */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-neutral-600">
              {room.roomType}
            </div>
            <div className="flex items-center text-neutral-500 text-sm">
              <Users className="h-4 w-4 mr-1" />
              <span>{room.capacity} guests</span>
            </div>
          </div>

          {/* Amenities */}
          <div className="flex items-center space-x-4 text-neutral-400">
            {room.amenities.wifi && <Wifi className="h-4 w-4" />}
            {room.amenities.aircon && <div className="w-4 h-4 text-xs">❄️</div>}
            {room.amenities.tv && <div className="w-4 h-4 text-xs">📺</div>}
          </div>
        </div>
      </div>
    </Link>
  )
}

// Review Card Component
interface ReviewCardProps {
  review: {
    id: string
    userName: string
    userAvatar?: string
    rating: number
    comment: string
    date: string
    propertyName?: string
  }
  className?: string
}

export function ReviewCard({ review, className }: ReviewCardProps) {
  return (
    <div className={cn(
      "bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300",
      className
    )}>
      {/* Quote Icon */}
      <Quote className="h-8 w-8 text-primary-200 mb-4" />

      {/* Review Text */}
      <p className="text-neutral-700 mb-6 line-clamp-4 leading-relaxed">
        "{review.comment}"
      </p>

      {/* Rating */}
      <div className="flex items-center space-x-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-4 w-4",
              i < review.rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-neutral-300"
            )}
          />
        ))}
      </div>

      {/* User Info */}
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-200">
          {review.userAvatar ? (
            <Image
              src={review.userAvatar}
              alt={review.userName}
              width={48}
              height={48}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold">
              {review.userName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <div className="font-semibold text-neutral-900">{review.userName}</div>
          <div className="text-sm text-neutral-500">{review.date}</div>
        </div>
      </div>
    </div>
  )
}

// Feature Card Component
interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  className?: string
}

export function FeatureCard({ icon, title, description, className }: FeatureCardProps) {
  return (
    <div className={cn(
      "group bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-center",
      className
    )}>
      {/* Icon */}
      <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-neutral-900 mb-4 group-hover:text-primary-600 transition-colors">
        {title}
      </h3>

      {/* Description */}
      <p className="text-neutral-600 leading-relaxed">
        {description}
      </p>
    </div>
  )
}
