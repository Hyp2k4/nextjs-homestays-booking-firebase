"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface NavLinkProps {
  href: string
  children: ReactNode
}

export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:bg-gray-100",
        isActive && "bg-primary text-primary-foreground hover:bg-primary/90"
      )}
    >
      {children}
    </Link>
  )
}
