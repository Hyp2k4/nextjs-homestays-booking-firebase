"use client"

import { useState } from "react"
import { Heart, Share2, Star, MapPin, Users, Wifi, Car, Coffee, Waves } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { useToastActions } from "@/components/ui/toast-system"
import { PropertyBadges, HostBadge, PriceBadge } from "@/components/ui/badge-system"

const featuredProperties = [
  {
    id: 1,
    name: "Villa Sapa View",
    location: "Sapa, Lào Cai",
    price: 1200000,
    originalPrice: 1500000,
    rating: 4.8,
    reviews: 124,
    images: ["/images/property-1.jpg", "/images/property-1-2.jpg"],
    amenities: ["wifi", "parking", "breakfast", "view"],
    maxGuests: 6,
    isWishlisted: false,
    discount: 20,
    badge: "Ưu đãi đặc biệt",
    host: {
      name: "Chị Lan",
      avatar: "/images/host-1.jpg",
      superhost: true
    }
  },
  {
    id: 2,
    name: "Homestay Hội An Cổ Kính",
    location: "Hội An, Quảng Nam",
    price: 800000,
    rating: 4.9,
    reviews: 89,
    images: ["/images/property-2.jpg", "/images/property-2-2.jpg"],
    amenities: ["wifi", "ac", "breakfast", "bike"],
    maxGuests: 4,
    isWishlisted: true,
    badge: "Chủ nhà siêu tuyệt",
    host: {
      name: "Anh Minh",
      avatar: "/images/host-2.jpg",
      superhost: true
    }
  },
  {
    id: 3,
    name: "Đà Lạt Romantic House",
    location: "Đà Lạt, Lâm Đồng",
    price: 950000,
    rating: 4.7,
    reviews: 156,
    images: ["/images/property-3.jpg", "/images/property-3-2.jpg"],
    amenities: ["wifi", "fireplace", "garden", "parking"],
    maxGuests: 2,
    isWishlisted: false,
    badge: "Mới",
    host: {
      name: "Cô Hoa",
      avatar: "/images/host-3.jpg",
      superhost: false
    }
  }
]

const amenityIcons = {
  wifi: <Wifi className="h-4 w-4" />,
  parking: <Car className="h-4 w-4" />,
  breakfast: <Coffee className="h-4 w-4" />,
  view: <MapPin className="h-4 w-4" />,
  ac: "❄️",
  bike: "🚲",
  fireplace: "🔥",
  garden: "🌿",
  pool: <Waves className="h-4 w-4" />
}

export function FeaturedProperties() {
  const [properties, setProperties] = useState(featuredProperties)
  const [hoveredProperty, setHoveredProperty] = useState<number | null>(null)
  const { handleWishlistToggle, handleShare, toast } = useToastActions()

  const toggleWishlist = (propertyId: number) => {
    const property = properties.find(p => p.id === propertyId)
    if (!property) return

    setProperties(prev =>
      prev.map(p =>
        p.id === propertyId
          ? { ...p, isWishlisted: !p.isWishlisted }
          : p
      )
    )

    handleWishlistToggle(property.name, !property.isWishlisted)
  }

  const handlePropertyShare = (property: typeof featuredProperties[0]) => {
    handleShare(`${window.location.origin}/property/${property.id}`, property.name)
  }

  const handleQuickView = (propertyId: number) => {
    toast.info("Đang mở xem nhanh...")
    // Implement quick view modal
  }

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/10">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">
            Homestay Nổi Bật
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Khám phá những homestay được yêu thích nhất với đánh giá cao từ khách hàng
          </p>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <Card
              key={property.id}
              className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
              onMouseEnter={() => setHoveredProperty(property.id)}
              onMouseLeave={() => setHoveredProperty(null)}
              onClick={() => handleQuickView(property.id)}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                {/* Main Image */}
                <OptimizedImage
                  src={property.images[0]}
                  alt={property.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* Hover Image */}
                {hoveredProperty === property.id && property.images[1] && (
                  <OptimizedImage
                    src={property.images[1]}
                    alt={`${property.name} - view 2`}
                    fill
                    className="object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {property.badge && (
                    <Badge 
                      variant={property.badge === "Ưu đãi đặc biệt" ? "destructive" : "secondary"}
                      className="text-xs font-medium"
                    >
                      {property.badge}
                    </Badge>
                  )}
                  {property.discount && (
                    <Badge variant="destructive" className="text-xs font-medium">
                      -{property.discount}%
                    </Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 bg-white/90 hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleWishlist(property.id)
                    }}
                  >
                    <Heart 
                      className={`h-4 w-4 ${
                        property.isWishlisted 
                          ? "fill-red-500 text-red-500" 
                          : "text-gray-600"
                      }`} 
                    />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 bg-white/90 hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePropertyShare(property)
                    }}
                  >
                    <Share2 className="h-4 w-4 text-gray-600" />
                  </Button>
                </div>

                {/* Host Info */}
                <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center gap-2 bg-white/90 rounded-full px-3 py-1">
                    <div className="w-6 h-6 rounded-full overflow-hidden">
                      <OptimizedImage
                        src={property.host.avatar}
                        alt={property.host.name}
                        width={24}
                        height={24}
                        className="object-cover"
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-700">
                      {property.host.name}
                    </span>
                    {property.host.superhost && (
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        ⭐
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <CardContent className="p-4">
                {/* Rating & Reviews */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-sm">{property.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({property.reviews} đánh giá)
                  </span>
                </div>

                {/* Property Name & Location */}
                <h3 className="font-semibold text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                  {property.name}
                </h3>
                <div className="flex items-center gap-1 text-muted-foreground mb-3">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{property.location}</span>
                </div>

                {/* Amenities */}
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Tối đa {property.maxGuests} khách
                  </span>
                  <div className="flex gap-1 ml-auto">
                    {property.amenities.slice(0, 3).map((amenity) => (
                      <div key={amenity} className="text-muted-foreground">
                        {amenityIcons[amenity as keyof typeof amenityIcons]}
                      </div>
                    ))}
                    {property.amenities.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{property.amenities.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div>
                    {property.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through mr-2">
                        {property.originalPrice.toLocaleString('vi-VN')}đ
                      </span>
                    )}
                    <span className="font-bold text-lg">
                      {property.price.toLocaleString('vi-VN')}đ
                    </span>
                    <span className="text-sm text-muted-foreground">/đêm</span>
                  </div>
                  <Button 
                    size="sm" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    onClick={(e) => {
                      e.stopPropagation()
                      toast.success("Đang chuyển đến trang đặt phòng...")
                    }}
                  >
                    Đặt ngay
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View More Button */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="px-8">
            Xem thêm homestay
          </Button>
        </div>
      </div>
    </section>
  )
}
