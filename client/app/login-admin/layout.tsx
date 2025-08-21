import { AdminAuthProvider } from "@/contexts/admin-auth-context"
import SplashCursor from "@/components/admin/splash-cursor"

export default function LoginAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAuthProvider>
      <SplashCursor />
      {children}
    </AdminAuthProvider>
  )
}
