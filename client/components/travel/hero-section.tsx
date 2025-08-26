"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Search,
  MapPin,
  Calendar,
  Users,
  ArrowRight,
  Play,
  Star,
  TrendingUp
} from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"

interface HeroSettings {
  title: string
  subtitle: string
  description: string
  ctaText: string
  ctaLink: string
  backgroundImages: string[]
  overlayOpacity: number
}

const defaultHeroImages = [
  {
    src: "/sapa-mountain-villa.png",
    alt: "Sapa Mountain Villa",
    location: "Sapa, Lào Cai",
    title: "Mountain Retreat"
  },
  {
    src: "/hoi-an-traditional-house.png",
    alt: "Hoi An Traditional House",
    location: "Hội An, Quảng Nam",
    title: "Ancient Town Charm"
  },
  {
    src: "/danang-beach-apartment.png",
    alt: "Da Nang Beach Apartment",
    location: "Đà Nẵng",
    title: "Beachfront Paradise"
  },
  {
    src: "/nha-trang-beachfront-homestay.png",
    alt: "Nha Trang Beachfront",
    location: "Nha Trang, Khánh Hòa",
    title: "Coastal Escape"
  }
]

const quickStats = [
  { label: "Happy Travelers", value: "50K+", icon: Star },
  { label: "Destinations", value: "200+", icon: MapPin },
  { label: "Growth Rate", value: "98%", icon: TrendingUp },
]

export function TravelHeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [heroSettings, setHeroSettings] = useState<HeroSettings>({
    title: "Discover Your Perfect Stay",
    subtitle: "Your Perfect Home Away From Home",
    description: "Explore unique homestays and unforgettable experiences across Vietnam's most beautiful destinations",
    ctaText: "Start Exploring",
    ctaLink: "/homestays",
    backgroundImages: [],
    overlayOpacity: 0.4
  })
  const [searchData, setSearchData] = useState({
    destination: "",
    checkIn: "",
    checkOut: "",
    guests: 1
  })

  // Load hero settings from Firestore
  useEffect(() => {
    const loadHeroSettings = async () => {
      try {
        const docRef = doc(db, "settings", "hero")
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setHeroSettings(prev => ({ ...prev, ...docSnap.data() }))
        }
      } catch (error) {
        console.error("Error loading hero settings:", error)
      }
    }
    loadHeroSettings()
  }, [])

  // Use dynamic images or fallback to default
  const heroImages = heroSettings.backgroundImages.length > 0
    ? heroSettings.backgroundImages.map((src, index) => ({
        src,
        alt: `Hero Image ${index + 1}`,
        location: "",
        title: ""
      }))
    : defaultHeroImages

  // Auto-rotate hero images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [heroImages.length])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchData.destination) params.set("location", searchData.destination)
    if (searchData.checkIn) params.set("checkIn", searchData.checkIn)
    if (searchData.checkOut) params.set("checkOut", searchData.checkOut)
    if (searchData.guests > 1) params.set("guests", searchData.guests.toString())

    window.location.href = `${heroSettings.ctaLink}?${params.toString()}`
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image Carousel */}
      <div className="absolute inset-0 z-0">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0 transition-all duration-1000 ease-in-out",
              index === currentImageIndex ? "opacity-100 scale-100" : "opacity-0 scale-105"
            )}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover"
              priority={index === 0}
            />
            {/* Gradient Overlay */}
            <div
              className="absolute inset-0 bg-black"
              style={{ opacity: heroSettings.overlayOpacity }}
            />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 lg:px-6 pt-20">
        <div className="max-w-6xl mx-auto">
          {/* Main Content */}
          <div className="text-center lg:text-left lg:max-w-2xl mb-12">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 mb-6">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="text-white text-sm font-medium">Trusted by 50,000+ travelers</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight">
              {heroSettings.title}
            </h1>

            {/* Subtitle */}
            <h2 className="text-2xl md:text-3xl font-semibold text-secondary-400 mb-4">
              {heroSettings.subtitle}
            </h2>

            {/* Description */}
            <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-xl">
              {heroSettings.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white border-0 h-12 px-8"
                onClick={handleSearch}
              >
                <Search className="h-5 w-5 mr-2" />
                {heroSettings.ctaText}
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm h-12 px-8"
              >
                <Play className="h-5 w-5 mr-2" />
                Watch Video
              </Button>
            </div>
          </div>

          {/* Search Form */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl lg:rounded-3xl p-6 lg:p-8 shadow-2xl max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {/* Destination */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-700 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-primary-600" />
                  Where to?
                </label>
                <input
                  type="text"
                  placeholder="Search destinations"
                  value={searchData.destination}
                  onChange={(e) => setSearchData(prev => ({ ...prev, destination: e.target.value }))}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Check-in */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-700 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-primary-600" />
                  Check-in
                </label>
                <input
                  type="date"
                  value={searchData.checkIn}
                  onChange={(e) => setSearchData(prev => ({ ...prev, checkIn: e.target.value }))}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Check-out */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-700 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-primary-600" />
                  Check-out
                </label>
                <input
                  type="date"
                  value={searchData.checkOut}
                  onChange={(e) => setSearchData(prev => ({ ...prev, checkOut: e.target.value }))}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Guests */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-700 flex items-center">
                  <Users className="h-4 w-4 mr-2 text-primary-600" />
                  Guests
                </label>
                <select
                  value={searchData.guests}
                  onChange={(e) => setSearchData(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                >
                  {[1,2,3,4,5,6,7,8].map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search Button */}
            <div className="mt-6 flex justify-center lg:justify-end">
              <Button
                size="lg"
                onClick={handleSearch}
                className="w-full lg:w-auto bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white border-0 h-12 px-12"
              >
                <Search className="h-5 w-5 mr-2" />
                Search Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>

        </div>
      </div>

      {/* Image Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex space-x-3">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={cn(
              "w-3 h-3 rounded-full transition-all duration-300 border-2 border-white/50",
              index === currentImageIndex
                ? "bg-white scale-125"
                : "bg-white/30 hover:bg-white/50"
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
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  )
}
