"use client"

import { cn } from "@/lib/utils"

interface BeautifulLoaderProps {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "default" | "dots" | "pulse" | "spin" | "bounce"
  text?: string
  className?: string
}

export function BeautifulLoader({ 
  size = "md", 
  variant = "default", 
  text,
  className 
}: BeautifulLoaderProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  }

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base", 
    xl: "text-lg"
  }

  if (variant === "dots") {
    return (
      <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "bg-primary-600 rounded-full animate-bounce",
                sizeClasses[size]
              )}
              style={{
                animationDelay: `${i * 0.1}s`,
                animationDuration: "0.6s"
              }}
            />
          ))}
        </div>
        {text && (
          <p className={cn("text-neutral-600 font-medium", textSizeClasses[size])}>
            {text}
          </p>
        )}
      </div>
    )
  }

  if (variant === "pulse") {
    return (
      <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
        <div className={cn(
          "bg-gradient-to-r from-primary-400 to-primary-600 rounded-full animate-pulse",
          sizeClasses[size]
        )} />
        {text && (
          <p className={cn("text-neutral-600 font-medium animate-pulse", textSizeClasses[size])}>
            {text}
          </p>
        )}
      </div>
    )
  }

  if (variant === "bounce") {
    return (
      <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
        <div className={cn(
          "bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full animate-bounce",
          sizeClasses[size]
        )} />
        {text && (
          <p className={cn("text-neutral-600 font-medium", textSizeClasses[size])}>
            {text}
          </p>
        )}
      </div>
    )
  }

  if (variant === "spin") {
    return (
      <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
        <div className={cn(
          "border-4 border-neutral-200 border-t-primary-600 rounded-full animate-spin",
          sizeClasses[size]
        )} />
        {text && (
          <p className={cn("text-neutral-600 font-medium", textSizeClasses[size])}>
            {text}
          </p>
        )}
      </div>
    )
  }

  // Default variant - sophisticated gradient spinner
  return (
    <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
      <div className="relative">
        <div className={cn(
          "border-4 border-neutral-200 rounded-full",
          sizeClasses[size]
        )} />
        <div className={cn(
          "absolute inset-0 border-4 border-transparent border-t-primary-600 border-r-primary-500 rounded-full animate-spin",
          sizeClasses[size]
        )} />
        <div className={cn(
          "absolute inset-1 border-2 border-transparent border-t-secondary-500 rounded-full animate-spin",
          sizeClasses[size]
        )}
        style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
        />
      </div>
      {text && (
        <p className={cn("text-neutral-600 font-medium", textSizeClasses[size])}>
          {text}
        </p>
      )}
    </div>
  )
}

// Full page loader
export function FullPageLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <BeautifulLoader variant="default" size="xl" text={text} />
    </div>
  )
}

// Card loader for content areas
export function CardLoader({ className }: { className?: string }) {
  return (
    <div className={cn("bg-white rounded-2xl p-8 shadow-sm border border-neutral-100", className)}>
      <BeautifulLoader variant="dots" size="lg" text="Loading content..." />
    </div>
  )
}

// Skeleton loader for lists
export function SkeletonLoader({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 animate-pulse">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-neutral-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-neutral-200 rounded w-3/4" />
              <div className="h-3 bg-neutral-200 rounded w-1/2" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-3 bg-neutral-200 rounded w-full" />
            <div className="h-3 bg-neutral-200 rounded w-5/6" />
            <div className="h-3 bg-neutral-200 rounded w-4/6" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Table skeleton loader
export function TableSkeletonLoader({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
      <div className="p-6 border-b border-neutral-200">
        <div className="h-6 bg-neutral-200 rounded w-1/4 animate-pulse" />
      </div>
      <div className="divide-y divide-neutral-200">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="p-6 flex items-center space-x-6 animate-pulse">
            {[...Array(cols)].map((_, j) => (
              <div key={j} className="flex-1">
                <div className="h-4 bg-neutral-200 rounded w-full" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
