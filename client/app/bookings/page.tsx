"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { BookingService } from "@/lib/booking-service"
import { RoomService } from "@/lib/room-service"
import type { Room } from "@/types/property"
import type { Booking, RoomBookingData } from "@/types/booking"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RainbowButton } from "@/components/ui/rainbow-button"
import { toast } from "sonner"
import { QRCodeCanvas } from "qrcode.react"
import { motion } from "framer-motion"
import { Loader2, Ticket, Calendar, Moon, Users, Home, Hash, AlertCircle, CreditCard, MapPin } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { formatPrice } from "@/lib/utils"
import { DatePickerWithRange } from "@/components/date-picker"
import { DateRange } from "react-day-picker"
import { addDays, differenceInCalendarDays } from "date-fns"

function NewBookingFlow({ roomIds }: { roomIds: string[] }) {
  const { user } = useAuth()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 1),
  })
  const [guests, setGuests] = useState(1)

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true)
      try {
        const fetchedRooms = await RoomService.getRoomsByIds(roomIds)
        setRooms(fetchedRooms)
      } catch (error) {
        toast.error("Could not load room details.")
      } finally {
        setLoading(false)
      }
    }
    fetchRooms()
  }, [roomIds])

  const totalNights = useMemo(() => {
    if (date?.from && date?.to) {
      return differenceInCalendarDays(date.to, date.from)
    }
    return 0
  }, [date])

  const totalPrice = useMemo(() => {
    const totalRoomPrice = rooms.reduce((acc, room) => acc + room.pricePerNight, 0)
    return totalRoomPrice * totalNights
  }, [rooms, totalNights])

  const handleConfirmBooking = async () => {
    if (!user || !date?.from || !date?.to || rooms.length === 0) {
      toast.error("Please fill in all booking details.")
      return
    }

    // In a real app, you would check for availability here.
    // This is a simplified version.
    try {
      for (const room of rooms) {
        const homestayDoc = await getDoc(doc(db, "homestays", room.homestayId));
        if (!homestayDoc.exists()) {
            toast.error(`Could not find details for the homestay associated with ${room.roomName}.`);
            continue;
        }
        const hostId = homestayDoc.data().hostId;

        const bookingData: RoomBookingData = {
          userId: user.id,
          roomId: room.id,
          homestayId: room.homestayId,
          checkInDate: date.from,
          checkOutDate: date.to,
          guests,
          totalPrice: room.pricePerNight * totalNights,
          status: "pending",
          roomName: room.roomName,
          totalNights: totalNights,
          pricePerNight: room.pricePerNight,
          hostId: hostId,
        };
        await BookingService.createRoomBooking(bookingData, { name: user.name, email: user.email }, room);
      }
      toast.success("Booking successful! Please proceed to payment.")
      // Redirect to the bookings page without query params
      window.location.href = "/bookings"
    } catch (error) {
      console.error("Booking failed:", error)
      toast.error("Booking failed. Please try again.")
    }
  }

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Confirm Your Booking</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Selected Rooms</h3>
          <div className="space-y-2">
            {rooms.map(room => (
              <div key={room.id} className="flex justify-between items-center p-2 border rounded-md">
                <span>{room.roomName}</span>
                <span>{formatPrice(room.pricePerNight)} / night</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Select Dates</h3>
          <DatePickerWithRange date={date} onDateChange={setDate} />
        </div>
        <div>
          <h3 className="font-semibold mb-2">Number of Guests</h3>
          <input
            type="number"
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            min="1"
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div className="text-right font-bold text-xl">
          <p>Total Nights: {totalNights}</p>
          <p>Total Price: {formatPrice(totalPrice)}</p>
        </div>
      </CardContent>
      <CardFooter>
        <RainbowButton className="w-full" onClick={handleConfirmBooking} color="#059669">
          Confirm and Book
        </RainbowButton>
      </CardFooter>
    </Card>
  )
}

function PaymentModal({ booking, isOpen, onClose }: { booking: Booking | null, isOpen: boolean, onClose: () => void }) {
  const [paymentMethod, setPaymentMethod] = useState("pay_at_homestay")

  if (!booking) return null

  const handlePayment = () => {
    toast.info(`Thanh toán cho đơn ${booking.id} bằng ${paymentMethod} đang được xử lý...`)
    // Payment logic to be implemented here
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chọn phương thức thanh toán</DialogTitle>
          <DialogDescription>
            Chọn một phương thức để thanh toán cho đơn đặt phòng #{booking.id}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            <div className="flex items-center space-x-2 p-3 border rounded-md">
              <RadioGroupItem value="pay_at_homestay" id="pay_at_homestay" />
              <Label htmlFor="pay_at_homestay">Thanh toán tại homestay</Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-md">
              <RadioGroupItem value="vnpay" id="vnpay" />
              <Label htmlFor="vnpay">VNPay</Label>
            </div>
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <RainbowButton onClick={handlePayment} color="#059669">Xác nhận</RainbowButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function MyBookingsContent() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const searchParams = useSearchParams()
  const roomIdsToBook = searchParams.get("rooms")

  useEffect(() => {
    if (roomIdsToBook) return // Don't fetch old bookings if we are in booking mode

    const fetchBookings = async () => {
      if (user?.id) {
        try {
          const userBookings = await BookingService.getUserBookings(user.id)
          setBookings(userBookings)
        } catch (error) {
          console.error("Failed to fetch bookings:", error)
          toast.error("Không thể tải danh sách đặt phòng. Vui lòng tạo chỉ mục Firestore theo hướng dẫn.")
        } finally {
          setLoading(false)
        }
      } else if (!authLoading) {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [user, authLoading, roomIdsToBook])

  if (roomIdsToBook) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <NewBookingFlow roomIds={roomIdsToBook.split(",")} />
        </main>
        <Footer />
      </div>
    )
  }

  const filteredBookings = useMemo(() => {
    if (filterStatus === "all") {
      return bookings
    }
    if (filterStatus === "paid") {
      return bookings.filter(b => b.status === "confirmed" || b.status === "paid")
    }
    if (filterStatus === "unpaid") {
      return bookings.filter(b => b.status === "pending" || b.status === "unpaid")
    }
    return bookings
  }, [bookings, filterStatus])

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "confirmed":
      case "paid":
        return "default"
      case "pending":
      case "unpaid":
        return "secondary"
      case "cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  const handleOpenPaymentModal = (booking: Booking) => {
    setSelectedBooking(booking)
    setPaymentModalOpen(true)
  }

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-yellow-500" />
          <h1 className="mt-4 text-2xl font-bold">Vui lòng đăng nhập</h1>
          <p className="mt-2 text-muted-foreground">Bạn cần đăng nhập để xem các đặt phòng của mình.</p>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Các chuyến đi của tôi</h1>
          <p className="text-muted-foreground mt-1">Xem lại và quản lý các đặt phòng sắp tới và đã qua của bạn.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tổng số đơn đặt</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{bookings.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Chưa thanh toán</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-orange-600">
                {bookings.filter(b => b.status === 'unpaid' || b.status === 'pending').length}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <Button variant={filterStatus === 'all' ? 'default' : 'outline'} onClick={() => setFilterStatus('all')}>Tất cả</Button>
          <Button variant={filterStatus === 'paid' ? 'default' : 'outline'} onClick={() => setFilterStatus('paid')}>Đã thanh toán</Button>
          <Button variant={filterStatus === 'unpaid' ? 'default' : 'outline'} onClick={() => setFilterStatus('unpaid')}>Chưa thanh toán</Button>
        </div>
        
        {filteredBookings.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Ticket className="mx-auto h-12 w-12 text-gray-400" />
              <h2 className="mt-4 text-xl font-semibold">Không có đặt phòng nào</h2>
              <p className="mt-2 text-gray-600">
                {filterStatus === 'all' ? 'Thời gian để bắt đầu lên kế hoạch cho chuyến phiêu lưu tiếp theo của bạn!' : 'Không có đặt phòng nào phù hợp với bộ lọc này.'}
              </p>
              {filterStatus === 'all' && (
                <Button asChild className="mt-6">
                  <Link href="/rooms">Bắt đầu khám phá</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <motion.div
            className="space-y-6"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
          >
            {filteredBookings.map((booking) => (
              <motion.div key={booking.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-3">
                    <div className="md:col-span-1">
                    <img
                      className="h-full w-full object-cover"
                      src={booking.propertyImage || "/placeholder.jpg"}
                      alt={booking.propertyTitle}
                    />
                  </div>
                  <div className="md:col-span-2 flex flex-col">
                    <CardContent className="p-6 flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-primary">{booking.homestayName || "Homestay"}</p>
                          <h2 className="text-2xl font-bold tracking-tight">{booking.roomName || "Phòng"}</h2>
                          <p className="text-sm text-muted-foreground flex items-center mt-1">
                            <MapPin className="h-4 w-4 mr-1.5" />
                            {booking.propertyTitle}
                          </p>
                        </div>
                        <Badge variant={getStatusVariant(booking.status)} className="capitalize">
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-4 mt-4 text-sm">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          <span>Nhận phòng: <strong>{new Date(booking.checkInDate.seconds * 1000).toLocaleDateString("vi-VN")}</strong></span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          <span>Trả phòng: <strong>{new Date(booking.checkOutDate.seconds * 1000).toLocaleDateString("vi-VN")}</strong></span>
                        </div>
                        <div className="flex items-center">
                          <Moon className="h-4 w-4 mr-2 text-gray-500" />
                          <span>Số đêm: <strong>{booking.totalNights}</strong></span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-gray-500" />
                          <span>Số khách: <strong>{booking.guests}</strong></span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-gray-50 p-4 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <QRCodeCanvas
                          value={`${window.location.origin}/booking-details/${booking.id}`}
                          size={64}
                          bgColor={"#f9fafb"}
                          fgColor={"#111827"}
                        />
                        <div className="text-xs text-muted-foreground">
                          <p>Mã đặt phòng:</p>
                          <p className="font-mono">{booking.id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">Tổng cộng</p>
                        <p className="text-xl font-bold text-primary">{formatPrice(booking.totalPrice)}</p>
                      </div>
                      {booking.status === "unpaid" && (
                        <Button onClick={() => handleOpenPaymentModal(booking)} size="lg">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Thanh toán ngay
                        </Button>
                      )}
                    </CardFooter>
                  </div>
                </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
      <Footer />
      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setPaymentModalOpen(false)} 
        booking={selectedBooking} 
      />
    </div>
  )
}

export default function MyBookingsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <MyBookingsContent />
    </Suspense>
  )
}
