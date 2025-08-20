"use client"

"use client"

import { SearchSection } from "@/components/search-section"
import { FeaturedProperties } from "@/components/featured-properties"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroSlider } from "@/components/hero-slider"
import { GoogleMapWrapper } from "@/components/google-map"

export default function HomePage() {

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSlider />
        <section className="py-6">
          <div className="container mx-auto px-4">
            <SearchSection />
          </div>
        </section>

        {/* Featured Properties */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-serif font-bold text-3xl text-foreground mb-8 text-center">Homestay Nổi Bật</h2>
            <FeaturedProperties />
          </div>
        </section>

        {/* Interactive Map Section */}
        <section className="py-16 bg-muted/40">
          <div className="container mx-auto px-4">
            <h2 className="font-serif font-bold text-3xl text-foreground mb-8 text-center">
              Khám phá trên bản đồ
            </h2>
            <div className="rounded-lg overflow-hidden">
              <GoogleMapWrapper />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
