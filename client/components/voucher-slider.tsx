"use client"

import { useState, useEffect, useCallback } from "react"
import { VoucherService } from "@/lib/voucher-service"
import type { Voucher } from "@/types/voucher"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { VoucherCard } from "@/components/voucher-card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Loader2 } from "lucide-react"

export function VoucherSlider() {
  const { user } = useAuth()
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [loading, setLoading] = useState(true)

  const fetchVouchers = useCallback(async () => {
    setLoading(true)
    try {
      const availableVouchers = await VoucherService.getAvailableVouchers()
      setVouchers(availableVouchers)
    } catch (error) {
      console.error("Failed to fetch vouchers", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVouchers()
  }, [fetchVouchers])

  const handleClaimVoucher = async (voucherId: string) => {
    if (!user) {
      toast.error("Bạn cần đăng nhập để lưu voucher.")
      return
    }
    const result = await VoucherService.claimVoucher(voucherId, user.id)
    if (result.success) {
      toast.success("Lưu voucher thành công!")
      fetchVouchers() // Refresh the list
    } else {
      toast.error(result.error || "Không thể lưu voucher.")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (vouchers.length === 0) {
    return null // Don't render anything if there are no vouchers
  }

  return (
    <section className="py-12">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Săn Voucher Hot</h2>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {vouchers.map((voucher) => (
              <CarouselItem key={voucher.id} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1 h-full">
                  <VoucherCard voucher={voucher} onClaim={handleClaimVoucher} isClaimable={true} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  )
}
