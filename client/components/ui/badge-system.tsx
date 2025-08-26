"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { 
  Star, 
  Crown, 
  Shield, 
  Zap, 
  Heart, 
  Award, 
  Verified,
  Flame,
  Gift,
  Clock,
  Users,
  MapPin,
  Wifi,
  Car,
  Coffee,
  Waves
} from "lucide-react"

// Property status badges
export const PropertyStatusBadge = ({ 
  status, 
  className 
}: { 
  status: 'available' | 'booked' | 'maintenance' | 'new' | 'featured'
  className?: string 
}) => {
  const statusConfig = {
    available: {
      label: "Còn phòng",
      variant: "default" as const,
      icon: <Shield className="h-3 w-3" />
    },
    booked: {
      label: "Đã đặt",
      variant: "secondary" as const,
      icon: <Clock className="h-3 w-3" />
    },
    maintenance: {
      label: "Bảo trì",
      variant: "destructive" as const,
      icon: <Zap className="h-3 w-3" />
    },
    new: {
      label: "Mới",
      variant: "default" as const,
      icon: <Star className="h-3 w-3" />,
      className: "bg-green-500 hover:bg-green-600 text-white"
    },
    featured: {
      label: "Nổi bật",
      variant: "default" as const,
      icon: <Crown className="h-3 w-3" />,
      className: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
    }
  }

  const config = statusConfig[status]
  
  return (
    <Badge 
      variant={config.variant}
      className={cn(
        "flex items-center gap-1 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.icon}
      {config.label}
    </Badge>
  )
}

// Host badges
export const HostBadge = ({ 
  type, 
  className 
}: { 
  type: 'superhost' | 'verified' | 'new' | 'experienced'
  className?: string 
}) => {
  const hostConfig = {
    superhost: {
      label: "Chủ nhà siêu tuyệt",
      icon: <Crown className="h-3 w-3" />,
      className: "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
    },
    verified: {
      label: "Đã xác minh",
      icon: <Verified className="h-3 w-3" />,
      className: "bg-blue-500 text-white"
    },
    new: {
      label: "Chủ nhà mới",
      icon: <Star className="h-3 w-3" />,
      className: "bg-green-500 text-white"
    },
    experienced: {
      label: "Kinh nghiệm",
      icon: <Award className="h-3 w-3" />,
      className: "bg-orange-500 text-white"
    }
  }

  const config = hostConfig[type]
  
  return (
    <Badge 
      className={cn(
        "flex items-center gap-1 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.icon}
      {config.label}
    </Badge>
  )
}

// Promotion badges
export const PromoBadge = ({ 
  type, 
  value,
  className 
}: { 
  type: 'discount' | 'flash' | 'limited' | 'new_user' | 'weekend'
  value?: string | number
  className?: string 
}) => {
  const promoConfig = {
    discount: {
      label: value ? `Giảm ${value}%` : "Giảm giá",
      icon: <Gift className="h-3 w-3" />,
      className: "bg-red-500 text-white animate-pulse"
    },
    flash: {
      label: "Flash Sale",
      icon: <Flame className="h-3 w-3" />,
      className: "bg-gradient-to-r from-red-500 to-orange-500 text-white animate-bounce"
    },
    limited: {
      label: "Số lượng có hạn",
      icon: <Clock className="h-3 w-3" />,
      className: "bg-orange-500 text-white"
    },
    new_user: {
      label: "Khách mới",
      icon: <Star className="h-3 w-3" />,
      className: "bg-blue-500 text-white"
    },
    weekend: {
      label: "Cuối tuần",
      icon: <Heart className="h-3 w-3" />,
      className: "bg-purple-500 text-white"
    }
  }

  const config = promoConfig[type]
  
  return (
    <Badge 
      className={cn(
        "flex items-center gap-1 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.icon}
      {config.label}
    </Badge>
  )
}

// Amenity badges
export const AmenityBadge = ({ 
  amenity, 
  className 
}: { 
  amenity: 'wifi' | 'parking' | 'breakfast' | 'pool' | 'ac' | 'kitchen' | 'pet' | 'gym'
  className?: string 
}) => {
  const amenityConfig = {
    wifi: {
      label: "WiFi",
      icon: <Wifi className="h-3 w-3" />
    },
    parking: {
      label: "Đậu xe",
      icon: <Car className="h-3 w-3" />
    },
    breakfast: {
      label: "Bữa sáng",
      icon: <Coffee className="h-3 w-3" />
    },
    pool: {
      label: "Hồ bơi",
      icon: <Waves className="h-3 w-3" />
    },
    ac: {
      label: "Điều hòa",
      icon: "❄️"
    },
    kitchen: {
      label: "Bếp",
      icon: "🍳"
    },
    pet: {
      label: "Thú cưng",
      icon: "🐕"
    },
    gym: {
      label: "Gym",
      icon: "💪"
    }
  }

  const config = amenityConfig[amenity]
  
  return (
    <Badge 
      variant="outline"
      className={cn(
        "flex items-center gap-1 text-xs font-medium",
        className
      )}
    >
      {config.icon}
      {config.label}
    </Badge>
  )
}

// Rating badge
export const RatingBadge = ({ 
  rating, 
  reviews,
  className 
}: { 
  rating: number
  reviews?: number
  className?: string 
}) => {
  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "bg-green-500 text-white"
    if (rating >= 4.0) return "bg-blue-500 text-white"
    if (rating >= 3.5) return "bg-yellow-500 text-white"
    return "bg-gray-500 text-white"
  }

  return (
    <Badge 
      className={cn(
        "flex items-center gap-1 text-xs font-medium",
        getRatingColor(rating),
        className
      )}
    >
      <Star className="h-3 w-3 fill-current" />
      {rating.toFixed(1)}
      {reviews && <span>({reviews})</span>}
    </Badge>
  )
}

// Location badge
export const LocationBadge = ({ 
  location, 
  distance,
  className 
}: { 
  location: string
  distance?: string
  className?: string 
}) => {
  return (
    <Badge 
      variant="outline"
      className={cn(
        "flex items-center gap-1 text-xs font-medium",
        className
      )}
    >
      <MapPin className="h-3 w-3" />
      {location}
      {distance && <span>• {distance}</span>}
    </Badge>
  )
}

// Capacity badge
export const CapacityBadge = ({ 
  guests, 
  className 
}: { 
  guests: number
  className?: string 
}) => {
  return (
    <Badge 
      variant="secondary"
      className={cn(
        "flex items-center gap-1 text-xs font-medium",
        className
      )}
    >
      <Users className="h-3 w-3" />
      {guests} khách
    </Badge>
  )
}

// Price badge with discount
export const PriceBadge = ({ 
  price, 
  originalPrice,
  currency = "VNĐ",
  className 
}: { 
  price: number
  originalPrice?: number
  currency?: string
  className?: string 
}) => {
  const hasDiscount = originalPrice && originalPrice > price
  const discountPercent = hasDiscount 
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge 
        variant="default"
        className="text-sm font-bold"
      >
        {price.toLocaleString('vi-VN')} {currency}
      </Badge>
      {hasDiscount && (
        <>
          <Badge 
            variant="outline"
            className="text-xs line-through text-muted-foreground"
          >
            {originalPrice.toLocaleString('vi-VN')} {currency}
          </Badge>
          <Badge 
            variant="destructive"
            className="text-xs font-medium"
          >
            -{discountPercent}%
          </Badge>
        </>
      )}
    </div>
  )
}

// Composite badge for property cards
export const PropertyBadges = ({ 
  status,
  promo,
  rating,
  reviews,
  className 
}: { 
  status?: 'available' | 'booked' | 'maintenance' | 'new' | 'featured'
  promo?: { type: 'discount' | 'flash' | 'limited' | 'new_user' | 'weekend', value?: string | number }
  rating?: number
  reviews?: number
  className?: string 
}) => {
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {status && <PropertyStatusBadge status={status} />}
      {promo && <PromoBadge type={promo.type} value={promo.value} />}
      {rating && <RatingBadge rating={rating} reviews={reviews} />}
    </div>
  )
}
