"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/contexts/admin-auth-context"
import { MysteriousLogin } from "@/components/admin/mysterious-login"

export default function AdminLoginPage() {
  const { isAuthenticated, loading } = useAdminAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/admin")
    }
  }, [isAuthenticated, loading, router])

  if (loading || isAuthenticated) {
    return <div>Loading...</div> // Or a proper loading spinner
  }

  return <MysteriousLogin />
}
