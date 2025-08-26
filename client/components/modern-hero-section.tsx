"use client"

import { useState, useEffect } from "react"
import { ModernButton } from "@/components/ui/modern-button"
import { ModernInput, SearchInput } from "@/components/ui/modern-input"
import { ModernCard } from "@/components/ui/modern-card"
import { MapPin, Calendar, Users, Search, Star, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"

const heroImages = [
  {
    src: "/sapa-mountain-villa.png",
    alt: "Sapa Mountain Villa",
    location: "Sapa, Lào Cai"
  },
  {
    src: "/hoi-an-traditional-house.png", 
    alt: "Hoi An Traditional House",
    location: "Hội An, Quảng Nam"
  },
  {
    src: "/danang-beach-apartment.png",
    alt: "Da Nang Beach Apartment", 
    location: "Đà Nẵng"
  },
  {
    src: "/nha-trang-beachfront-homestay.png",
    alt: "Nha Trang Beachfront",
    location: "Nha Trang, Khánh Hòa"
  }
]

const quickStats = [
  { label: "Homestays", value: "1,200+", icon: MapPin },
  { label: "Khách hàng hài lòng", value: "50,000+", icon: Star },
  { label: "Tỷ lệ đánh giá tốt", value: "98%", icon: TrendingUp },
]

export function ModernHeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [searchData, setSearchData] = useState({
    location: "",
    checkIn: "",
    checkOut: "",
    guests: 1
  })

  // Auto-rotate hero images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchData.location) params.set("location", searchData.location)
    if (searchData.checkIn) params.set("checkIn", searchData.checkIn)
    if (searchData.checkOut) params.set("checkOut", searchData.checkOut)
    if (searchData.guests > 1) params.set("guests", searchData.guests.toString())
    
    window.location.href = `/homestays?${params.toString()}`
  }

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image Carousel */}
      <div className="absolute inset-0 z-0">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000",
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            )}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Main Heading */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Khám phá{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                Việt Nam
              </span>
              <br />
              cùng chúng tôi
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              Trải nghiệm những homestay độc đáo, phòng nghỉ tuyệt vời
              <br className="hidden md:block" />
              tại các điểm đến hấp dẫn nhất Việt Nam
            </p>
          </div>

          {/* Search Card */}
          <ModernCard variant="glass" className="p-6 md:p-8 mb-12 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Điểm đến</label>
                <ModernInput
                  icon="location"
                  placeholder="Bạn muốn đi đâu?"
                  value={searchData.location}
                  onChange={(e) => setSearchData(prev => ({ ...prev, location: e.target.value }))}
                  variant="luxury"
                />
              </div>

              {/* Check-in */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nhận phòng</label>
                <ModernInput
                  icon="calendar"
                  type="date"
                  value={searchData.checkIn}
                  onChange={(e) => setSearchData(prev => ({ ...prev, checkIn: e.target.value }))}
                  variant="luxury"
                />
              </div>

              {/* Check-out */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Trả phòng</label>
                <ModernInput
                  icon="calendar"
                  type="date"
                  value={searchData.checkOut}
                  onChange={(e) => setSearchData(prev => ({ ...prev, checkOut: e.target.value }))}
                  variant="luxury"
                />
              </div>

              {/* Guests */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Khách</label>
                <select
                  value={searchData.guests}
                  onChange={(e) => setSearchData(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
                  className="flex h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm transition-all duration-200 focus:border-primary focus:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {[1,2,3,4,5,6,7,8].map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'khách' : 'khách'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <ModernButton
                variant="gradient"
                size="lg"
                onClick={handleSearch}
                className="w-full md:w-auto px-12"
              >
                <Search className="h-5 w-5 mr-2" />
                Tìm kiếm ngay
              </ModernButton>
            </div>
          </ModernCard>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {quickStats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div
                  key={index}
                  className="text-center text-white animate-fade-in"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm mb-3">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-white/80">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Image Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex space-x-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={cn(
              "w-3 h-3 rounded-full transition-all duration-300",
              index === currentImageIndex
                ? "bg-white scale-125"
                : "bg-white/50 hover:bg-white/75"
            )}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 right-8 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/75 rounded-full mt-2 animate-pulse" />
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
      `}</style>
    </section>
  )
}
