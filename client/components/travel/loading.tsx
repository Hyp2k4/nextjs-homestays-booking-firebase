"use client"

import { cn } from "@/lib/utils"
import { Loader2, Heart, Star } from "lucide-react"

// Skeleton Base Component
interface SkeletonProps {
  className?: string
  children?: React.ReactNode
}

export function Skeleton({ className, children, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 bg-[length:200%_100%]",
        className
      )}
      style={{
        animation: "shimmer 2s infinite linear"
      }}
      {...props}
    >
      {children}
    </div>
  )
}

// Property Card Skeleton
export function PropertyCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-white rounded-2xl overflow-hidden shadow-sm", className)}>
      {/* Image Skeleton */}
      <Skeleton className="aspect-[4/3] w-full" />
      
      {/* Content Skeleton */}
      <div className="p-6 space-y-4">
        {/* Location */}
        <Skeleton className="h-4 w-32" />
        
        {/* Title */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
        </div>
        
        {/* Rating & Capacity */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        
        {/* Amenities */}
        <div className="flex space-x-4">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-4 rounded" />
        </div>
      </div>
    </div>
  )
}

// Room Card Skeleton
export function RoomCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-white rounded-2xl overflow-hidden shadow-sm", className)}>
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="p-6 space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-full" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex space-x-4">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-4 rounded" />
        </div>
      </div>
    </div>
  )
}

// Review Card Skeleton
export function ReviewCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-white rounded-2xl p-6 shadow-sm", className)}>
      <Skeleton className="h-8 w-8 rounded mb-4" />
      <div className="space-y-3 mb-6">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="flex space-x-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-4 w-4 rounded" />
        ))}
      </div>
      <div className="flex items-center space-x-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  )
}

// Grid Skeleton
interface GridSkeletonProps {
  count?: number
  columns?: number
  CardSkeleton: React.ComponentType<{ className?: string }>
  className?: string
}

export function GridSkeleton({ 
  count = 6, 
  columns = 3, 
  CardSkeleton, 
  className 
}: GridSkeletonProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }

  return (
    <div className={cn(
      "grid gap-6",
      gridCols[columns as keyof typeof gridCols] || "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      className
    )}>
      {[...Array(count)].map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

// Spinner Component
interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  color?: "primary" | "secondary" | "white"
}

export function Spinner({ size = "md", className, color = "primary" }: SpinnerProps) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  }

  const colors = {
    primary: "text-primary-600",
    secondary: "text-secondary-500",
    white: "text-white"
  }

  return (
    <Loader2 className={cn(
      "animate-spin",
      sizes[size],
      colors[color],
      className
    )} />
  )
}

// Loading Button
interface LoadingButtonProps {
  loading?: boolean
  children: React.ReactNode
  className?: string
  disabled?: boolean
  onClick?: () => void
}

export function LoadingButton({ 
  loading = false, 
  children, 
  className, 
  disabled,
  onClick,
  ...props 
}: LoadingButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition-all duration-200",
        "bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white",
        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <Spinner size="sm" color="white" />}
      {children}
    </button>
  )
}

// Progress Bar
interface ProgressBarProps {
  progress: number // 0-100
  className?: string
  showLabel?: boolean
  color?: "primary" | "secondary" | "success"
}

export function ProgressBar({ 
  progress, 
  className, 
  showLabel = false,
  color = "primary" 
}: ProgressBarProps) {
  const colors = {
    primary: "bg-primary-600",
    secondary: "bg-secondary-500", 
    success: "bg-green-500"
  }

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between text-sm text-neutral-600 mb-2">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
      )}
      <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
        <div 
          className={cn(
            "h-full transition-all duration-500 ease-out rounded-full",
            colors[color]
          )}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  )
}

// Page Loading Overlay
interface PageLoadingProps {
  message?: string
  className?: string
}

export function PageLoading({ message = "Loading...", className }: PageLoadingProps) {
  return (
    <div className={cn(
      "fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center",
      className
    )}>
      <div className="text-center space-y-4">
        <div className="relative">
          <Spinner size="xl" />
          <div className="absolute inset-0 animate-ping">
            <Spinner size="xl" className="opacity-20" />
          </div>
        </div>
        <p className="text-neutral-600 font-medium">{message}</p>
      </div>
    </div>
  )
}

// Search Loading
export function SearchLoading({ className }: { className?: string }) {
  return (
    <div className={cn("text-center py-12", className)}>
      <div className="relative inline-block">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <Heart className="absolute inset-0 m-auto h-6 w-6 text-primary-600 animate-pulse" />
      </div>
      <p className="mt-4 text-neutral-600 font-medium">Searching for perfect stays...</p>
    </div>
  )
}

// Wishlist Loading
export function WishlistLoading({ className }: { className?: string }) {
  return (
    <div className={cn("text-center py-8", className)}>
      <div className="relative inline-block">
        <Heart className="h-8 w-8 text-red-500 animate-pulse" />
      </div>
      <p className="mt-2 text-neutral-600 text-sm">Updating wishlist...</p>
    </div>
  )
}

// CSS for shimmer animation
const shimmerCSS = `
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
`

// Inject CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = shimmerCSS
  document.head.appendChild(style)
}
