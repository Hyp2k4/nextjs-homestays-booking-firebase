"use client"

import { useState, useEffect } from "react"
import type { Voucher } from "@/types/voucher"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Tag, Clock, Home, BedDouble, CheckCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"

interface VoucherCardProps {
  voucher: Voucher;
  onClaim?: (voucherId: string) => Promise<void>;
  isClaimable?: boolean;
}

export function VoucherCard({ voucher, onClaim, isClaimable = false }: VoucherCardProps) {
  const [timeLeft, setTimeLeft] = useState("")
  const [isClaiming, setIsClaiming] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const updateTimer = () => {
      const expiry = new Date(voucher.expiryDate)
      const now = new Date()
      if (expiry > now) {
        setTimeLeft(formatDistanceToNow(expiry, { addSuffix: true, locale: vi }))
      } else {
        setTimeLeft("Đã hết hạn")
      }
    }
    updateTimer()
    const interval = setInterval(updateTimer, 60000)
    return () => clearInterval(interval)
  }, [voucher.expiryDate])

  const handleClaim = async () => {
    if (onClaim) {
        setIsClaiming(true)
        await onClaim(voucher.id)
        setIsClaiming(false)
    }
  }

  const getScopeInfo = () => {
    switch (voucher.scope) {
      case "all_homestays": return { icon: <Home className="h-4 w-4" />, text: "Áp dụng cho tất cả homestay" }
      case "all_rooms": return { icon: <BedDouble className="h-4 w-4" />, text: "Áp dụng cho tất cả các phòng" }
      case "specific_homestay": return { icon: <Home className="h-4 w-4" />, text: `Cho homestay ID: ${voucher.applicableHomestayId}` }
      case "specific_room": return { icon: <BedDouble className="h-4 w-4" />, text: `Cho phòng ID: ${voucher.applicableRoomId}` }
      default: return { icon: <Tag className="h-4 w-4" />, text: "Ưu đãi chung" }
    }
  }

  const scopeInfo = getScopeInfo()

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold text-primary">{voucher.code}</CardTitle>
          <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
            {voucher.discountType === 'percentage' ? `${voucher.discountValue}% OFF` : `${(voucher.discountValue / 1000).toLocaleString()}K OFF`}
          </div>
        </div>
        <CardDescription>{voucher.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {scopeInfo.icon}
            <span>{scopeInfo.text}</span>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-2 text-sm text-red-600">
            <Clock className="h-4 w-4" />
            <span>Hết hạn {timeLeft}</span>
          </div>
        </div>
        {onClaim && isClaimable && (
          <Button onClick={handleClaim} disabled={isClaiming} className="mt-4 w-full">
            {isClaiming ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lưu"}
          </Button>
        )}
        {!isClaimable && voucher.claimedBy && (
          <div className="mt-4 w-full flex items-center justify-center gap-2 text-green-600 font-semibold">
            <CheckCircle className="h-5 w-5" />
            <span>Đã lưu</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
