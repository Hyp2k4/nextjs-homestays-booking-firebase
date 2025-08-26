"use client"

import { ModernDashboardLayout } from "@/components/admin/modern-dashboard-layout"
import { GlobalLayoutWrapper } from "@/components/layout/global-layout-wrapper"
import { LanguageProvider } from "@/lib/i18n"

interface AdminLayoutProps {
  children: React.ReactNode
  title?: string
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  return (
    <LanguageProvider>
      <GlobalLayoutWrapper>
        <ModernDashboardLayout title={title}>
          {children}
        </ModernDashboardLayout>
      </GlobalLayoutWrapper>
    </LanguageProvider>
  )
}
