"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Bed, Calendar, Users, LogOut, Settings, Hotel, Image, Tag, Zap, ChevronDown } from "lucide-react"
import { NavLink } from "@/components/ui/nav-link"
import { useAdminAuth } from "@/contexts/admin-auth-context"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

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
  const { logout } = useAdminAuth()
  const pathname = usePathname()
  const isSettingsActive = pathname ? pathname.startsWith("/admin/settings") : false

  return (
    <aside className="w-64 bg-card border-r flex flex-col">
      <div className="p-4 border-b">
        <Link href="/admin">
          <h2 className="text-2xl font-bold text-primary">Admin Panel</h2>
        </Link>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => (
          <NavLink key={item.href} href={item.href}>
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
        <Collapsible defaultOpen={isSettingsActive}>
          <CollapsibleTrigger className={cn("flex items-center justify-between w-full gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:bg-gray-100", isSettingsActive && "bg-gray-100")}>
            <div className="flex items-center gap-3">
                <Settings className="w-5 h-5" />
                <span>Settings</span>
            </div>
            <ChevronDown className="h-4 w-4 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-1 pl-4 space-y-1">
            {settingsNavItems.map((item) => (
              <NavLink key={item.href} href={item.href}>
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </nav>
      <div className="p-2 border-t">
        <Button variant="ghost" className="w-full justify-start" onClick={logout}>
          <LogOut className="w-5 h-5 mr-3" />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  )
}
