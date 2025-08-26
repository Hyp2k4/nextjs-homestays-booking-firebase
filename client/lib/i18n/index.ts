import { useState, useEffect, createContext, useContext } from 'react'
import { GlobalSettingsService } from '@/lib/global-settings-service'

// Supported languages
export type Language = 'en' | 'vi'

// Translation interface
export interface Translations {
  [key: string]: string | Translations
}

// Language context
interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string>) => string
  isLoading: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Translation storage
let translations: Record<Language, Translations> = {
  en: {},
  vi: {}
}

// Current language
let currentLanguage: Language = 'en'

// Language change subscribers
const languageSubscribers: ((lang: Language) => void)[] = []

export class I18nService {
  // Load translations for a language
  static async loadTranslations(language: Language): Promise<Translations> {
    try {
      const response = await fetch(`/locales/${language}.json`)
      if (response.ok) {
        const data = await response.json()
        translations[language] = data
        return data
      }
    } catch (error) {
      console.error(`Error loading translations for ${language}:`, error)
    }
    return {}
  }

  // Initialize i18n system
  static async initialize() {
    // Get default language from settings
    const localizationSettings = GlobalSettingsService.getLocalizationSettings()
    const defaultLang = (localizationSettings?.defaultLanguage as Language) || 'en'
    
    // Load translations for both languages
    await Promise.all([
      this.loadTranslations('en'),
      this.loadTranslations('vi')
    ])

    // Set current language
    this.setLanguage(defaultLang)
  }

  // Set current language
  static setLanguage(language: Language) {
    currentLanguage = language
    
    // Update HTML lang attribute
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language
    }

    // Notify subscribers
    languageSubscribers.forEach(callback => callback(language))

    // Save to localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('preferred-language', language)
    }
  }

  // Get current language
  static getCurrentLanguage(): Language {
    return currentLanguage
  }

  // Subscribe to language changes
  static subscribeToLanguageChanges(callback: (lang: Language) => void) {
    languageSubscribers.push(callback)
    
    return () => {
      const index = languageSubscribers.indexOf(callback)
      if (index > -1) {
        languageSubscribers.splice(index, 1)
      }
    }
  }

  // Translate a key
  static translate(key: string, params?: Record<string, string>): string {
    const keys = key.split('.')
    let value: any = translations[currentLanguage]

    // Navigate through nested keys
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        // Fallback to English if key not found in current language
        value = translations['en']
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey]
          } else {
            return key // Return key if translation not found
          }
        }
        break
      }
    }

    if (typeof value !== 'string') {
      return key
    }

    // Replace parameters
    if (params) {
      Object.entries(params).forEach(([param, replacement]) => {
        value = value.replace(new RegExp(`{{${param}}}`, 'g'), replacement)
      })
    }

    return value
  }

  // Get all translations for current language
  static getTranslations(): Translations {
    return translations[currentLanguage] || {}
  }

  // Check if a translation exists
  static hasTranslation(key: string): boolean {
    const keys = key.split('.')
    let value: any = translations[currentLanguage]

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return false
      }
    }

    return typeof value === 'string'
  }
}

// React hook for using translations
export function useTranslation() {
  const [language, setLanguageState] = useState<Language>(currentLanguage)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initialize i18n if not already done
    I18nService.initialize().then(() => {
      setIsLoading(false)
    })

    // Subscribe to language changes
    const unsubscribe = I18nService.subscribeToLanguageChanges((lang) => {
      setLanguageState(lang)
    })

    return unsubscribe
  }, [])

  const setLanguage = (lang: Language) => {
    I18nService.setLanguage(lang)
  }

  const t = (key: string, params?: Record<string, string>) => {
    return I18nService.translate(key, params)
  }

  return {
    language,
    setLanguage,
    t,
    isLoading
  }
}

// Language provider component
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const translation = useTranslation()

  return (
    <LanguageContext.Provider value={translation}>
      {children}
    </LanguageContext.Provider>
  )
}

// Hook to use language context
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Utility function for quick translation
export const t = (key: string, params?: Record<string, string>) => {
  return I18nService.translate(key, params)
}

// Initialize when module loads
if (typeof window !== 'undefined') {
  // Check for saved language preference
  const savedLanguage = localStorage.getItem('preferred-language') as Language
  if (savedLanguage && ['en', 'vi'].includes(savedLanguage)) {
    currentLanguage = savedLanguage
  }
  
  I18nService.initialize()
}
