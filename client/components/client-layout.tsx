"use client"

import { usePathname } from "next/navigation"
import { Suspense } from "react"
import { Sidebar } from "@/components/admin/sidebar"
import Loading from "@/components/ui/loading"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isAdminRoute = pathname.startsWith("/admin")

    return (
        <div className="flex">
            {isAdminRoute && <Sidebar />}
            <main className="flex-1 p-4">
                <Suspense fallback={<Loading />}>
                    {children}
                </Suspense>
            </main>
        </div>
    )
}