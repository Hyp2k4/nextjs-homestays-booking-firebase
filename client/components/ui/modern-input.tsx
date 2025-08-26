"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Search, MapPin, Calendar, Users } from "lucide-react"

export interface ModernInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: "search" | "location" | "calendar" | "users" | React.ReactNode
  variant?: "default" | "search" | "luxury"
}

const ModernInput = React.forwardRef<HTMLInputElement, ModernInputProps>(
  ({ className, type, icon, variant = "default", ...props }, ref) => {
    const IconComponent = {
      search: Search,
      location: MapPin,
      calendar: Calendar,
      users: Users,
    }

    const variants = {
      default: "border-border bg-input focus:border-primary",
      search: "border-border bg-white shadow-lg focus:border-primary focus:shadow-xl",
      luxury: "border-slate-300 bg-white shadow-sm focus:border-primary focus:shadow-lg"
    }

    const renderIcon = () => {
      if (!icon) return null
      
      if (typeof icon === "string" && IconComponent[icon as keyof typeof IconComponent]) {
        const Icon = IconComponent[icon as keyof typeof IconComponent]
        return <Icon className="h-4 w-4 text-muted-foreground" />
      }
      
      return icon
    }

    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
            {renderIcon()}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-12 w-full rounded-xl border px-4 py-3 text-sm transition-all duration-200",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            icon ? "pl-10" : "",
            variants[variant],
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
ModernInput.displayName = "ModernInput"

// Search Input Component
export interface SearchInputProps extends Omit<ModernInputProps, "icon" | "variant"> {
  onSearch?: (value: string) => void
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onSearch, ...props }, ref) => {
    const [value, setValue] = React.useState("")

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      onSearch?.(value)
    }

    return (
      <form onSubmit={handleSubmit} className="relative">
        <ModernInput
          ref={ref}
          icon="search"
          variant="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={cn("pr-12", className)}
          {...props}
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center"
        >
          <Search className="h-4 w-4" />
        </button>
      </form>
    )
  }
)
SearchInput.displayName = "SearchInput"

export { ModernInput, SearchInput }
