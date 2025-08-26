"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AdminAuthProvider, useAdminAuth } from "@/contexts/admin-auth-context"

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAdminAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login-admin")
    }
  }, [isAuthenticated, loading, router])

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  // Return children directly since each page now uses AdminDashboardLayout
  return <>{children}</>
}

export default function AdminPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminAuthProvider>
  )
}
