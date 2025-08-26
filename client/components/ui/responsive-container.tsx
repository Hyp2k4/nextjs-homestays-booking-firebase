"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ResponsiveContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "wide" | "narrow" | "full"
  spacing?: "none" | "sm" | "md" | "lg" | "xl"
}

const ResponsiveContainer = React.forwardRef<HTMLDivElement, ResponsiveContainerProps>(
  ({ className, variant = "default", spacing = "md", children, ...props }, ref) => {
    const variants = {
      default: "max-w-7xl mx-auto",
      wide: "max-w-[1600px] mx-auto",
      narrow: "max-w-4xl mx-auto",
      full: "w-full",
    }

    const spacings = {
      none: "",
      sm: "px-4 sm:px-6",
      md: "px-4 sm:px-6 lg:px-8",
      lg: "px-4 sm:px-6 lg:px-8 xl:px-12",
      xl: "px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16",
    }

    return (
      <div
        ref={ref}
        className={cn(
          variants[variant],
          spacings[spacing],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ResponsiveContainer.displayName = "ResponsiveContainer"

// Grid System Component
interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    "2xl"?: number
  }
  gap?: "none" | "sm" | "md" | "lg" | "xl"
}

const ResponsiveGrid = React.forwardRef<HTMLDivElement, ResponsiveGridProps>(
  ({ className, cols = { xs: 1, sm: 2, lg: 3 }, gap = "md", children, ...props }, ref) => {
    const gapClasses = {
      none: "gap-0",
      sm: "gap-3",
      md: "gap-6",
      lg: "gap-8",
      xl: "gap-12",
    }

    const gridCols = {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      5: "grid-cols-5",
      6: "grid-cols-6",
    }

    const buildGridClasses = () => {
      const classes = ["grid"]
      
      if (cols.xs) classes.push(gridCols[cols.xs as keyof typeof gridCols])
      if (cols.sm) classes.push(`sm:${gridCols[cols.sm as keyof typeof gridCols]}`)
      if (cols.md) classes.push(`md:${gridCols[cols.md as keyof typeof gridCols]}`)
      if (cols.lg) classes.push(`lg:${gridCols[cols.lg as keyof typeof gridCols]}`)
      if (cols.xl) classes.push(`xl:${gridCols[cols.xl as keyof typeof gridCols]}`)
      if (cols["2xl"]) classes.push(`2xl:${gridCols[cols["2xl"] as keyof typeof gridCols]}`)
      
      classes.push(gapClasses[gap])
      
      return classes.join(" ")
    }

    return (
      <div
        ref={ref}
        className={cn(buildGridClasses(), className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ResponsiveGrid.displayName = "ResponsiveGrid"

// Responsive Text Component
interface ResponsiveTextProps extends React.HTMLAttributes<HTMLElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span"
  size?: {
    xs?: string
    sm?: string
    md?: string
    lg?: string
    xl?: string
    "2xl"?: string
  }
  weight?: "light" | "normal" | "medium" | "semibold" | "bold"
  align?: "left" | "center" | "right"
}

const ResponsiveText = React.forwardRef<HTMLElement, ResponsiveTextProps>(
  ({ 
    className, 
    as: Component = "p", 
    size = { xs: "text-sm", md: "text-base" },
    weight = "normal",
    align = "left",
    children, 
    ...props 
  }, ref) => {
    const weights = {
      light: "font-light",
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    }

    const aligns = {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    }

    const buildTextClasses = () => {
      const classes = [weights[weight], aligns[align]]
      
      if (size.xs) classes.push(size.xs)
      if (size.sm) classes.push(`sm:${size.sm}`)
      if (size.md) classes.push(`md:${size.md}`)
      if (size.lg) classes.push(`lg:${size.lg}`)
      if (size.xl) classes.push(`xl:${size.xl}`)
      if (size["2xl"]) classes.push(`2xl:${size["2xl"]}`)
      
      return classes.join(" ")
    }

    return (
      <Component
        ref={ref as any}
        className={cn(buildTextClasses(), className)}
        {...props}
      >
        {children}
      </Component>
    )
  }
)
ResponsiveText.displayName = "ResponsiveText"

// Responsive Spacing Component
interface ResponsiveSpacingProps extends React.HTMLAttributes<HTMLDivElement> {
  py?: {
    xs?: string
    sm?: string
    md?: string
    lg?: string
    xl?: string
    "2xl"?: string
  }
  px?: {
    xs?: string
    sm?: string
    md?: string
    lg?: string
    xl?: string
    "2xl"?: string
  }
}

const ResponsiveSpacing = React.forwardRef<HTMLDivElement, ResponsiveSpacingProps>(
  ({ className, py, px, children, ...props }, ref) => {
    const buildSpacingClasses = () => {
      const classes: string[] = []
      
      if (py) {
        if (py.xs) classes.push(py.xs)
        if (py.sm) classes.push(`sm:${py.sm}`)
        if (py.md) classes.push(`md:${py.md}`)
        if (py.lg) classes.push(`lg:${py.lg}`)
        if (py.xl) classes.push(`xl:${py.xl}`)
        if (py["2xl"]) classes.push(`2xl:${py["2xl"]}`)
      }
      
      if (px) {
        if (px.xs) classes.push(px.xs)
        if (px.sm) classes.push(`sm:${px.sm}`)
        if (px.md) classes.push(`md:${px.md}`)
        if (px.lg) classes.push(`lg:${px.lg}`)
        if (px.xl) classes.push(`xl:${px.xl}`)
        if (px["2xl"]) classes.push(`2xl:${px["2xl"]}`)
      }
      
      return classes.join(" ")
    }

    return (
      <div
        ref={ref}
        className={cn(buildSpacingClasses(), className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ResponsiveSpacing.displayName = "ResponsiveSpacing"

export {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveText,
  ResponsiveSpacing,
}
