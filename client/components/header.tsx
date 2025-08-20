"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { LoginModal } from "@/components/auth/login-modal"
import { RegisterModal } from "@/components/auth/register-modal"
import { UserMenu } from "@/components/auth/user-menu"
import { HomestayRegistrationModal } from "@/components/homestay-registration-modal"
import Image from "next/image"
import { useRouter } from "next/navigation"

export function Header() {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  const handleSwitchToRegister = () => {
    setShowLoginModal(false)
    setShowRegisterModal(true)
  }

  const handleSwitchToLogin = () => {
    setShowRegisterModal(false)
    setShowLoginModal(true)
  }

  const isHost = user?.role === "host"

  return (
    <>
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/Logo.svg"
                alt="Logo"
                width={80}
                height={80}
                className=""
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Home
              </Link>

              <Link
                href="/rooms"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Rooms
              </Link>
              <Link
                href="/homestays"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Homestays
              </Link>

              {isAuthenticated && (
                isHost ? (
                  <Link
                    href="/host"
                    className="text-sm font-medium text-foreground  transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Dashboard
                  </Link>
                ) : (
                  <HomestayRegistrationModal>
                    <Button
                      variant="ghost"
                      className="text-sm font-medium text-foreground   text-left"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      List Your Homestay
                    </Button>
                  </HomestayRegistrationModal>
                )
              )}
            </nav>

            {/* Auth Section */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <UserMenu />
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden md:flex text-sm font-medium"
                    onClick={() => setShowLoginModal(true)}
                  >
                    Đăng nhập
                  </Button>
                  <Button
                    size="sm"
                    className="text-sm font-medium"
                    onClick={() => setShowRegisterModal(true)}
                  >
                    Đăng ký
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden py-4 border-t border-border">
              <nav className="flex flex-col space-y-3">
                <Link
                  href="/"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Home
                </Link>

                <Link
                  href="/homestays"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Homestays
                </Link>

                <Link
                  href="/rooms"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Rooms
                </Link>

                {isAuthenticated && (
                  isHost ? (
                    <Link
                      href="/host"
                      className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <Button
                      variant="ghost"
                      className="text-sm font-medium text-foreground hover:text-primary"
                      onClick={() => {
                        router.push("/homestay-registration-modal")
                        setShowMobileMenu(false)
                      }}
                    >
                      List Your Homestay
                    </Button>
                  )
                )}

                {!isAuthenticated && (
                  <div className="flex space-x-3 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-sm font-medium"
                      onClick={() => {
                        setShowLoginModal(true)
                        setShowMobileMenu(false)
                      }}
                    >
                      Đăng nhập
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 text-sm font-medium"
                      onClick={() => {
                        setShowRegisterModal(true)
                        setShowMobileMenu(false)
                      }}
                    >
                      Đăng ký
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
    </>
  )
}