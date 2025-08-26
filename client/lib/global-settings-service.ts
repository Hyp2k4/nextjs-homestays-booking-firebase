"use client"

import { useState, useEffect } from "react"
import { AdminSettingsService, type AppearanceSettings, type LocalizationSettings } from "@/lib/admin-settings-service"

// Global settings context
let globalAppearanceSettings: AppearanceSettings | null = null
let globalLocalizationSettings: LocalizationSettings | null = null

// Subscribers for settings changes
const appearanceSubscribers: ((settings: AppearanceSettings) => void)[] = []
const localizationSubscribers: ((settings: LocalizationSettings) => void)[] = []

export class GlobalSettingsService {
  // Initialize global settings
  static async initialize() {
    try {
      // Load appearance settings
      const appearance = await AdminSettingsService.getAppearanceSettings()
      if (appearance) {
        globalAppearanceSettings = appearance
        this.applyAppearanceSettings(appearance)
        appearanceSubscribers.forEach(callback => callback(appearance))
      } else {
        const defaultAppearance = AdminSettingsService.getDefaultAppearanceSettings()
        globalAppearanceSettings = defaultAppearance
        this.applyAppearanceSettings(defaultAppearance)
        appearanceSubscribers.forEach(callback => callback(defaultAppearance))
      }

      // Load localization settings
      const localization = await AdminSettingsService.getLocalizationSettings()
      if (localization) {
        globalLocalizationSettings = localization
        localizationSubscribers.forEach(callback => callback(localization))
      } else {
        const defaultLocalization = AdminSettingsService.getDefaultLocalizationSettings()
        globalLocalizationSettings = defaultLocalization
        localizationSubscribers.forEach(callback => callback(defaultLocalization))
      }

      // Subscribe to real-time changes
      AdminSettingsService.subscribeToSettings<AppearanceSettings>("appearance", (settings) => {
        if (settings) {
          globalAppearanceSettings = settings
          this.applyAppearanceSettings(settings)
          appearanceSubscribers.forEach(callback => callback(settings))
        }
      })

      AdminSettingsService.subscribeToSettings<LocalizationSettings>("localization", (settings) => {
        if (settings) {
          globalLocalizationSettings = settings
          localizationSubscribers.forEach(callback => callback(settings))
        }
      })

    } catch (error) {
      console.error("Error initializing global settings:", error)
    }
  }

  // Apply appearance settings to the DOM
  static applyAppearanceSettings(settings: AppearanceSettings) {
    const root = document.documentElement

    // Apply CSS custom properties
    root.style.setProperty('--color-primary', settings.branding.primaryColor)
    root.style.setProperty('--color-secondary', settings.branding.secondaryColor)
    root.style.setProperty('--color-accent', settings.branding.accentColor)

    // Apply theme
    if (settings.theme.defaultTheme === 'dark') {
      root.classList.add('dark')
    } else if (settings.theme.defaultTheme === 'light') {
      root.classList.remove('dark')
    } else {
      // Auto theme - check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }

    // Apply custom CSS
    let customStyleElement = document.getElementById('custom-styles')
    if (!customStyleElement) {
      customStyleElement = document.createElement('style')
      customStyleElement.id = 'custom-styles'
      document.head.appendChild(customStyleElement)
    }
    customStyleElement.textContent = settings.customCSS

    // Update favicon
    if (settings.branding.favicon) {
      let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
      if (!favicon) {
        favicon = document.createElement('link')
        favicon.rel = 'icon'
        document.head.appendChild(favicon)
      }
      favicon.href = settings.branding.favicon
    }

    // Update page title
    if (settings.branding.siteName) {
      const titleElement = document.querySelector('title')
      if (titleElement && !titleElement.textContent?.includes(' - ')) {
        titleElement.textContent = `${titleElement.textContent} - ${settings.branding.siteName}`
      }
    }
  }

  // Get current appearance settings
  static getAppearanceSettings(): AppearanceSettings | null {
    return globalAppearanceSettings
  }

  // Get current localization settings
  static getLocalizationSettings(): LocalizationSettings | null {
    return globalLocalizationSettings
  }

  // Subscribe to appearance settings changes
  static subscribeToAppearanceSettings(callback: (settings: AppearanceSettings) => void) {
    appearanceSubscribers.push(callback)
    if (globalAppearanceSettings) {
      callback(globalAppearanceSettings)
    }
    
    return () => {
      const index = appearanceSubscribers.indexOf(callback)
      if (index > -1) {
        appearanceSubscribers.splice(index, 1)
      }
    }
  }

  // Subscribe to localization settings changes
  static subscribeToLocalizationSettings(callback: (settings: LocalizationSettings) => void) {
    localizationSubscribers.push(callback)
    if (globalLocalizationSettings) {
      callback(globalLocalizationSettings)
    }
    
    return () => {
      const index = localizationSubscribers.indexOf(callback)
      if (index > -1) {
        localizationSubscribers.splice(index, 1)
      }
    }
  }

  // Format currency based on localization settings
  static formatCurrency(amount: number): string {
    const settings = globalLocalizationSettings
    if (!settings) return `${amount.toLocaleString()}₫`

    const formattedAmount = amount.toLocaleString()
    return settings.currency.position === 'before' 
      ? `${settings.currency.symbol}${formattedAmount}`
      : `${formattedAmount}${settings.currency.symbol}`
  }

  // Format date based on localization settings
  static formatDate(date: Date): string {
    const settings = globalLocalizationSettings
    if (!settings) return date.toLocaleDateString()

    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()

    switch (settings.dateFormat) {
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`
      case 'DD-MM-YYYY':
        return `${day}-${month}-${year}`
      default:
        return `${day}/${month}/${year}`
    }
  }

  // Format time based on localization settings
  static formatTime(date: Date): string {
    const settings = globalLocalizationSettings
    if (!settings) return date.toLocaleTimeString()

    return date.toLocaleTimeString('en-US', {
      hour12: settings.timeFormat === '12h',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get site name
  static getSiteName(): string {
    return globalAppearanceSettings?.branding.siteName || "Homestay Booking"
  }

  // Get logo URL
  static getLogoUrl(): string | null {
    return globalAppearanceSettings?.branding.logo || null
  }

  // Get primary color
  static getPrimaryColor(): string {
    return globalAppearanceSettings?.branding.primaryColor || "#3B82F6"
  }

  // Get supported languages
  static getSupportedLanguages() {
    return globalLocalizationSettings?.supportedLanguages.filter(lang => lang.enabled) || []
  }

  // Get default language
  static getDefaultLanguage(): string {
    return globalLocalizationSettings?.defaultLanguage || "vi"
  }
}

// React hooks for using global settings
export function useAppearanceSettings() {
  const [settings, setSettings] = useState<AppearanceSettings | null>(
    GlobalSettingsService.getAppearanceSettings()
  )

  useEffect(() => {
    const unsubscribe = GlobalSettingsService.subscribeToAppearanceSettings(setSettings)
    return unsubscribe
  }, [])

  return settings
}

export function useLocalizationSettings() {
  const [settings, setSettings] = useState<LocalizationSettings | null>(
    GlobalSettingsService.getLocalizationSettings()
  )

  useEffect(() => {
    const unsubscribe = GlobalSettingsService.subscribeToLocalizationSettings(setSettings)
    return unsubscribe
  }, [])

  return settings
}

// Initialize settings when the module loads
if (typeof window !== 'undefined') {
  GlobalSettingsService.initialize()
}
