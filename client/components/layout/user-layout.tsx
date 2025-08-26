"use client"

import { UserHeader } from "@/components/layout/user-header"
import { UserFooter } from "@/components/layout/user-footer"
import { GlobalLayoutWrapper } from "@/components/layout/global-layout-wrapper"
import { LanguageProvider } from "@/lib/i18n"

interface UserLayoutProps {
  children: React.ReactNode
}

export function UserLayout({ children }: UserLayoutProps) {
  return (
    <LanguageProvider>
      <GlobalLayoutWrapper>
        <div className="min-h-screen flex flex-col">
          <UserHeader />
          <main className="flex-1">
            {children}
          </main>
          <UserFooter />
        </div>
      </GlobalLayoutWrapper>
    </LanguageProvider>
  )
}
