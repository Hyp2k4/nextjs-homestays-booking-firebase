"use client"

import { TravelHeader } from "@/components/travel/header"
import { TravelHeroSection } from "@/components/travel/hero-section"
import { TravelFooter } from "@/components/travel/footer"
import { PropertyCard, FeatureCard } from "@/components/travel/cards"
import { GridSkeleton, PropertyCardSkeleton } from "@/components/travel/loading"
import { VoucherSlider } from "@/components/voucher-slider"
import { Button } from "@/components/ui/button"
import { PropertyService } from "@/lib/property-service"
import { Property } from "@/types/property"
import {
  ArrowRight,
  Star,
  Shield,
  Clock,
  Heart,
  Users,
  Home,
  Sparkles
} from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function HomePage() {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        const properties = await PropertyService.getFeaturedProperties()
        setFeaturedProperties(properties.slice(0, 6))
      } catch (error) {
        console.error("Error fetching featured properties:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProperties()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <TravelHeader />

      <main>
        {/* Hero Section */}
        <TravelHeroSection />

        {/* Features Section */}
        <section className="py-20 bg-neutral-50">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
                Why Choose{" "}
                <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text ">
                  Meap Homestay
                </span>
              </h2>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                Experience the best of Vietnam with our carefully curated homestays and exceptional service
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard
                icon={<Shield className="h-8 w-8 text-white" />}
                title="Verified Hosts"
                description="All our hosts are verified and background-checked for your safety and peace of mind"
              />
              <FeatureCard
                icon={<Clock className="h-8 w-8 text-white" />}
                title="24/7 Support"
                description="Round-the-clock customer support to assist you throughout your journey"
              />
              <FeatureCard
                icon={<Heart className="h-8 w-8 text-white" />}
                title="Local Experiences"
                description="Discover authentic local culture and hidden gems with our local hosts"
              />
              <FeatureCard
                icon={<Star className="h-8 w-8 text-white" />}
                title="Best Price Guarantee"
                description="We guarantee the best prices for your perfect homestay experience"
              />
            </div>
          </div>
        </section>

        {/* Featured Properties */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
                  Featured{" "}
                  <span className="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                    Homestays
                  </span>
                </h2>
                <p className="text-lg text-neutral-600">
                  Discover our handpicked selection of exceptional homestays
                </p>
              </div>
              <Link href="/homestays">
                <Button variant="outline" className="hidden md:flex">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>

            {loading ? (
              <GridSkeleton
                count={6}
                columns={3}
                CardSkeleton={PropertyCardSkeleton}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                  />
                ))}
              </div>
            )}

            <div className="text-center mt-12 md:hidden">
              <Link href="/homestays">
                <Button>
                  View All Homestays
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Voucher Section */}
        <section className="py-16 bg-gradient-to-br from-primary-50 to-secondary-50">
          <VoucherSlider />
        </section>
        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-500 text-white">
          <div className="container mx-auto px-4 lg:px-6 text-center">
            <div className="max-w-3xl mx-auto">
              <Sparkles className="h-16 w-16 mx-auto mb-6 text-primary-200" />
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Ready to Start Your Adventure?
              </h2>
              <p className="text-xl text-primary-100 mb-8">
                Join thousands of travelers who have discovered their perfect homestay with TravelVN
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/homestays">
                  <Button size="lg" variant="outline" className="bg-white text-primary-600 border-white hover:bg-primary-50">
                    <Home className="h-5 w-5 mr-2" />
                    Browse Homestays
                  </Button>
                </Link>
                <Link href="/become-host">
                  <Button size="lg" className="bg-secondary-500 hover:bg-secondary-600 text-white border-0">
                    <Users className="h-5 w-5 mr-2" />
                    Become a Host
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <TravelFooter />
    </div>
  )
}
