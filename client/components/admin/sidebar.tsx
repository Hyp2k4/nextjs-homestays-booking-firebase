"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Bed, Calendar, Users, LogOut } from "lucide-react"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/homestays", label: "Homestays", icon: Bed },
  { href: "/admin/bookings", label: "Bookings", icon: Calendar },
  { href: "/admin/hosts", label: "Hosts", icon: Users },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6 text-2xl font-bold">Admin</div>
      <nav className="flex-1 px-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-4 py-2 mt-2 text-gray-300 rounded-lg hover:bg-gray-700 ${
              pathname === item.href ? "bg-gray-700" : ""
            }`}
          >
            <item.icon className="w-6 h-6" />
            <span className="ml-3">{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4">
        <button className="flex items-center w-full px-4 py-2 text-gray-300 rounded-lg hover:bg-gray-700">
          <LogOut className="w-6 h-6" />
          <span className="ml-3">Logout</span>
        </button>
      </div>
    </aside>
  )
}
