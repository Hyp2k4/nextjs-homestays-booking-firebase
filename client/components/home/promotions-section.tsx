"use client"

import { useState, useEffect } from "react"
import { Gift, Clock, Users, Percent, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"

const promotions = [
  {
    id: 1,
    title: "Giảm 30% cho lần đầu đặt phòng",
    description: "Áp dụng cho tất cả homestay, tối đa 500.000đ",
    code: "WELCOME30",
    discount: 30,
    type: "percentage",
    minSpend: 1000000,
    maxDiscount: 500000,
    validUntil: new Date("2024-12-31"),
    used: 245,
    total: 1000,
    color: "from-blue-500 to-purple-600",
    icon: <Gift className="h-6 w-6" />
  },
  {
    id: 2,
    title: "Ưu đãi cuối tuần",
    description: "Giảm 200.000đ cho booking từ thứ 6-CN",
    code: "WEEKEND200",
    discount: 200000,
    type: "fixed",
    minSpend: 800000,
    validUntil: new Date("2024-09-30"),
    used: 89,
    total: 500,
    color: "from-orange-500 to-red-500",
    icon: <Clock className="h-6 w-6" />
  },
  {
    id: 3,
    title: "Đặt nhóm tiết kiệm",
    description: "Giảm 15% cho nhóm từ 6 người trở lên",
    code: "GROUP15",
    discount: 15,
    type: "percentage",
    minSpend: 1500000,
    maxDiscount: 800000,
    validUntil: new Date("2024-10-15"),
    used: 156,
    total: 300,
    color: "from-green-500 to-teal-500",
    icon: <Users className="h-6 w-6" />
  },
  {
    id: 4,
    title: "Flash Sale - Chỉ hôm nay!",
    description: "Giảm 50% cho 50 booking đầu tiên",
    code: "FLASH50",
    discount: 50,
    type: "percentage",
    minSpend: 500000,
    maxDiscount: 1000000,
    validUntil: new Date("2024-08-27"),
    used: 47,
    total: 50,
    color: "from-pink-500 to-rose-500",
    icon: <Percent className="h-6 w-6" />,
    isFlash: true
  }
]

export function PromotionsSection() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState<{ [key: number]: string }>({})

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const newTimeLeft: { [key: number]: string } = {}
      
      promotions.forEach(promo => {
        const diff = promo.validUntil.getTime() - now.getTime()
        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24))
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
          
          if (days > 0) {
            newTimeLeft[promo.id] = `${days} ngày ${hours} giờ`
          } else if (hours > 0) {
            newTimeLeft[promo.id] = `${hours} giờ ${minutes} phút`
          } else {
            newTimeLeft[promo.id] = `${minutes} phút`
          }
        } else {
          newTimeLeft[promo.id] = "Đã hết hạn"
        }
      })
      
      setTimeLeft(newTimeLeft)
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      toast.success(`Đã sao chép mã: ${code}`)
      
      setTimeout(() => {
        setCopiedCode(null)
      }, 2000)
    } catch (err) {
      toast.error("Không thể sao chép mã")
    }
  }

  const formatDiscount = (promo: typeof promotions[0]) => {
    if (promo.type === "percentage") {
      return `${promo.discount}%`
    }
    return `${promo.discount.toLocaleString('vi-VN')}đ`
  }

  const getProgressPercentage = (used: number, total: number) => {
    return (used / total) * 100
  }

  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">
            Ưu Đãi Đặc Biệt
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tiết kiệm chi phí với các mã giảm giá hấp dẫn dành riêng cho bạn
          </p>
        </div>

        {/* Promotions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {promotions.map((promo) => (
            <Card
              key={promo.id}
              className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${promo.color} opacity-90`} />
              
              {/* Flash Sale Animation */}
              {promo.isFlash && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 animate-pulse" />
              )}

              <CardContent className="relative z-10 p-6 text-white">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    {promo.icon}
                  </div>
                  {promo.isFlash && (
                    <Badge variant="secondary" className="bg-yellow-400 text-black font-bold animate-bounce">
                      HOT
                    </Badge>
                  )}
                </div>

                {/* Title & Description */}
                <h3 className="font-bold text-lg mb-2 line-clamp-2">
                  {promo.title}
                </h3>
                <p className="text-white/90 text-sm mb-4 line-clamp-2">
                  {promo.description}
                </p>

                {/* Discount Amount */}
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold mb-1">
                    {formatDiscount(promo)}
                  </div>
                  <div className="text-white/80 text-xs">
                    Giảm tối đa {promo.maxDiscount?.toLocaleString('vi-VN')}đ
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Đã sử dụng: {promo.used}</span>
                    <span>Còn lại: {promo.total - promo.used}</span>
                  </div>
                  <Progress 
                    value={getProgressPercentage(promo.used, promo.total)} 
                    className="h-2 bg-white/20"
                  />
                </div>

                {/* Time Left */}
                <div className="flex items-center gap-2 mb-4 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>Còn: {timeLeft[promo.id] || "Đang tính..."}</span>
                </div>

                {/* Code & Copy Button */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white/20 rounded-lg px-3 py-2 backdrop-blur-sm">
                    <div className="text-xs text-white/80 mb-1">Mã giảm giá</div>
                    <div className="font-mono font-bold">{promo.code}</div>
                  </div>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => copyCode(promo.code)}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                  >
                    {copiedCode === promo.code ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Terms */}
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="text-xs text-white/80">
                    Áp dụng cho đơn từ {promo.minSpend.toLocaleString('vi-VN')}đ
                  </div>
                </div>
              </CardContent>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Card className="inline-block p-6 bg-gradient-to-r from-primary to-secondary text-white border-0">
            <h3 className="font-bold text-xl mb-2">
              Đăng ký nhận thông báo ưu đãi
            </h3>
            <p className="text-white/90 mb-4">
              Không bỏ lỡ các chương trình khuyến mãi hấp dẫn
            </p>
            <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-white/90">
              Đăng ký ngay
            </Button>
          </Card>
        </div>
      </div>
    </section>
  )
}
