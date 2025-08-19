import { SearchSection } from "@/components/search-section"
import { FeaturedProperties } from "@/components/featured-properties"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero Section with Search */}
        <section className="relative bg-gradient-to-br from-primary/5 to-secondary/5 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="font-serif font-black text-4xl md:text-6xl text-foreground mb-4">
                Khám phá Homestay
                <span className="text-primary block">Tuyệt vời tại Việt Nam</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Tìm kiếm và đặt những homestay độc đáo, ấm cúng với trải nghiệm địa phương đích thực
              </p>
            </div>
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
      </main>
      <Footer />
    </div>
  )
}
