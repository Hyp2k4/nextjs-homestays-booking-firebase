import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Users, Bed, Bath, Heart } from "lucide-react"
import type { Property } from "@/types/property"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"

interface PropertyCardProps {
  property: Property
}

export function PropertyCard({ property }: PropertyCardProps) {
  const { user, toggleWishlist } = useAuth()
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getPropertyTypeLabel = (type: string) => {
    const labels = {
      house: "Nhà",
      apartment: "Căn hộ",
      villa: "Villa",
      cabin: "Cabin",
      treehouse: "Nhà trên cây",
      boat: "Thuyền",
    }
    return labels[type as keyof typeof labels] || type
  }

  return (
    <div>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={property.images[0] || "/placeholder.svg"}
            alt={property.name || "Property Image"}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {property.featured && (
            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">Nổi bật</Badge>
          )}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full h-9 w-9"
              onClick={async (e) => {
                e.preventDefault()
                e.stopPropagation()
                if (!toggleWishlist) return
                await toggleWishlist(property.id)
              }}
            >
              <Heart className={`h-5 w-5 ${user?.wishlist?.includes(property.id) ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Location and Type */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{property.city}</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {getPropertyTypeLabel(property.propertyType)}
            </Badge>
          </div>

          {/* Title */}
          <Link href={`/property/${property.id}`}>
            <h3 className="font-serif font-semibold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {property.name}
            </h3>
          </Link>

          {/* Capacity */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{property.maxGuests} khách</span>
            </div>
            <div className="flex items-center gap-1">
              <Bed className="h-3 w-3" />
              <span>{property.bedrooms} phòng ngủ</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="h-3 w-3" />
              <span>{property.bathrooms} phòng tắm</span>
            </div>
          </div>

          {/* Rating and Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-sm">{property.rating?.average ?? 0}</span>
              <span className="text-sm text-muted-foreground">({property.rating?.count ?? 0})</span>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg text-foreground">{formatPrice(property.pricePerNight ?? 0)}</div>
              <div className="text-sm text-muted-foreground">/ đêm</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Link href={`/property/${property.id}`} className="flex-1">
              <Button className="w-full" variant="outline">View details</Button>
            </Link>
            <Link href={`/bookings?propertyId=${property.id}`} className="flex-1">
              <Button className="w-full">Book now</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
