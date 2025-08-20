"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BookingFlow } from "@/components/booking/booking-flow"
import { PropertyService } from "@/lib/property-service"
import type { Property } from "@/types/property"
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

export default function HomestayDetailPage() {
  const params = useParams()
  const [property, setProperty] = useState<Property | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState(2)
  const [showBookingFlow, setShowBookingFlow] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    const fetchProperty = async () => {
      if (params?.id) {
        const propertyData = await PropertyService.getPropertyById(params.id as string);
        setProperty(propertyData);
        if (propertyData) {
          fetchReviews(propertyData.id);
        }
      }
    };

    fetchProperty();
  }, [params?.id]);

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(price)
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

  const handleBookNow = () => {
    setShowBookingFlow(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" className="mb-4" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        {/* Property Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-serif font-bold text-3xl text-foreground mb-2">{property.name}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{property.rating?.average}</span>
                <span>({property.rating?.count} đánh giá)</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{property.address}</span>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                <Image
                  src={property.images[currentImageIndex] || "/placeholder.svg"}
                  alt={property.name}
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
                    className={`relative aspect-square rounded-md overflow-hidden ${
                      index === currentImageIndex ? "ring-2 ring-primary" : ""
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

            {/* Property Info */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif font-semibold text-xl mb-2">Homestay được quản lý bởi {property.hostName}</h2>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <p className="text-muted-foreground">Email: {property.hostEmail}</p>
                    <p className="text-muted-foreground">Phone: {property.hostPhone}</p>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {property.maxGuests} khách
                    </span>
                    <span className="flex items-center gap-1">
                      <Bed className="h-4 w-4" />
                      {property.bedrooms} phòng ngủ
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="h-4 w-4" />
                      {property.bathrooms} phòng tắm
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

              <div className="border-t border-border pt-6">
                <h3 className="font-semibold text-lg mb-4">Tiện nghi</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(property.amenities).map(([amenity, value]) =>
                    value ? (
                      <div key={amenity} className="flex items-center gap-2">
                        {getAmenityIcon(amenity)}
                        <span className="text-sm">{amenity}</span>
                      </div>
                    ) : null
                  )}
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="font-semibold text-lg mb-3">Nội quy</h3>
                <ul className="space-y-2">
                  {property.rules.map((rule, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      • {rule}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="font-semibold text-lg mb-3">Đánh giá</h3>
                <ReviewsList reviews={reviews} loading={!property} />
              </div>

              {property && (
                <div className="border-t border-border pt-6">
                  <ReviewForm propertyId={property.id} onReviewSubmit={() => fetchReviews(property.id)} />
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{formatPrice(property.pricePerNight)}</div>
                  <div className="text-sm text-muted-foreground">/ đêm</div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm font-medium">Nhận phòng</label>
                      <input
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Trả phòng</label>
                      <input
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
                        min={checkIn || new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Số khách</label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(Number.parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
                    >
                      {Array.from({ length: property.maxGuests || 0 }, (_, i) => i + 1).map((num) => (
                        <option key={num} value={num}>
                          {num} khách
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleBookNow}
                  disabled={!property.isActive}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {property.isActive ? "Đặt ngay" : "Hết phòng"}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  {property.isActive
                    ? "Bạn chưa bị tính phí"
                    : "Homestay hiện không có sẵn để đặt phòng."}
                </div>

                {checkIn && checkOut && (
                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>
                        Giá phòng x{" "}
                        {Math.ceil(
                          (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24),
                        )}{" "}
                        đêm
                      </span>
                      <span>
                        {formatPrice(
                          property.pricePerNight *
                            Math.ceil(
                              (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24),
                            ),
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Phí dịch vụ</span>
                      <span>{formatPrice(50000)}</span>
                    </div>
                    <div className="border-t border-border pt-2 flex justify-between font-semibold">
                      <span>Tổng cộng</span>
                      <span>
                        {formatPrice(
                          property.pricePerNight *
                            Math.ceil(
                              (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24),
                            ) +
                            50000,
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />

      <BookingFlow
        isOpen={showBookingFlow}
        onClose={() => setShowBookingFlow(false)}
        property={property}
        initialCheckIn={checkIn}
        initialCheckOut={checkOut}
        initialGuests={guests}
      />
    </div>
  )
}
