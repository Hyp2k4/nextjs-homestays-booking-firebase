"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BookingFlow } from "@/components/booking/booking-flow"
import { PropertyService } from "@/lib/property-service"
import type { Property, Room } from "@/types/property"
import {
  Star,
  MapPin,
  Users,
  Bed,
  Bath,
  Wifi,
  Car,
  FishIcon as Swimming,
  Dumbbell,
  Eye,
  Calendar,
  ArrowLeft,
  Share,
  Heart,
} from "lucide-react"
import { ReviewForm } from "@/components/review-form"
import { ReviewService } from "@/lib/review-service"
import type { Review } from "@/types/review"
import { ReviewsList } from "@/components/reviews-list"
import { formatPrice, formatPhoneNumber } from "@/lib/utils"
import { SuggestedProperties } from "@/components/suggested-properties"

export default function HomestayDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [property, setProperty] = useState<Property | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    const fetchPropertyAndRooms = async () => {
      if (params?.id) {
        const propertyData = await PropertyService.getPropertyById(params.id as string)
        setProperty(propertyData)
        if (propertyData) {
          fetchReviews(propertyData.id)
          const roomsData = await PropertyService.getRoomsByHomestayId(propertyData.id)
          setRooms(roomsData)
        }
      }
    }

    fetchPropertyAndRooms()
  }, [params?.id])

  const fetchReviews = async (propertyId: string) => {
    const fetchedReviews = await ReviewService.getReviewsForProperty(propertyId)
    setReviews(fetchedReviews)
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="font-serif font-bold text-2xl mb-4">Không tìm thấy homestay</h1>
            <Button onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const getAmenityIcon = (amenity: string) => {
    const icons: { [key: string]: React.ElementType } = {
      WiFi: Wifi,
      "Bãi đỗ xe": Car,
      "Hồ bơi": Swimming,
      Gym: Dumbbell,
      "View biển": Eye,
      "View núi": Eye,
    }
    const Icon = icons[amenity]
    return Icon ? <Icon className="h-4 w-4" /> : null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-4" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-serif font-bold text-3xl text-foreground mb-2">{property.name}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>Địa chỉ: {property.address}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Chia sẻ
            </Button>
            <Button variant="outline" size="sm">
              <Heart className="h-4 w-4 mr-2" />
              Yêu thích
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
              <Image
                src={property.images[currentImageIndex] || "/placeholder.svg"}
                alt={`Image of ${property.name}`}
                fill
                className="object-cover"
              />
              <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-md text-sm">
                {currentImageIndex + 1} / {property.images.length}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {property.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative aspect-square rounded-md overflow-hidden ${index === currentImageIndex ? "ring-2 ring-primary" : ""
                    }`}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${property.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif font-semibold text-xl mb-2">Homestay của {property.hostName}</h2>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {property.maxGuests} khách tối đa
                  </span>
                  <span className="flex items-center gap-1">
                    <Bed className="h-4 w-4" />
                    {property.bedrooms} Phòng ngủ
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath className="h-4 w-4" />
                    {property.bathrooms} Phòng tắm
                  </span>
                </div>
              </div>
              <Avatar className="h-12 w-12">
                <AvatarImage src={property.hostAvatar || "/placeholder.svg"} alt={property.hostName} />
                <AvatarFallback>{property.hostName?.[0]}</AvatarFallback>
              </Avatar>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="font-semibold text-lg mb-3">Mô tả</h3>
              <p className="text-muted-foreground leading-relaxed">{property.description}</p>
            </div>

            {property.hostName && (
              <div className="border-t border-border pt-6">
                <h3 className="font-semibold text-lg mb-3">Thông tin chủ nhà</h3>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={property.hostAvatar || "/placeholder.svg"} alt={property.hostName || ""} />
                    <AvatarFallback>{property.hostName?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{property.hostName}</p>
                    <p className="text-sm text-muted-foreground">{property.hostEmail}</p>
                    <p className="text-sm text-muted-foreground">{property.hostPhone ? formatPhoneNumber(property.hostPhone) : "N/A"}</p>
                  </div>
                </div>
              </div>
            )}

            {property.rules && property.rules.length > 0 && (
              <div className="border-t border-border pt-6">
                <h3 className="font-semibold text-lg mb-3">Nội quy Homestay</h3>
                <ul className="list-none space-y-2">
                  {property.rules.map((rule, index) => (
                    <li key={index} className="text-muted-foreground">
                      +) {rule}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="border-t border-border pt-6">
              <h3 className="font-semibold text-lg mb-3">Các phòng có sẵn</h3>
              <div className="space-y-4">
                {rooms.map((room) => (
                  <Card key={room.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="relative w-32 h-32 aspect-square">
                        <Image src={room.images[0]} alt={room.roomName} fill className="object-cover rounded-md" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">{room.roomName}</h4>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{room.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-primary">
                            {formatPrice(room.pricePerNight)} / đêm
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {room.capacity} khách
                          </span>
                        </div>
                      </div>
                      <Button onClick={() => router.push(`/room/${room.id}`)}>
                        Xem ngay
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <SuggestedProperties type="homestay" />
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="font-semibold text-lg mb-3">Đánh giá</h3>
              <ReviewsList reviews={reviews} loading={!property} />
            </div>

            <div className="border-t border-border pt-6">
              <ReviewForm propertyId={property.id} onReviewSubmit={() => fetchReviews(property.id)} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
