import { AdminAuthProvider } from "@/contexts/admin-auth-context"

export default function LoginAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>
}
