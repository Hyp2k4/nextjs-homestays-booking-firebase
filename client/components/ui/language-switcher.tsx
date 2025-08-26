"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage, type Language } from "@/lib/i18n"
import { Globe, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface LanguageOption {
  code: Language
  name: string
  nativeName: string
  flag: string
}

const languages: LanguageOption[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  },
  {
    code: 'vi',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳'
  }
]

interface LanguageSwitcherProps {
  variant?: 'default' | 'compact' | 'icon-only'
  className?: string
}

export function LanguageSwitcher({ variant = 'default', className }: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const currentLanguage = languages.find(lang => lang.code === language)

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
    setIsOpen(false)
  }

  if (variant === 'icon-only') {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={cn("h-8 w-8 p-0", className)}>
            <Globe className="h-4 w-4" />
            <span className="sr-only">Change language</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.nativeName}</span>
              </div>
              {language === lang.code && (
                <Check className="h-4 w-4 text-primary-600" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (variant === 'compact') {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={cn("h-8 px-2", className)}>
            <span className="text-sm">{currentLanguage?.flag}</span>
            <span className="ml-1 text-xs font-medium">{currentLanguage?.code.toUpperCase()}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.nativeName}</span>
              </div>
              {language === lang.code && (
                <Check className="h-4 w-4 text-primary-600" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={cn("flex items-center space-x-2", className)}>
          <Globe className="h-4 w-4" />
          <span className="text-sm">{currentLanguage?.flag}</span>
          <span className="text-sm font-medium">{currentLanguage?.nativeName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-3 py-2 text-sm font-medium text-neutral-700 border-b">
          {t('common.selectLanguage') || 'Select Language'}
        </div>
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className="flex items-center justify-between cursor-pointer py-3"
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">{lang.flag}</span>
              <div>
                <div className="font-medium">{lang.nativeName}</div>
                <div className="text-xs text-neutral-500">{lang.name}</div>
              </div>
            </div>
            {language === lang.code && (
              <Check className="h-4 w-4 text-primary-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Simplified language toggle for footer
export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()
  
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'vi' : 'en')
  }

  const currentLang = languages.find(lang => lang.code === language)

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-1 text-neutral-400 hover:text-white transition-colors text-sm"
    >
      <span>{currentLang?.flag}</span>
      <span>{currentLang?.nativeName}</span>
    </button>
  )
}
