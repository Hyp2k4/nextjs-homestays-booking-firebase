import React from "react"
import { cn } from "@/lib/utils"

interface RainbowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  color?: string
}

export function RainbowButton({ children, className, color = "#FFFFFF", ...props }: RainbowButtonProps) {
  const style = {
    "--rainbow-color": color,
  } as React.CSSProperties

  return (
    <div
      className="rainbow relative z-0 bg-white/15 overflow-hidden p-0.5 flex items-center justify-center rounded-full hover:scale-105 transition duration-300 active:scale-100"
      style={style}
    >
      <button
        className={cn(
          "w-full px-8 text-sm py-3 text-white rounded-full font-medium bg-gray-900/80 backdrop-blur",
          className
        )}
        {...props}
      >
        {children}
      </button>
    </div>
  )
}
