"use client"

import { ModernHeader } from "@/components/modern-header"
import { ModernButton } from "@/components/ui/modern-button"
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from "@/components/ui/modern-card"
import { ModernInput } from "@/components/ui/modern-input"
import { ResponsiveContainer, ResponsiveGrid, ResponsiveText } from "@/components/ui/responsive-container"
import { ModernFooter } from "@/components/modern-footer"
import { SkipLink, ScreenReaderOnly } from "@/components/accessibility/screen-reader"
import { Star, Heart, MapPin, Users, Smartphone, Tablet, Monitor } from "lucide-react"

export default function DesignDemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <SkipLink targetId="main-content" />
      <ModernHeader />
      
      <main id="main-content" className="space-y-16 py-8">
        {/* Responsive Breakpoint Indicators */}
        <ResponsiveContainer>
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">
              Design System Demo
            </h1>
            <p className="text-muted-foreground">
              Testing responsive design across all breakpoints
            </p>
            
            {/* Breakpoint Indicators */}
            <div className="flex justify-center space-x-4 mt-8">
              <div className="flex items-center space-x-2 xs:bg-red-100 xs:text-red-800 sm:bg-transparent sm:text-muted-foreground px-3 py-1 rounded-full text-sm">
                <Smartphone className="h-4 w-4" />
                <span>XS (375px+)</span>
              </div>
              <div className="flex items-center space-x-2 sm:bg-blue-100 sm:text-blue-800 md:bg-transparent md:text-muted-foreground px-3 py-1 rounded-full text-sm">
                <Smartphone className="h-4 w-4" />
                <span>SM (640px+)</span>
              </div>
              <div className="flex items-center space-x-2 md:bg-green-100 md:text-green-800 lg:bg-transparent lg:text-muted-foreground px-3 py-1 rounded-full text-sm">
                <Tablet className="h-4 w-4" />
                <span>MD (768px+)</span>
              </div>
              <div className="flex items-center space-x-2 lg:bg-purple-100 lg:text-purple-800 xl:bg-transparent xl:text-muted-foreground px-3 py-1 rounded-full text-sm">
                <Monitor className="h-4 w-4" />
                <span>LG (1024px+)</span>
              </div>
              <div className="flex items-center space-x-2 xl:bg-orange-100 xl:text-orange-800 2xl:bg-transparent 2xl:text-muted-foreground px-3 py-1 rounded-full text-sm">
                <Monitor className="h-4 w-4" />
                <span>XL (1280px+)</span>
              </div>
              <div className="flex items-center space-x-2 2xl:bg-pink-100 2xl:text-pink-800 px-3 py-1 rounded-full text-sm">
                <Monitor className="h-4 w-4" />
                <span>2XL (1440px+)</span>
              </div>
            </div>
          </div>
        </ResponsiveContainer>

        {/* Button Variants */}
        <ResponsiveContainer>
          <ModernCard>
            <ModernCardHeader>
              <ModernCardTitle>Button Variants</ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <ModernButton variant="default">Default</ModernButton>
                <ModernButton variant="secondary">Secondary</ModernButton>
                <ModernButton variant="outline">Outline</ModernButton>
                <ModernButton variant="ghost">Ghost</ModernButton>
                <ModernButton variant="gradient">Gradient</ModernButton>
                <ModernButton variant="luxury">Luxury</ModernButton>
                <ModernButton variant="destructive">Destructive</ModernButton>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <ModernButton size="sm">Small</ModernButton>
                <ModernButton size="default">Default</ModernButton>
                <ModernButton size="lg">Large</ModernButton>
                <ModernButton size="xl">Extra Large</ModernButton>
              </div>
            </ModernCardContent>
          </ModernCard>
        </ResponsiveContainer>

        {/* Input Variants */}
        <ResponsiveContainer>
          <ModernCard>
            <ModernCardHeader>
              <ModernCardTitle>Input Components</ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent>
              <ResponsiveGrid cols={{ xs: 1, md: 2, lg: 3 }} gap="md">
                <ModernInput placeholder="Default input" />
                <ModernInput icon="search" placeholder="Search input" variant="search" />
                <ModernInput icon="location" placeholder="Location input" variant="luxury" />
                <ModernInput icon="calendar" type="date" />
                <ModernInput icon="users" placeholder="Guests" />
                <ModernInput type="email" placeholder="Email address" />
              </ResponsiveGrid>
            </ModernCardContent>
          </ModernCard>
        </ResponsiveContainer>

        {/* Card Variants */}
        <ResponsiveContainer>
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Card Variants</h2>
            <ResponsiveGrid cols={{ xs: 1, md: 2, lg: 4 }} gap="md">
              <ModernCard variant="default">
                <ModernCardContent className="p-6">
                  <h3 className="font-semibold mb-2">Default Card</h3>
                  <p className="text-muted-foreground">Standard card with border and shadow</p>
                </ModernCardContent>
              </ModernCard>
              
              <ModernCard variant="elevated">
                <ModernCardContent className="p-6">
                  <h3 className="font-semibold mb-2">Elevated Card</h3>
                  <p className="text-muted-foreground">Card with enhanced shadow</p>
                </ModernCardContent>
              </ModernCard>
              
              <ModernCard variant="luxury">
                <ModernCardContent className="p-6">
                  <h3 className="font-semibold mb-2">Luxury Card</h3>
                  <p className="text-muted-foreground">Premium gradient background</p>
                </ModernCardContent>
              </ModernCard>
              
              <ModernCard variant="glass">
                <ModernCardContent className="p-6">
                  <h3 className="font-semibold mb-2">Glass Card</h3>
                  <p className="text-muted-foreground">Glassmorphism effect</p>
                </ModernCardContent>
              </ModernCard>
            </ResponsiveGrid>
          </div>
        </ResponsiveContainer>

        {/* Responsive Typography */}
        <ResponsiveContainer>
          <ModernCard>
            <ModernCardHeader>
              <ModernCardTitle>Responsive Typography</ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent className="space-y-4">
              <ResponsiveText 
                as="h1" 
                size={{ xs: "text-2xl", md: "text-4xl", lg: "text-6xl" }}
                weight="bold"
                align="center"
              >
                Responsive Heading
              </ResponsiveText>
              
              <ResponsiveText 
                as="h2" 
                size={{ xs: "text-lg", md: "text-2xl", lg: "text-3xl" }}
                weight="semibold"
                align="center"
              >
                Secondary Heading
              </ResponsiveText>
              
              <ResponsiveText 
                size={{ xs: "text-sm", md: "text-base", lg: "text-lg" }}
                align="center"
                className="text-muted-foreground"
              >
                This paragraph text scales responsively across different screen sizes. 
                On mobile it's smaller, on tablet it's medium, and on desktop it's larger.
              </ResponsiveText>
            </ModernCardContent>
          </ModernCard>
        </ResponsiveContainer>

        {/* Property Card Demo */}
        <ResponsiveContainer>
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Property Card Demo</h2>
            <ResponsiveGrid cols={{ xs: 1, sm: 2, lg: 3 }} gap="md">
              {[1, 2, 3].map((i) => (
                <ModernCard key={i} variant="elevated" className="group cursor-pointer overflow-hidden hover-lift">
                  <div className="relative">
                    <div className="aspect-[4/3] bg-gradient-to-br from-blue-400 to-purple-500"></div>
                    <ModernButton
                      variant="ghost"
                      size="icon"
                      className="absolute top-3 right-3 bg-white/90 hover:bg-white shadow-sm"
                    >
                      <Heart className="h-4 w-4" />
                    </ModernButton>
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Nổi bật
                    </div>
                  </div>

                  <ModernCardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                        Beautiful Homestay {i}
                      </h3>
                      <div className="flex items-center text-muted-foreground text-sm mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>Hội An, Quảng Nam</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium text-sm">4.9</span>
                        <span className="text-muted-foreground text-sm">(128)</span>
                      </div>
                      <div className="flex items-center text-muted-foreground text-sm">
                        <Users className="h-4 w-4 mr-1" />
                        <span>4 khách</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div>
                        <span className="text-xl font-bold text-foreground">
                          1,200,000₫
                        </span>
                        <span className="text-muted-foreground text-sm ml-1">/đêm</span>
                      </div>
                    </div>
                  </ModernCardContent>
                </ModernCard>
              ))}
            </ResponsiveGrid>
          </div>
        </ResponsiveContainer>

        {/* Accessibility Features */}
        <ResponsiveContainer>
          <ModernCard>
            <ModernCardHeader>
              <ModernCardTitle>Accessibility Features</ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">✅ Implemented Features:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Skip links for keyboard navigation</li>
                    <li>• Screen reader only text</li>
                    <li>• Focus management and trapping</li>
                    <li>• ARIA labels and descriptions</li>
                    <li>• High contrast mode support</li>
                    <li>• Reduced motion preferences</li>
                    <li>• WCAG AA color contrast ratios</li>
                    <li>• Semantic HTML structure</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">🎯 Color Contrast Ratios:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Primary: 8.59:1 (AAA ✓)</li>
                    <li>• Secondary: 10.73:1 (AAA ✓)</li>
                    <li>• Accent: 4.56:1 (AA ✓)</li>
                    <li>• Muted: 13.15:1 (AAA ✓)</li>
                  </ul>
                </div>
              </div>
            </ModernCardContent>
          </ModernCard>
        </ResponsiveContainer>

        <ScreenReaderOnly>
          End of design system demo content
        </ScreenReaderOnly>
      </main>
      
      <ModernFooter />
    </div>
  )
}
