import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import { Open_Sans } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { ToastProvider } from "@/components/toast-provider"

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["400", "600", "700", "900"],
})

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
  weight: ["400", "500"],
})

export const metadata: Metadata = {
  title: "Meap Homestay",
  description: "Find and book amazing homestays across Vietnam",
  generator: "MeapDev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${montserrat.variable} ${openSans.variable} antialiased`}>
      <body className="font-sans">
        <AuthProvider>
          <ToastProvider />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}