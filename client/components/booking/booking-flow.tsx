"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { BookingService } from "@/lib/booking-service"
import type { Property } from "@/types/property"
import type { BookingRequest } from "@/types/booking"
import { Calendar, Users, CreditCard, CheckCircle, Loader2, ArrowLeft, ArrowRight } from "lucide-react"

interface BookingFlowProps {
  isOpen: boolean
  onClose: () => void
  property: Property
  initialCheckIn?: string
  initialCheckOut?: string
  initialGuests?: number
}

type BookingStep = "dates" | "guests" | "payment" | "confirmation"

export function BookingFlow({
  isOpen,
  onClose,
  property,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
}: BookingFlowProps) {
  const { user, isAuthenticated } = useAuth()
  const [currentStep, setCurrentStep] = useState<BookingStep>("dates")
  const [isLoading, setIsLoading] = useState(false)
  const [bookingId, setBookingId] = useState<string>("")

  // Booking data
  const [checkIn, setCheckIn] = useState(initialCheckIn || "")
  const [checkOut, setCheckOut] = useState(initialCheckOut || "")
  const [guests, setGuests] = useState(initialGuests || 2)
  const [guestInfo, setGuestInfo] = useState({
    firstName: user?.name.split(" ")[0] || "",
    lastName: user?.name.split(" ").slice(1).join(" ") || "",
    email: user?.email || "",
    phone: "",
    specialRequests: "",
  })
  const [paymentMethod, setPaymentMethod] = useState<"vnpay" | "momo" | "bank_transfer">("vnpay")

  // Calculations
  const totalNights =
    checkIn && checkOut
      ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
      : 0
  const subtotal = property.price.perNight * totalNights
  const serviceFee = 50000
  const total = subtotal + serviceFee

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleNext = () => {
    if (currentStep === "dates" && checkIn && checkOut) {
      setCurrentStep("guests")
    } else if (currentStep === "guests") {
      setCurrentStep("payment")
    } else if (currentStep === "payment") {
      handleBooking()
    }
  }

  const handleBack = () => {
    if (currentStep === "guests") {
      setCurrentStep("dates")
    } else if (currentStep === "payment") {
      setCurrentStep("guests")
    }
  }

  const handleBooking = async () => {
    if (!isAuthenticated || !user) {
      alert("Vui lòng đăng nhập để đặt phòng")
      return
    }

    setIsLoading(true)

    try {
      const bookingRequest: BookingRequest = {
        propertyId: property.id,
        checkIn,
        checkOut,
        guests,
        guestInfo,
        paymentMethod,
      }

      const result = await BookingService.createBooking(bookingRequest, user.id, user.name, user.email)

      if (result.success && result.booking) {
        // Process payment
        const paymentResult = await BookingService.processPayment(result.booking.id, paymentMethod)

        if (paymentResult.success) {
          setBookingId(result.booking.id)
          setCurrentStep("confirmation")
        } else {
          alert(paymentResult.error || "Thanh toán thất bại")
        }
      } else {
        alert(result.error || "Có lỗi xảy ra")
      }
    } catch (error) {
      alert("Có lỗi xảy ra khi đặt phòng")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
    // Reset form after a delay
    setTimeout(() => {
      setCurrentStep("dates")
      setBookingId("")
    }, 300)
  }

  if (!isAuthenticated) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Đăng nhập để đặt phòng</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">Bạn cần đăng nhập để có thể đặt phòng homestay.</p>
            <Button onClick={onClose}>Đóng</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            {currentStep === "confirmation" ? "Đặt phòng thành công!" : "Đặt phòng"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Steps */}
          {currentStep !== "confirmation" && (
            <div className="flex items-center justify-center space-x-4">
              <div
                className={`flex items-center ${currentStep === "dates" ? "text-primary" : "text-muted-foreground"}`}
              >
                <Calendar className="h-4 w-4 mr-1" />
                <span className="text-sm">Ngày</span>
              </div>
              <div className="w-8 h-px bg-border" />
              <div
                className={`flex items-center ${currentStep === "guests" ? "text-primary" : "text-muted-foreground"}`}
              >
                <Users className="h-4 w-4 mr-1" />
                <span className="text-sm">Thông tin</span>
              </div>
              <div className="w-8 h-px bg-border" />
              <div
                className={`flex items-center ${currentStep === "payment" ? "text-primary" : "text-muted-foreground"}`}
              >
                <CreditCard className="h-4 w-4 mr-1" />
                <span className="text-sm">Thanh toán</span>
              </div>
            </div>
          )}

          {/* Step Content */}
          {currentStep === "dates" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Chọn ngày nhận và trả phòng</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="checkin">Nhận phòng</Label>
                  <Input
                    id="checkin"
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="checkout">Trả phòng</Label>
                  <Input
                    id="checkout"
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn || new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="guests">Số khách</Label>
                <select
                  id="guests"
                  value={guests}
                  onChange={(e) => setGuests(Number.parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                >
                  {Array.from({ length: property.capacity.guests }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num} khách
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {currentStep === "guests" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Thông tin khách hàng</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Tên</Label>
                  <Input
                    id="firstName"
                    value={guestInfo.firstName}
                    onChange={(e) => setGuestInfo((prev) => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Họ</Label>
                  <Input
                    id="lastName"
                    value={guestInfo.lastName}
                    onChange={(e) => setGuestInfo((prev) => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={guestInfo.email}
                  onChange={(e) => setGuestInfo((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={guestInfo.phone}
                  onChange={(e) => setGuestInfo((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="0123456789"
                  required
                />
              </div>
              <div>
                <Label htmlFor="requests">Yêu cầu đặc biệt (tùy chọn)</Label>
                <Textarea
                  id="requests"
                  value={guestInfo.specialRequests}
                  onChange={(e) => setGuestInfo((prev) => ({ ...prev, specialRequests: e.target.value }))}
                  placeholder="Ví dụ: Cần giường phụ, có trẻ em..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {currentStep === "payment" && (
            <div className="space-y-6">
              <h3 className="font-semibold text-lg">Thanh toán</h3>

              {/* Payment Methods */}
              <div>
                <Label className="text-base font-medium">Phương thức thanh toán</Label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as any)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2 p-3 border border-border rounded-md">
                    <RadioGroupItem value="vnpay" id="vnpay" />
                    <Label htmlFor="vnpay" className="flex-1">
                      <div className="flex items-center justify-between">
                        <span>VNPay</span>
                        <span className="text-sm text-muted-foreground">Thẻ ATM, Visa, MasterCard</span>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border border-border rounded-md">
                    <RadioGroupItem value="momo" id="momo" />
                    <Label htmlFor="momo" className="flex-1">
                      <div className="flex items-center justify-between">
                        <span>MoMo</span>
                        <span className="text-sm text-muted-foreground">Ví điện tử MoMo</span>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border border-border rounded-md">
                    <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                    <Label htmlFor="bank_transfer" className="flex-1">
                      <div className="flex items-center justify-between">
                        <span>Chuyển khoản ngân hàng</span>
                        <span className="text-sm text-muted-foreground">Chuyển khoản trực tiếp</span>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Booking Summary */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <h4 className="font-medium">Chi tiết đặt phòng</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Homestay</span>
                      <span className="font-medium">{property.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ngày</span>
                      <span>
                        {checkIn} - {checkOut}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Số đêm</span>
                      <span>{totalNights} đêm</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Số khách</span>
                      <span>{guests} khách</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span>Giá phòng ({totalNights} đêm)</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phí dịch vụ</span>
                      <span>{formatPrice(serviceFee)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Tổng cộng</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === "confirmation" && (
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h3 className="font-semibold text-xl">Đặt phòng thành công!</h3>
              <p className="text-muted-foreground">
                Cảm ơn bạn đã đặt phòng tại {property.title}. Chúng tôi đã gửi email xác nhận đến {guestInfo.email}.
              </p>
              <Card>
                <CardContent className="p-4 text-left">
                  <h4 className="font-medium mb-2">Thông tin đặt phòng</h4>
                  <div className="space-y-1 text-sm">
                    <div>
                      Mã đặt phòng: <span className="font-mono">{bookingId}</span>
                    </div>
                    <div>
                      Ngày: {checkIn} - {checkOut}
                    </div>
                    <div>Số khách: {guests} khách</div>
                    <div>Tổng tiền: {formatPrice(total)}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            {currentStep !== "dates" && currentStep !== "confirmation" && (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            )}

            {currentStep === "confirmation" ? (
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" onClick={() => (window.location.href = "/bookings")}>
                  Xem đặt phòng
                </Button>
                <Button onClick={handleClose}>Đóng</Button>
              </div>
            ) : (
              <Button
                onClick={handleNext}
                disabled={
                  (currentStep === "dates" && (!checkIn || !checkOut)) ||
                  (currentStep === "guests" &&
                    (!guestInfo.firstName || !guestInfo.lastName || !guestInfo.email || !guestInfo.phone)) ||
                  isLoading
                }
                className="ml-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : currentStep === "payment" ? (
                  "Thanh toán"
                ) : (
                  <>
                    Tiếp tục
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
