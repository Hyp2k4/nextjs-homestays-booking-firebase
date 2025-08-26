"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { VoucherService } from "@/lib/voucher-service"
import { BeautifulLoader } from "@/components/ui/beautiful-loader"
import { useAuth } from "@/contexts/auth-context"
import type { UserVoucher } from "@/types/voucher"
import { toast } from "sonner"
import { 
  Gift, 
  Calendar, 
  Percent, 
  DollarSign, 
  Copy, 
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react"

export default function UserVouchersPage() {
  const { user } = useAuth()
  const [userVouchers, setUserVouchers] = useState<UserVoucher[]>([])
  const [loading, setLoading] = useState(true)
  const [claimCode, setClaimCode] = useState("")
  const [claiming, setClaiming] = useState(false)

  useEffect(() => {
    if (!user?.id) return

    const unsubscribe = VoucherService.subscribeToUserVouchers(user.id, (vouchers) => {
      setUserVouchers(vouchers)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user?.id])

  const handleClaimVoucher = async () => {
    if (!claimCode.trim() || !user?.id) return

    setClaiming(true)
    try {
      // Find voucher by code
      const voucher = await VoucherService.getVoucherByCode(claimCode.trim().toUpperCase())
      if (!voucher) {
        toast.error("Voucher code not found")
        return
      }

      // Check if already claimed
      const alreadyClaimed = userVouchers.some(uv => uv.voucherId === voucher.id)
      if (alreadyClaimed) {
        toast.error("You have already claimed this voucher")
        return
      }

      await VoucherService.claimVoucher(voucher.id, user.id)
      setClaimCode("")
      toast.success("Voucher claimed successfully!")
    } catch (error: any) {
      console.error("Error claiming voucher:", error)
      toast.error(error.message || "Failed to claim voucher")
    } finally {
      setClaiming(false)
    }
  }

  const copyVoucherCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success("Voucher code copied to clipboard!")
  }

  const getVoucherStatus = (userVoucher: UserVoucher) => {
    if (!userVoucher.voucher) return { status: "unknown", color: "bg-gray-100 text-gray-800", icon: AlertCircle }
    
    const voucher = userVoucher.voucher
    const now = new Date()
    const expiryDate = voucher.expiryDate instanceof Date ? voucher.expiryDate : voucher.expiryDate?.toDate?.()
    
    if (!voucher.isActive) return { status: "inactive", color: "bg-gray-100 text-gray-800", icon: AlertCircle }
    if (expiryDate && expiryDate < now) return { status: "expired", color: "bg-red-100 text-red-800", icon: Clock }
    if (userVoucher.isUsed || (voucher.usageLimit > 0 && userVoucher.usageCount >= voucher.usageLimit)) {
      return { status: "used", color: "bg-green-100 text-green-800", icon: CheckCircle }
    }
    return { status: "available", color: "bg-blue-100 text-blue-800", icon: Gift }
  }

  const formatDiscount = (voucher: any) => {
    if (!voucher) return "N/A"
    return voucher.discountType === "percentage" 
      ? `${voucher.discountValue}% OFF`
      : `${voucher.discountValue.toLocaleString()}₫ OFF`
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <BeautifulLoader variant="dots" size="lg" text="Loading your vouchers..." />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">My Vouchers</h1>
          <p className="text-neutral-600 mt-2">Manage your discount vouchers and claim new ones</p>
        </div>

        {/* Claim Voucher */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Claim Voucher
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Enter voucher code"
                value={claimCode}
                onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
                className="flex-1"
              />
              <Button onClick={handleClaimVoucher} disabled={claiming || !claimCode.trim()}>
                {claiming ? <BeautifulLoader size="sm" variant="spin" /> : "Claim"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Total Vouchers</p>
                  <p className="text-2xl font-bold text-neutral-900">{userVouchers.length}</p>
                </div>
                <Gift className="h-8 w-8 text-primary-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Available</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {userVouchers.filter(uv => getVoucherStatus(uv).status === "available").length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Used</p>
                  <p className="text-2xl font-bold text-green-600">
                    {userVouchers.filter(uv => getVoucherStatus(uv).status === "used").length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Expired</p>
                  <p className="text-2xl font-bold text-red-600">
                    {userVouchers.filter(uv => getVoucherStatus(uv).status === "expired").length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vouchers List */}
        <div className="space-y-4">
          {userVouchers.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Gift className="h-16 w-16 mx-auto text-neutral-400 mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">No vouchers yet</h3>
                <p className="text-neutral-600">Claim your first voucher using the form above!</p>
              </CardContent>
            </Card>
          ) : (
            userVouchers.map((userVoucher) => {
              const { status, color, icon: StatusIcon } = getVoucherStatus(userVoucher)
              const voucher = userVoucher.voucher

              return (
                <Card key={userVoucher.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{voucher?.title || "Unknown Voucher"}</h3>
                          <Badge className={color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Badge>
                        </div>
                        
                        <p className="text-neutral-600 mb-4">{voucher?.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-neutral-500">Discount:</span>
                            <p className="font-medium text-lg text-primary-600">
                              {formatDiscount(voucher)}
                            </p>
                          </div>
                          <div>
                            <span className="text-neutral-500">Code:</span>
                            <div className="flex items-center gap-2">
                              <p className="font-mono font-bold">{voucher?.code}</p>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => copyVoucherCode(voucher?.code || "")}
                                className="h-6 w-6 p-0"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <span className="text-neutral-500">Usage:</span>
                            <p className="font-medium">
                              {userVoucher.usageCount} / {voucher?.usageLimit === 0 ? "∞" : voucher?.usageLimit}
                            </p>
                          </div>
                          <div>
                            <span className="text-neutral-500">Expires:</span>
                            <p className="font-medium">
                              {voucher?.expiryDate instanceof Date 
                                ? voucher.expiryDate.toLocaleDateString()
                                : voucher?.expiryDate?.toDate?.()?.toLocaleDateString() || "N/A"
                              }
                            </p>
                          </div>
                        </div>

                        {userVoucher.lastUsedAt && (
                          <div className="mt-3 text-xs text-neutral-500">
                            Last used: {userVoucher.lastUsedAt instanceof Date 
                              ? userVoucher.lastUsedAt.toLocaleDateString()
                              : userVoucher.lastUsedAt?.toDate?.()?.toLocaleDateString()
                            }
                          </div>
                        )}
                      </div>

                      <div className="ml-4">
                        {status === "available" && (
                          <Button size="sm" className="bg-gradient-to-r from-primary-600 to-primary-500">
                            Use Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
