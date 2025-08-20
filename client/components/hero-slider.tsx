"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel"
import { db } from "@/lib/firebase/config"
import { doc, getDoc } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"

type HeroSettings = {
  images?: string[]
  heading?: string
  subheading?: string
}

export function HeroSlider() {
  const [settings, setSettings] = useState<HeroSettings | null>(null)
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null)
  const [hovered, setHovered] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, "settings", "hero"))
        if (snap.exists()) {
          setSettings(snap.data() as HeroSettings)
        } else {
          setSettings({
            images: ["/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg"],
            heading: "Welcome to VietStay",
            subheading: "Discover the best homestays in Vietnam."
          })
        }
      } catch (e) {
        console.error("Failed to fetch hero settings:", e)
        // Set default settings on error
        setSettings({
          images: ["/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg", "/placeholder.jpg"],
          heading: "Welcome to VietStay",
          subheading: "Discover the best homestays in Vietnam."
        })
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  useEffect(() => {
    if (!carouselApi || hovered) return
    const timer = setInterval(() => {
      carouselApi.scrollNext()
    }, 5000)
    return () => clearInterval(timer)
  }, [carouselApi, hovered])

  if (loading) {
    return (
      <section className="w-full container mx-auto py-8">
        <Skeleton className="w-full aspect-[16/9] md:aspect-[21/9] rounded-lg" />
      </section>
    )
  }

  const images = settings?.images?.length ? settings.images.slice(0, 4) : []

  return (
    <section 
      className="w-full container mx-auto py-8"
      onMouseEnter={() => setHovered(true)} 
      onMouseLeave={() => setHovered(false)}
    >
      <Card className="border-0 rounded-lg overflow-hidden">
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9]">
          <Carousel className="w-full h-full" setApi={setCarouselApi} opts={{ loop: true }}>
            <CarouselContent>
              {images.map((src, idx) => (
                <CarouselItem key={idx} className="h-full">
                  <div className="relative w-full h-full">
                    <Image 
                      src={src} 
                      alt={settings?.images?.[idx] || `Hero image ${idx + 1}`} 
                      fill 
                      className="object-cover" 
                      priority={idx === 0} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4 bg-white/80 hover:bg-white transition-colors" />
            <CarouselNext className="right-4 bg-white/80 hover:bg-white transition-colors" />
          </Carousel>
          
          {(settings?.heading || settings?.subheading) && (
            <div className="absolute inset-0 flex items-center justify-center text-center text-white p-4 pointer-events-none">
              <div className="max-w-3xl">
                {settings.heading && (
                  <h1 className="font-playfair font-bold text-4xl md:text-6xl drop-shadow-2xl mb-4">{settings.heading}</h1>
                )}
                {settings.subheading && (
                  <p className="text-lg md:text-xl opacity-90 drop-shadow-lg">{settings.subheading}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </section>
  )
}
