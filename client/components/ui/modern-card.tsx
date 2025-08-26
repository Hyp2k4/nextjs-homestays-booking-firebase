"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const ModernCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "elevated" | "luxury" | "glass"
    hover?: boolean
  }
>(({ className, variant = "default", hover = true, ...props }, ref) => {
  const variants = {
    default: "bg-card text-card-foreground shadow-sm border border-border",
    elevated: "bg-card text-card-foreground shadow-lg border-0",
    luxury: "bg-gradient-to-br from-white to-slate-50 shadow-xl border border-slate-200/50",
    glass: "bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg"
  }
  
  const hoverEffect = hover ? "hover:shadow-xl hover:-translate-y-1 transition-all duration-300" : ""
  
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl",
        variants[variant],
        hoverEffect,
        className
      )}
      {...props}
    />
  )
})
ModernCard.displayName = "ModernCard"

const ModernCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
ModernCardHeader.displayName = "ModernCardHeader"

const ModernCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight text-lg", className)}
    {...props}
  />
))
ModernCardTitle.displayName = "ModernCardTitle"

const ModernCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground leading-relaxed", className)}
    {...props}
  />
))
ModernCardDescription.displayName = "ModernCardDescription"

const ModernCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
ModernCardContent.displayName = "ModernCardContent"

const ModernCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
ModernCardFooter.displayName = "ModernCardFooter"

export {
  ModernCard,
  ModernCardHeader,
  ModernCardFooter,
  ModernCardTitle,
  ModernCardDescription,
  ModernCardContent,
}
