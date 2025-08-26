"use client"

import { useEffect } from "react"
import { GlobalSettingsService } from "@/lib/global-settings-service"

interface GlobalLayoutWrapperProps {
  children: React.ReactNode
}

export function GlobalLayoutWrapper({ children }: GlobalLayoutWrapperProps) {
  useEffect(() => {
    // Initialize global settings when the app loads
    GlobalSettingsService.initialize()
  }, [])

  return <>{children}</>
}
