import type { Metadata } from "next"
import { Montserrat, Playfair_Display } from "next/font/google"
import { Open_Sans } from "next/font/google"
import "./globals.css"
import "leaflet/dist/leaflet.css"
import { AuthProvider } from "@/contexts/auth-context"
import { PromoProvider } from "@/contexts/promo-context"
import { Toaster } from "sonner"
import { GlobalChatWidget } from "@/components/chat/global-chat-widget"
import { LivePromoBadge } from "@/components/live-promo-badge"

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

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  weight: ["400", "700"],
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
    <html lang="en" className={`${montserrat.variable} ${openSans.variable} ${playfair.variable} antialiased`} suppressHydrationWarning>
      <body className="font-sans">
        <AuthProvider>
          <PromoProvider>
            <LivePromoBadge />
            {children}
            <Toaster position="top-right" richColors />
            <GlobalChatWidget />
          </PromoProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
