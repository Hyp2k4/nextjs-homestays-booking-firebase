"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Users,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  ChevronDown,
  Building2,
  TrendingUp,
  MessageSquare,
  Star,
  Bed,
  UserCheck,
  Shield,
  Palette,
  Globe,
  Mail,
  Database,
  CreditCard,
  Gift,
  Bell as BellIcon,
  Home
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/lib/i18n"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NotificationBell } from "@/components/admin/notification-bell"
import { useAppearanceSettings, GlobalSettingsService } from "@/lib/global-settings-service"

interface ModernDashboardLayoutProps {
  children: React.ReactNode
  title?: string
}

// We'll make this dynamic based on translations
const getSidebarItems = (t: (key: string) => string) => [
  {
    title: t('admin.dashboard.title') || "Dashboard",
    href: "/admin",
    icon: BarChart3,
    color: "text-blue-600",
    exact: true
  },
  {
    title: t('admin.analytics.title') || "Analytics",
    href: "/admin/analytics",
    icon: TrendingUp,
    color: "text-green-600"
  },
  {
    title: t('admin.bookings.title') || "Bookings",
    href: "/admin/bookings",
    icon: Calendar,
    color: "text-purple-600"
  },
  {
    title: t('admin.users.title') || "Users",
    href: "/admin/users",
    icon: Users,
    color: "text-orange-600"
  },
  {
    title: "Hosts",
    href: "/admin/hosts",
    icon: UserCheck,
    color: "text-teal-600"
  },
  {
    title: "Homestays",
    href: "/admin/homestays",
    icon: Building2,
    color: "text-indigo-600"
  },
  {
    title: "Rooms",
    href: "/admin/rooms",
    icon: Bed,
    color: "text-pink-600"
  },
  {
    title: "Reviews",
    href: "/admin/reviews",
    icon: Star,
    color: "text-yellow-600"
  }
]

const getSettingsItems = (t: (key: string) => string) => [
  {
    title: "Hero Banner",
    href: "/admin/settings/hero",
    icon: Home,
    color: "text-blue-600"
  },
  {
    title: t('admin.settings.notifications.title') || "Notifications",
    href: "/admin/settings/notifications",
    icon: BellIcon,
    color: "text-green-600"
  },
  {
    title: t('admin.settings.security.title') || "Security",
    href: "/admin/settings/security",
    icon: Shield,
    color: "text-red-600"
  },
  {
    title: "Payments",
    href: "/admin/settings/payments",
    icon: CreditCard,
    color: "text-purple-600"
  },
  {
    title: "Email Templates",
    href: "/admin/settings/emails",
    icon: Mail,
    color: "text-orange-600"
  },
  {
    title: "Database",
    href: "/admin/settings/database",
    icon: Database,
    color: "text-gray-600"
  },
  {
    title: t('admin.settings.appearance.title') || "Appearance",
    href: "/admin/settings/appearance",
    icon: Palette,
    color: "text-pink-600"
  },
  {
    title: t('admin.settings.localization.title') || "Localization",
    href: "/admin/settings/localization",
    icon: Globe,
    color: "text-teal-600"
  },
  {
    title: "Vouchers",
    href: "/admin/settings/vouchers",
    icon: Gift,
    color: "text-indigo-600"
  }
]

export function ModernDashboardLayout({ children, title }: ModernDashboardLayoutProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { t } = useLanguage()

  const siteName = GlobalSettingsService.getSiteName()
  const logoUrl = GlobalSettingsService.getLogoUrl()
  const primaryColor = GlobalSettingsService.getPrimaryColor()

  const sidebarItems = getSidebarItems(t)
  const settingsItems = getSettingsItems(t)

  const handleLogout = async () => {
    await logout()
    router.push("/auth/admin-login")
  }

  const isActive = (href: string, exact = false) => {
    if (exact) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-neutral-200">
            <Link href="/admin" className="flex items-center space-x-3">
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
              <div>
                <span className="text-lg font-bold text-neutral-900">{siteName}</span>
                <span className="block text-xs text-neutral-500">{t('header.adminPanel')}</span>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {/* Main Navigation */}
            <div className="space-y-1">
              <p className="px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                {t('common.main') || 'Main'}
              </p>
              {sidebarItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive(item.href, item.exact)
                      ? "bg-primary-50 text-primary-700 border-r-2 border-primary-600"
                      : "text-neutral-700 hover:bg-neutral-100"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 mr-3", item.color)} />
                  {item.title}
                </Link>
              ))}
            </div>

            {/* Settings Navigation */}
            <div className="pt-6 space-y-1">
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider hover:text-neutral-700"
              >
                {t('admin.settings.title') || 'Settings'}
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  settingsOpen ? "rotate-180" : ""
                )} />
              </button>
              
              {settingsOpen && (
                <div className="space-y-1 pl-3">
                  {settingsItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                        isActive(item.href)
                          ? "bg-primary-50 text-primary-700"
                          : "text-neutral-600 hover:bg-neutral-100"
                      )}
                    >
                      <item.icon className={cn("h-4 w-4 mr-3", item.color)} />
                      {item.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* User Menu */}
          <div className="p-4 border-t border-neutral-200">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center w-full p-3 rounded-lg hover:bg-neutral-100 transition-colors">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                      <span className="text-white font-semibold text-xs">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="ml-3 text-left flex-1">
                    <p className="text-sm font-medium text-neutral-900">{user?.name}</p>
                    <p className="text-xs text-neutral-500">Administrator</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-neutral-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile">Profile Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings">System Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-neutral-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              {title && (
                <div>
                  <h1 className="text-xl font-semibold text-neutral-900">{title}</h1>
                  <p className="text-sm text-neutral-500">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder={t('common.search') || 'Search...'}
                  className="pl-10 pr-4 py-2 w-64 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Language Switcher */}
              <LanguageSwitcher variant="compact" />

              {/* Notifications */}
              <NotificationBell />

              {/* Quick Actions */}
              <Button size="sm" style={{ backgroundColor: primaryColor }}>
                {t('admin.dashboard.quickActions') || 'Quick Action'}
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
