"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserNotificationBell } from "@/components/ui/user-notification-bell"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { useAuth } from "@/contexts/auth-context"
import { useAppearanceSettings, GlobalSettingsService } from "@/lib/global-settings-service"
import { useLanguage } from "@/lib/i18n"
import {
  Menu,
  X,
  Home,
  Building2,
  User,
  LogOut,
  Settings,
  Heart,
  Calendar,
  MessageSquare,
  Gift,
  ChevronDown
} from "lucide-react"
import { cn } from "@/lib/utils"

export function UserHeader() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { t } = useLanguage()

  const siteName = GlobalSettingsService.getSiteName()
  const logoUrl = GlobalSettingsService.getLogoUrl()
  const primaryColor = GlobalSettingsService.getPrimaryColor()

  const navigation = [
    { name: t('navigation.home'), href: "/", icon: Home },
    { name: t('navigation.homestays'), href: "/homestays", icon: Building2 },
    { name: t('navigation.about'), href: "/about", icon: User },
    { name: t('navigation.contact'), href: "/contact", icon: MessageSquare },
  ]

  const userNavigation = user ? [
    { name: t('navigation.profile'), href: "/profile", icon: User },
    { name: t('navigation.bookings'), href: "/profile/bookings", icon: Calendar },
    { name: t('navigation.vouchers'), href: "/profile/vouchers", icon: Gift },
    { name: t('navigation.wishlist'), href: "/profile/wishlist", icon: Heart },
    { name: t('navigation.messages'), href: "/messages", icon: MessageSquare },
    { name: t('navigation.settings'), href: "/profile/settings", icon: Settings },
  ] : []

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Site Name */}
          <Link href="/" className="flex items-center space-x-3">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={siteName}
                className="h-8 w-auto object-contain"
              />
            ) : (
              <div 
                className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: primaryColor }}
              >
                {siteName.charAt(0)}
              </div>
            )}
            <span className="text-xl font-bold text-neutral-900">{siteName}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary-600",
                  pathname === item.href 
                    ? "text-primary-600" 
                    : "text-neutral-700"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Side - Auth & User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Notifications */}
                <UserNotificationBell />

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 h-auto p-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-primary-600 text-white">
                          {user.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:block text-sm font-medium">{user.name}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-neutral-500">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {userNavigation.map((item) => (
                      <DropdownMenuItem key={item.name} asChild>
                        <Link href={item.href} className="flex items-center space-x-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="h-4 w-4 mr-2" />
                      {t('navigation.signOut')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">{t('navigation.signIn')}</Link>
                </Button>
                <Button asChild style={{ backgroundColor: primaryColor }}>
                  <Link href="/auth/register">{t('navigation.signUp')}</Link>
                </Button>
              </div>
            )}

            {/* Language Switcher */}
            <LanguageSwitcher variant="compact" />

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-primary-50 text-primary-600"
                      : "text-neutral-700 hover:bg-neutral-50"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
              
              {!user && (
                <div className="pt-4 space-y-2">
                  <Button variant="ghost" asChild className="w-full justify-start">
                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                      {t('navigation.signIn')}
                    </Link>
                  </Button>
                  <Button asChild className="w-full" style={{ backgroundColor: primaryColor }}>
                    <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                      {t('navigation.signUp')}
                    </Link>
                  </Button>
                </div>
              )}

              {/* Mobile Language Switcher */}
              <div className="pt-4 border-t">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
