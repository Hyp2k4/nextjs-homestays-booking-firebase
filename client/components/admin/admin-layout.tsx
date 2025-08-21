"use client"

import { Sidebar } from "@/components/admin/sidebar"

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-muted/40">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* You can add a header here if needed, e.g., for user menu or breadcrumbs */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
          <div className="container mx-auto px-4 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
