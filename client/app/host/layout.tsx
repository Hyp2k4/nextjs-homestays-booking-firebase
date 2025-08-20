"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, PlusSquare, List, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"

export default function HostLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { logout } = useAuth()

  const navItems = [
    { href: "/host", label: "Dashboard", icon: LayoutDashboard },
    { href: "/host/add-room", label: "Add Room", icon: PlusSquare },
    { href: "/host/list-room", label: "List Rooms", icon: List },
    { href: "/host/settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-white border-r">
        <div className="flex items-center justify-center h-16 border-b">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/Logo.svg" alt="Logo" width={80} height={80} />
          </Link>
        </div>
        <div className="flex flex-col flex-grow p-4 overflow-auto">
          <nav className="flex-1 space-y-2">
            {navItems.map(item => (
              <Button
                key={item.href}
                asChild
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={`w-full justify-start gap-2 ${pathname === item.href ? "bg-gray-100 font-bold" : ""}`}
              >
                <Link href={item.href}>
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            ))}
          </nav>
          <div className="mt-auto">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-red-500 hover:text-red-700"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
