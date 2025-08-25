"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Bed, Calendar, Users, LogOut, Settings, Hotel, Image, Tag, Zap, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { NavLink } from "@/components/ui/nav-link"
import { useAdminAuth } from "@/contexts/admin-auth-context"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/bookings", label: "Bookings", icon: Calendar },
  { href: "/admin/homestays", label: "Homestays", icon: Hotel },
  { href: "/admin/rooms", label: "Rooms", icon: Bed },
  { href: "/admin/hosts", label: "Hosts", icon: Users },
]

const settingsNavItems = [
  { href: "/admin/settings/hero", label: "Hero Images", icon: Image },
  { href: "/admin/settings/vouchers", label: "Vouchers", icon: Tag },
  { href: "/admin/settings/flash-promo", label: "Flash Promo", icon: Zap },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, logout } = useAdminAuth()
  const isSettingsActive = pathname?.startsWith("/admin/settings")
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Handle responsive collapse
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) setIsCollapsed(true)
      else setIsCollapsed(false)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  if (loading) {
    return null // Prevent rendering until auth state is resolved
  }

  return (
    <aside
      className={cn(
        "bg-gray-900 text-gray-200 flex flex-col border-r border-gray-800 min-h-screen transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        {!isCollapsed && (
          <Link href="/admin">
            <h2 className="text-2xl font-bold text-white hover:text-primary transition-colors">Admin Panel</h2>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-300 hover:bg-gray-800 hover:text-white"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-7 h-7" /> : <ChevronLeft className="w-7 h-7" />}
        </Button>
      </div>
      <div className={cn("p-4 border-b flex items-center gap-3", isCollapsed && "justify-center")}>
        {user?.avatar ? (
          <img src={user.avatar || "/default-avatar.png"} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white">
            {user?.name?.[0] || "A"}
          </div>
        )}
        {!isCollapsed && user && (
          <div>
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            <div className="relative group w-40">
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
              <span className="absolute left-0 bottom-full mb-1 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                {user.email}
              </span>
            </div>
          </div>
        )}
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map(item => {
          const isActive = pathname === item.href
          return (
            <NavLink
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-800",
                isActive ? "bg-primary text-white font-semibold" : "text-gray-300",
                isCollapsed && "justify-center"
              )}
            >
              <item.icon className="w-7 h-7" />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          )
        })}
        <Collapsible defaultOpen={isSettingsActive}>
          <CollapsibleTrigger
            className={cn(
              "flex items-center justify-between w-full gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors",
              isSettingsActive && "bg-gray-800 font-semibold text-white",
              isCollapsed && "justify-center"
            )}
          >
            <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
              <Settings className="w-7 h-7" />
              {!isCollapsed && <span>Settings</span>}
            </div>
            {!isCollapsed && (
              <ChevronDown className="w-7 h-7 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className={cn("pt-2 pl-6 space-y-2", isCollapsed && "pl-0")}>
            {settingsNavItems.map(item => {
              const isActive = pathname === item.href
              return (
                <NavLink
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors",
                    isActive ? "bg-primary text-white font-semibold" : "text-gray-300",
                    isCollapsed && "justify-center"
                  )}
                >
                  <item.icon className="w-7 h-7" />
                  {!isCollapsed && <span>{item.label}</span>}
                </NavLink>
              )
            })}
          </CollapsibleContent>
        </Collapsible>
      </nav>
      <div className={cn("p-4 border-t border-gray-800", isCollapsed && "flex justify-center")}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-gray-300 hover:bg-gray-800 hover:text-white",
            isCollapsed && "justify-center"
          )}
          onClick={() => {
            logout()
            router.push("/login-admin")
          }}
        >
          <LogOut className="w-7 h-7 mr-3" />
          {!isCollapsed && "Logout"}
        </Button>
      </div>
    </aside>
  )
}