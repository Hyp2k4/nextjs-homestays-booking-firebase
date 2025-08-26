"use client"

import { useState, useEffect } from "react"
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from "@/components/ui/modern-card"
import { ModernButton } from "@/components/ui/modern-button"
import { Star, MapPin, Users, Heart, ArrowRight, Sparkles, TrendingUp, Target } from "lucide-react"
import { RecommendationService, RecommendationData } from "@/lib/recommendation-service"
import { Property } from "@/types/property"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

const recommendationIcons = {
  location_based: MapPin,
  price_based: Target,
  rating_based: Star,
  similar_properties: Heart,
  trending: TrendingUp,
}

const recommendationColors = {
  location_based: "from-blue-500 to-cyan-500",
  price_based: "from-green-500 to-emerald-500",
  rating_based: "from-yellow-500 to-orange-500",
  similar_properties: "from-pink-500 to-rose-500",
  trending: "from-purple-500 to-indigo-500",
}

export function ModernRecommendations() {
  const [recommendations, setRecommendations] = useState<RecommendationData[]>([])
  const [loading, setLoading] = useState(true)
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        if (isAuthenticated && user?.id) {
          const data = await RecommendationService.getPersonalizedRecommendations(user.id)
          setRecommendations(data)
        } else {
          // For non-authenticated users, show trending and high-rated properties
          const trendingData = await RecommendationService.getTrendingRecommendations()
          const ratingData = await RecommendationService.getHighRatedRecommendations()
          setRecommendations([trendingData, ratingData].filter(rec => rec.properties.length > 0))
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [user, isAuthenticated])

  if (loading) {
    return (
      <div className="space-y-8">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="bg-gray-200 rounded-xl h-80"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (recommendations.length === 0) {
    return null
  }

  return (
    <div className="space-y-12">
      {/* Section Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-2 rounded-full">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-primary">Dành riêng cho bạn</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Gợi ý{" "}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            dành cho bạn
          </span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {isAuthenticated 
            ? "Những homestay được chọn lọc dựa trên sở thích và lịch sử của bạn"
            : "Khám phá những homestay được yêu thích nhất"
          }
        </p>
      </div>

      {/* Recommendation Sections */}
      {recommendations.map((recommendation, index) => (
        <RecommendationSection
          key={`${recommendation.type}-${index}`}
          recommendation={recommendation}
          index={index}
        />
      ))}
    </div>
  )
}

function RecommendationSection({ 
  recommendation, 
  index 
}: { 
  recommendation: RecommendationData
  index: number 
}) {
  const Icon = recommendationIcons[recommendation.type]
  const colorClass = recommendationColors[recommendation.type]

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center space-x-4">
        <div className={cn(
          "flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r text-white",
          colorClass
        )}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground">
            {getRecommendationTitle(recommendation.type)}
          </h3>
          <p className="text-muted-foreground">{recommendation.reason}</p>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendation.properties.slice(0, 3).map((property, propertyIndex) => (
          <PropertyCard 
            key={property.id} 
            property={property} 
            delay={propertyIndex * 0.1}
          />
        ))}
      </div>

      {/* View More Button */}
      {recommendation.properties.length > 3 && (
        <div className="text-center">
          <Link href={`/homestays?type=${recommendation.type}`}>
            <ModernButton variant="outline">
              Xem thêm {recommendation.properties.length - 3} homestay
              <ArrowRight className="h-4 w-4 ml-2" />
            </ModernButton>
          </Link>
        </div>
      )}
    </div>
  )
}

function PropertyCard({ 
  property, 
  delay = 0 
}: { 
  property: Property
  delay?: number 
}) {
  const [isWishlisted, setIsWishlisted] = useState(false)

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsWishlisted(!isWishlisted)
  }

  return (
    <Link href={`/homestay/${property.id}`}>
      <ModernCard 
        variant="elevated" 
        className="group cursor-pointer overflow-hidden animate-fade-in-up"
        style={{ animationDelay: `${delay}s` }}
      >
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

function getRecommendationTitle(type: RecommendationData['type']): string {
  switch (type) {
    case 'location_based':
      return 'Địa điểm quen thuộc'
    case 'price_based':
      return 'Phù hợp ngân sách'
    case 'rating_based':
      return 'Đánh giá cao nhất'
    case 'similar_properties':
      return 'Tương tự sở thích'
    case 'trending':
      return 'Đang thịnh hành'
    default:
      return 'Gợi ý cho bạn'
  }
}
