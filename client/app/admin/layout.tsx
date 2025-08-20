"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AdminAuthProvider, useAdminAuth } from "@/contexts/admin-auth-context"
import { AdminLayout } from "@/components/admin/admin-layout"

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAdminAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login-admin")
    }
  }, [isAuthenticated, loading, router])

  if (loading || !isAuthenticated) {
    return <div>Loading...</div> // Or a proper loading spinner
  }

  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  )
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
