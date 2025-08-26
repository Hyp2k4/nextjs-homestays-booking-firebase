"use client"

import { Button } from "@/components/ui/button"
import { 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Instagram, 
  Twitter,
  Youtube,
  Heart,
  ArrowRight,
  Send
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"

const footerSections = {
  company: {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
      { label: "Blog", href: "/blog" },
    ]
  },
  support: {
    title: "Support",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Contact Us", href: "/contact" },
      { label: "Safety", href: "/safety" },
      { label: "Cancellation", href: "/cancellation" },
    ]
  },
  hosting: {
    title: "Hosting",
    links: [
      { label: "Become a Host", href: "/become-host" },
      { label: "Host Resources", href: "/host-resources" },
      { label: "Community", href: "/community" },
      { label: "Host Guarantee", href: "/host-guarantee" },
    ]
  },
  destinations: {
    title: "Popular Destinations",
    links: [
      { label: "Ho Chi Minh City", href: "/destinations/ho-chi-minh" },
      { label: "Hanoi", href: "/destinations/hanoi" },
      { label: "Da Nang", href: "/destinations/da-nang" },
      { label: "Hoi An", href: "/destinations/hoi-an" },
    ]
  }
}

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook", color: "hover:text-blue-600" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram", color: "hover:text-pink-600" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter", color: "hover:text-blue-400" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube", color: "hover:text-red-600" },
]

export function TravelFooter() {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsSubscribed(true)
      setEmail("")
      setTimeout(() => setIsSubscribed(false), 3000)
    }
  }

  return (
    <footer className="bg-neutral-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-neutral-800">
        <div className="container mx-auto px-4 lg:px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl lg:text-4xl font-bold mb-4">
              Stay Updated with{" "}
              <span className="bg-gradient-to-r from-primary-400 to-primary-500 bg-clip-text text-transparent">
                Travel Deals
              </span>
            </h3>
            <p className="text-neutral-400 text-lg mb-8 max-w-2xl mx-auto">
              Get exclusive offers, travel tips, and discover new destinations delivered to your inbox
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <div className="flex-1 relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white border-0 px-8"
                disabled={isSubscribed}
              >
                {isSubscribed ? (
                  <>
                    <Heart className="h-5 w-5 mr-2 fill-current" />
                    Subscribed!
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Subscribe
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 lg:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="/Logo.svg"
                alt="TravelVN Logo"
                width={52}
                height={52}
                className="brightness-0 invert"
              />
            </Link>
            
            <p className="text-neutral-400 leading-relaxed max-w-sm">
              Discover unique homestays and create unforgettable memories across Vietnam's most beautiful destinations.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-neutral-400">
                <MapPin className="h-5 w-5 text-primary-500 flex-shrink-0" />
                <span className="text-sm">123 Travel Street, District 1, Ho Chi Minh City</span>
              </div>
              <div className="flex items-center space-x-3 text-neutral-400">
                <Phone className="h-5 w-5 text-primary-500 flex-shrink-0" />
                <span className="text-sm">+84 123 456 789</span>
              </div>
              <div className="flex items-center space-x-3 text-neutral-400">
                <Mail className="h-5 w-5 text-primary-500 flex-shrink-0" />
                <span className="text-sm">hiephoang1752004@gmail.com</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <Link
                    key={social.label}
                    href={social.href}
                    className={cn(
                      "w-10 h-10 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-all duration-200 hover:scale-110",
                      social.color
                    )}
                    aria-label={social.label}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key} className="space-y-4">
              <h4 className="text-lg font-semibold text-white">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-neutral-400 hover:text-primary-400 transition-colors duration-200 text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-800">
        <div className="container mx-auto px-4 lg:px-6 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-neutral-400 text-sm">
              <span>© 2024 TravelVN. All rights reserved.</span>
              <div className="flex space-x-4">
                <Link href="/privacy" className="hover:text-primary-400 transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-primary-400 transition-colors">
                  Terms of Service
                </Link>
                <Link href="/cookies" className="hover:text-primary-400 transition-colors">
                  Cookie Policy
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-neutral-400 text-sm">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500 animate-pulse" />
              <span>in Vietnam</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
