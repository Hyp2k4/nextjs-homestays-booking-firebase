"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  Search, 
  Menu, 
  X, 
  User, 
  Heart, 
  MapPin, 
  Calendar,
  Users,
  Globe,
  ChevronDown,
  LogOut,
  Settings,
  BookOpen
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { LoginModal } from "@/components/auth/login-modal"
import { RegisterModal } from "@/components/auth/register-modal"
import { WishlistModal } from "@/components/travel/wishlist-modal"
import { useWishlist } from "@/hooks/use-wishlist"
import Image from "next/image"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navigationItems = [
  { href: "/", label: "Home", active: true },
  { href: "/homestays", label: "Homestays" },
  { href: "/rooms", label: "Rooms" },
  { href: "/experiences", label: "Experiences" },
  { href: "/about", label: "About" },
]

export function TravelHeader() {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showWishlistModal, setShowWishlistModal] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const { wishlistCount } = useWishlist()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSwitchToRegister = () => {
    setShowLoginModal(false)
    setShowRegisterModal(true)
  }

  const handleSwitchToLogin = () => {
    setShowRegisterModal(false)
    setShowLoginModal(true)
  }

  return (
    <>
      <header 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled 
            ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-neutral-200/50" 
            : "bg-white/90 backdrop-blur-sm"
        )}
      >
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <Image
                  src="/Logo.svg"
                  alt="TravelVN Logo"
                  width={50}
                  height={50}
                  className="transition-transform duration-200 group-hover:scale-105"
                />
              </div>
              <div className="hidden sm:block">

              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors duration-200 relative py-2",
                    item.active 
                      ? "text-primary-600" 
                      : "text-neutral-700 hover:text-primary-600"
                  )}
                >
                  {item.label}
                  {item.active && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-600 to-primary-500 rounded-full" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Search Bar - Desktop */}
            <div className="hidden xl:flex items-center flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search destinations, homestays..."
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Search Icon - Mobile/Tablet */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="xl:hidden p-2 text-neutral-600 hover:text-primary-600 transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden md:flex items-center space-x-1 p-2 text-neutral-600 hover:text-primary-600 transition-colors">
                    <Globe className="h-4 w-4" />
                    <span className="text-sm">EN</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>English</DropdownMenuItem>
                  <DropdownMenuItem>Tiếng Việt</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {isAuthenticated ? (
                <>
                  {/* Wishlist Button */}
                  <button
                    onClick={() => setShowWishlistModal(true)}
                    className="relative p-2 text-neutral-600 hover:text-primary-600 transition-colors"
                  >
                    <Heart className="h-5 w-5" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-secondary-500 rounded-full">
                        {wishlistCount}
                      </span>
                    )}
                  </button>

                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center space-x-2 p-2 rounded-full hover:bg-neutral-100 transition-colors">
                        {user?.avatar ? (
                          <Image
                            src={user.avatar}
                            alt={user.name}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                          </div>
                        )}
                        <ChevronDown className="h-3 w-3 text-neutral-600" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium">{user?.name}</p>
                          <p className="text-xs text-neutral-500">{user?.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/bookings" className="flex items-center">
                          <BookOpen className="mr-2 h-4 w-4" />
                          My Bookings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings" className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout} className="text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  {/* Auth Buttons */}
                  <div className="hidden md:flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowLoginModal(true)}
                      className="text-neutral-700 hover:text-primary-600"
                    >
                      Sign In
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setShowRegisterModal(true)}
                      className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white border-0"
                    >
                      Sign Up
                    </Button>
                  </div>

                  {/* Mobile Auth Button */}
                  <Button
                    size="sm"
                    className="md:hidden bg-gradient-to-r from-primary-600 to-primary-500 text-white border-0"
                    onClick={() => setShowLoginModal(true)}
                  >
                    Sign In
                  </Button>
                </>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 text-neutral-600 hover:text-primary-600 transition-colors"
              >
                {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {showSearch && (
            <div className="xl:hidden py-4 border-t border-neutral-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search destinations, homestays..."
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="lg:hidden py-4 border-t border-neutral-200 bg-white/95 backdrop-blur-md">
              <nav className="flex flex-col space-y-4">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors duration-200 py-2",
                      item.active 
                        ? "text-primary-600" 
                        : "text-neutral-700 hover:text-primary-600"
                    )}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    {item.label}
                  </Link>
                ))}

                {!isAuthenticated && (
                  <div className="flex space-x-3 pt-4 border-t border-neutral-200">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setShowLoginModal(true)
                        setShowMobileMenu(false)
                      }}
                    >
                      Sign In
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-primary-600 to-primary-500 text-white border-0"
                      onClick={() => {
                        setShowRegisterModal(true)
                        setShowMobileMenu(false)
                      }}
                    >
                      Sign Up
                    </Button>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Auth Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={handleSwitchToRegister}
      />
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={handleSwitchToLogin}
      />
      <WishlistModal
        isOpen={showWishlistModal}
        onClose={() => setShowWishlistModal(false)}
      />
    </>
  )
}
