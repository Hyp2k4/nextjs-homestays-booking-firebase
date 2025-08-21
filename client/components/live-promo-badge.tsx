"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import type { Voucher } from "@/types/voucher"
import { Button } from "@/components/ui/button"
import { X, Tag } from "lucide-react"
import { toast } from "sonner"

export function LivePromoBadge() {
  const [promo, setPromo] = useState<Voucher | null>(null)
  const [timeLeft, setTimeLeft] = useState("")
  const [isVisible, setIsVisible] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const promoRef = doc(db, "settings", "live_promo")
    const unsubscribe = onSnapshot(promoRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data()
        const expiry = (data.expiryDate as any).toDate()
        if (expiry > new Date()) {
          setPromo({ id: docSnap.id, ...data } as Voucher)
          setIsVisible(true)
          document.documentElement.style.setProperty('--promo-badge-height', '48px');
        } else {
          setPromo(null)
          setIsVisible(false)
          document.documentElement.style.setProperty('--promo-badge-height', '0px');
        }
      } else {
        setPromo(null)
        setIsVisible(false)
        document.documentElement.style.setProperty('--promo-badge-height', '0px');
      }
    })

    return () => {
      unsubscribe();
      document.documentElement.style.setProperty('--promo-badge-height', '0px');
    }
  }, [])

  useEffect(() => {
    if (!promo) return

    const interval = setInterval(() => {
      const expiry = (promo.expiryDate as any).toDate()
      const now = new Date()
      const distance = expiry.getTime() - now.getTime()

      if (distance < 0) {
        setTimeLeft("Expired!")
        setPromo(null)
        setIsVisible(false)
        clearInterval(interval)
        return
      }

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)
      setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
    }, 1000)

    return () => clearInterval(interval)
  }, [promo])

  const handleCopyCode = () => {
    if (promo) {
      navigator.clipboard.writeText(promo.code)
      toast.success("Copied voucher code to clipboard!")
    }
  }

  const handleDismiss = () => {
    setIsVisible(false);
    document.documentElement.style.setProperty('--promo-badge-height', '0px');
  }

  if (!isVisible || !promo || (pathname && pathname.startsWith('/admin'))) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg animate-fade-in-down">
      <div className="container mx-auto px-4 h-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Tag className="h-5 w-5 animate-pulse" />
          <div className="text-sm font-semibold">
            <span className="hidden md:inline">{promo.description} Use code:</span>
            <span
              onClick={handleCopyCode}
              className="ml-2 px-2 py-1 bg-white/20 rounded-md cursor-pointer hover:bg-white/30 transition-colors"
            >
              {promo.code}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm font-bold tracking-wider bg-white/20 px-2 py-1 rounded-md">
            Ends in: {timeLeft}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/20" onClick={handleDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
