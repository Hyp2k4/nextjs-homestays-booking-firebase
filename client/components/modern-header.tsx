"use client"

import { useState, useEffect } from "react"
import { ModernButton } from "@/components/ui/modern-button"
import { Menu, Heart, User, LogOut, Settings, BookOpen, Home, Building2, MapPin } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { LoginModal } from "@/components/auth/login-modal"
import { RegisterModal } from "@/components/auth/register-modal"
import { HomestayRegistrationModal } from "@/components/homestay-registration-modal"
import { WishlistModal } from "@/components/wishlist-modal"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ModernHeader() {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showWishlistModal, setShowWishlistModal] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()

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

  const isHost = user?.role === "host"

  const navigationItems = [
    { href: "/", label: "Trang chủ", icon: Home },
    { href: "/homestays", label: "Homestays", icon: Building2 },
    { href: "/rooms", label: "Phòng", icon: MapPin },
  ]

  return (
    <>
      <header 
        className={cn(
          "sticky top-[var(--promo-badge-height)] z-50 transition-all duration-300",
          isScrolled 
            ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-border/50" 
            : "bg-white border-b border-border"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <Image
                  src="/Logo.svg"
                  alt="Logo"
                  width={48}
                  height={48}
                  className="transition-transform duration-200 group-hover:scale-105"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  StayVN
                </h1>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}

              {isAuthenticated && (
                isHost ? (
                  <Link
                    href="/host"
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                ) : (
                  <HomestayRegistrationModal>
                    <ModernButton
                      variant="ghost"
                      className="text-sm font-medium"
                    >
                      <Building2 className="h-4 w-4" />
                      Đăng ký Host
                    </ModernButton>
                  </HomestayRegistrationModal>
                )
              )}
            </nav>

            {/* Auth Section */}
            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                <>
                  {/* Wishlist Button */}
                  <div className="relative">
                    <ModernButton
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowWishlistModal(true)}
                      className="relative"
                    >
                      <Heart className="h-5 w-5" />
                      {user?.roomWishlist?.length > 0 && (
                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform bg-red-500 rounded-full">
                          {user.roomWishlist.length}
                        </span>
                      )}
                    </ModernButton>
                  </div>

                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <ModernButton variant="ghost" size="icon" className="relative">
                        {user?.avatar ? (
                          <Image
                            src={user.avatar}
                            alt={user.name}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                        ) : (
                          <User className="h-5 w-5" />
                        )}
                      </ModernButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium">{user?.name}</p>
                          <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          Hồ sơ
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/bookings" className="flex items-center">
                          <BookOpen className="mr-2 h-4 w-4" />
                          Đặt phòng của tôi
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout} className="text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        Đăng xuất
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  {/* Desktop Auth Buttons */}
                  <div className="hidden md:flex items-center space-x-3">
                    <ModernButton
                      variant="outline"
                      size="sm"
                      onClick={() => setShowLoginModal(true)}
                    >
                      Đăng nhập
                    </ModernButton>
                    <ModernButton
                      variant="gradient"
                      size="sm"
                      onClick={() => setShowRegisterModal(true)}
                    >
                      Đăng ký
                    </ModernButton>
                  </div>

                  {/* Mobile Auth Button */}
                  <ModernButton
                    variant="gradient"
                    size="sm"
                    className="md:hidden"
                    onClick={() => setShowLoginModal(true)}
                  >
                    Đăng nhập
                  </ModernButton>
                </>
              )}

              {/* Mobile Menu Toggle */}
              <ModernButton
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <Menu className="h-5 w-5" />
              </ModernButton>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="lg:hidden py-4 border-t border-border bg-white/95 backdrop-blur-sm">
              <nav className="flex flex-col space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}

                {isAuthenticated && !isHost && (
                  <HomestayRegistrationModal>
                    <ModernButton
                      variant="ghost"
                      className="justify-start text-sm font-medium"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <Building2 className="h-4 w-4 mr-3" />
                      Đăng ký Host
                    </ModernButton>
                  </HomestayRegistrationModal>
                )}

                {!isAuthenticated && (
                  <div className="flex space-x-3 pt-3 px-4">
                    <ModernButton
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setShowLoginModal(true)
                        setShowMobileMenu(false)
                      }}
                    >
                      Đăng nhập
                    </ModernButton>
                    <ModernButton
                      variant="gradient"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setShowRegisterModal(true)
                        setShowMobileMenu(false)
                      }}
                    >
                      Đăng ký
                    </ModernButton>
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
