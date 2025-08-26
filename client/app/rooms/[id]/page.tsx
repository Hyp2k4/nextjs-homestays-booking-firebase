"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { TravelHeader } from "@/components/travel/header"
import { TravelFooter } from "@/components/travel/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Star, 
  MapPin, 
  Users, 
  Wifi, 
  Car, 
  Coffee,
  Tv,
  Wind,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CreditCard,
  Shield,
  Award
} from "lucide-react"
import { PropertyService } from "@/lib/property-service"
import { useWishlist } from "@/hooks/use-wishlist"
import Image from "next/image"

interface RoomDetail {
  id: string
  roomName: string
  roomType: string
  description: string
  pricePerNight: number
  capacity: number
  images: string[]
  amenities: string[]
  homestayName: string
  homestayLocation: string
  rating: {
    average: number
    count: number
  }
  reviews: Array<{
    id: string
    userName: string
    rating: number
    comment: string
    date: string
  }>
}

export default function RoomDetailPage() {
  const params = useParams()
  const roomId = params.id as string
  const [room, setRoom] = useState<RoomDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState(1)
  
  const { isInWishlist, toggleWishlist } = useWishlist()

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true)
        // Mock data - replace with actual API call
        const mockRoom: RoomDetail = {
          id: roomId,
          roomName: "Deluxe Mountain View Room",
          roomType: "Deluxe",
          description: "Experience breathtaking mountain views from this beautifully appointed deluxe room. Features modern amenities, comfortable furnishings, and a private balcony overlooking the stunning Sapa landscape. Perfect for couples or solo travelers seeking tranquility and natural beauty.",
          pricePerNight: 1200000,
          capacity: 2,
          images: [
            "/sapa-mountain-villa.png",
            "/danang-beach-apartment.png",
            "/hoi-an-traditional-house.png",
            "/sapa-mountain-villa.png"
          ],
          amenities: ["WiFi", "Air Conditioning", "TV", "Coffee Maker", "Parking", "Balcony"],
          homestayName: "Mountain Villa Sapa",
          homestayLocation: "Sapa, Lào Cai",
          rating: {
            average: 4.8,
            count: 124
          },
          reviews: [
            {
              id: "1",
              userName: "John Doe",
              rating: 5,
              comment: "Amazing room with incredible views! The host was very welcoming and the facilities were excellent.",
              date: "2024-12-10"
            },
            {
              id: "2", 
              userName: "Jane Smith",
              rating: 4,
              comment: "Beautiful location and comfortable room. Would definitely stay again.",
              date: "2024-12-08"
            }
          ]
        }
        setRoom(mockRoom)
      } catch (error) {
        console.error("Error fetching room:", error)
      } finally {
        setLoading(false)
      }
    }

    if (roomId) {
      fetchRoom()
    }
  }, [roomId])

  const nextImage = () => {
    if (room) {
      setCurrentImageIndex((prev) => (prev + 1) % room.images.length)
    }
  }

  const prevImage = () => {
    if (room) {
      setCurrentImageIndex((prev) => (prev - 1 + room.images.length) % room.images.length)
    }
  }

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi':
        return <Wifi className="h-5 w-5" />
      case 'air conditioning':
        return <Wind className="h-5 w-5" />
      case 'tv':
        return <Tv className="h-5 w-5" />
      case 'coffee maker':
        return <Coffee className="h-5 w-5" />
      case 'parking':
        return <Car className="h-5 w-5" />
      default:
        return <Award className="h-5 w-5" />
    }
  }

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'
        }`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <TravelHeader />
        <div className="pt-20 pb-16">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="animate-pulse space-y-8">
              <div className="h-96 bg-neutral-200 rounded-2xl"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="h-8 bg-neutral-200 rounded w-3/4"></div>
                  <div className="h-32 bg-neutral-200 rounded"></div>
                </div>
                <div className="h-96 bg-neutral-200 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
        <TravelFooter />
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <TravelHeader />
        <div className="pt-20 pb-16">
          <div className="container mx-auto px-4 lg:px-6 text-center">
            <h1 className="text-2xl font-bold text-neutral-900 mb-4">Room not found</h1>
            <p className="text-neutral-600">The room you're looking for doesn't exist.</p>
          </div>
        </div>
        <TravelFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <TravelHeader />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 lg:px-6">
          {/* Image Gallery */}
          <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden mb-8">
            <Image
              src={room.images[currentImageIndex]}
              alt={room.roomName}
              fill
              className="object-cover"
            />
            
            {/* Navigation Arrows */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Image Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
              {room.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <button
                onClick={() => toggleWishlist(room.id)}
                className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 transition-colors ${
                  isInWishlist(room.id) 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white/80 text-neutral-700 hover:bg-white'
                }`}
              >
                <Heart className={`h-5 w-5 ${isInWishlist(room.id) ? 'fill-current' : ''}`} />
              </button>
              <button className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors border border-white/30">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Room Info */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-neutral-900 mb-2">{room.roomName}</h1>
                    <div className="flex items-center space-x-4 text-neutral-600">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{room.homestayLocation}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{room.capacity} guests</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {room.roomType}
                  </Badge>
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-2 mb-6">
                  <div className="flex items-center space-x-1">
                    {renderStars(Math.round(room.rating.average))}
                  </div>
                  <span className="font-medium">{room.rating.average}</span>
                  <span className="text-neutral-600">({room.rating.count} reviews)</span>
                </div>

                {/* Description */}
                <p className="text-neutral-700 leading-relaxed">{room.description}</p>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-4">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {room.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-neutral-200">
                      {getAmenityIcon(amenity)}
                      <span className="text-neutral-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews */}
              <div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-6">Reviews</h3>
                <div className="space-y-6">
                  {room.reviews.map((review) => (
                    <div key={review.id} className="bg-white p-6 rounded-2xl border border-neutral-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {review.userName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-neutral-900">{review.userName}</h4>
                            <p className="text-sm text-neutral-500">{new Date(review.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <p className="text-neutral-700 leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Booking Sidebar */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-neutral-200">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-neutral-900 mb-1">
                    {room.pricePerNight.toLocaleString('vi-VN')}₫
                  </div>
                  <div className="text-neutral-600">per night</div>
                </div>

                {/* Booking Form */}
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Check-in
                      </label>
                      <input
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Check-out
                      </label>
                      <input
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Guests
                    </label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {[...Array(room.capacity)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} guest{i > 0 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Booking Summary */}
                {checkIn && checkOut && (
                  <div className="border-t border-neutral-200 pt-4 mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Subtotal</span>
                      <span>{room.pricePerNight.toLocaleString('vi-VN')}₫</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Service fee</span>
                      <span>{(room.pricePerNight * 0.1).toLocaleString('vi-VN')}₫</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t border-neutral-200 pt-2">
                      <span>Total</span>
                      <span>{(room.pricePerNight * 1.1).toLocaleString('vi-VN')}₫</span>
                    </div>
                  </div>
                )}

                <Button className="w-full mb-4" size="lg">
                  <Calendar className="h-5 w-5 mr-2" />
                  Book Now
                </Button>

                {/* Trust Indicators */}
                <div className="space-y-3 text-sm text-neutral-600">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Secure payment</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Free cancellation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4" />
                    <span>Verified host</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <TravelFooter />
    </div>
  )
}
