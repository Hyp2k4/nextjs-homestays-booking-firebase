"use client"

import { useState, useEffect } from "react"
import { Search, MapPin, Calendar, Users, Star, Heart, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { useToastActions } from "@/components/ui/toast-system"

const heroImages = [
  {
    src: "/images/hero-1.jpg",
    alt: "Homestay view 1",
    location: "Sapa, Lào Cai",
    title: "Homestay trên núi với view tuyệt đẹp"
  },
  {
    src: "/images/hero-2.jpg", 
    alt: "Homestay view 2",
    location: "Hội An, Quảng Nam",
    title: "Homestay cổ kính giữa phố cổ"
  },
  {
    src: "/images/hero-3.jpg",
    alt: "Homestay view 3", 
    location: "Đà Lạt, Lâm Đồng",
    title: "Homestay lãng mạn thành phố ngàn hoa"
  }
]

const quickFilters = [
  { label: "Gần biển", icon: "🏖️", count: 120 },
  { label: "View núi", icon: "🏔️", count: 85 },
  { label: "Trung tâm", icon: "🏙️", count: 200 },
  { label: "Có hồ bơi", icon: "🏊", count: 45 },
  { label: "Pet friendly", icon: "🐕", count: 30 },
  { label: "Có bữa sáng", icon: "🍳", count: 150 }
]

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const { handleSearch, handleShare, toast } = useToastActions()

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const handleQuickSearch = (filter: string) => {
    handleSearch(filter)
    // Implement search logic here
  }

  const handleSharePage = () => {
    handleShare(window.location.href, "Trang chủ Meap Homestay")
  }

  return (
    <section className="relative h-[70vh] min-h-[600px] overflow-hidden">
      {/* Background Images */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <OptimizedImage
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ))}
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-white px-4">
        {/* Main Title */}
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 font-serif">
            Khám phá
            <span className="block text-primary-foreground">Homestay</span>
            tuyệt vời
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Trải nghiệm những khoảnh khắc đáng nhớ tại các homestay độc đáo khắp Việt Nam
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-4xl mb-8">
          <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Bạn muốn đi đâu?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="pl-10 h-12 text-base border-0 focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div className="flex gap-2 lg:gap-4">
                <Button variant="outline" size="lg" className="flex-1 lg:flex-none">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Ngày</span>
                </Button>
                <Button variant="outline" size="lg" className="flex-1 lg:flex-none">
                  <Users className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Khách</span>
                </Button>
                <Button size="lg" className="flex-1 lg:flex-none bg-primary hover:bg-primary/90">
                  <Search className="h-4 w-4 mr-2" />
                  Tìm kiếm
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Filters */}
        <div className="w-full max-w-4xl">
          <div className="flex flex-wrap justify-center gap-3">
            {quickFilters.map((filter, index) => (
              <Button
                key={index}
                variant="secondary"
                size="sm"
                onClick={() => handleQuickSearch(filter.label)}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
              >
                <span className="mr-2">{filter.icon}</span>
                {filter.label}
                <Badge variant="secondary" className="ml-2 bg-white/20 text-white">
                  {filter.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Current Location Info */}
        <div className="absolute bottom-8 left-8 hidden lg:block">
          <Card className="p-4 bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary-foreground" />
              <div>
                <h3 className="font-semibold">{heroImages[currentSlide].location}</h3>
                <p className="text-sm text-white/80">{heroImages[currentSlide].title}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Share Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSharePage}
          className="absolute bottom-8 right-8 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide 
                ? "bg-white scale-125" 
                : "bg-white/50 hover:bg-white/75"
            }`}
          />
        ))}
      </div>
    </section>
  )
}
