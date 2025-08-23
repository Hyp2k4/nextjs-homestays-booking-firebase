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
          status: "unpaid", // Thay đổi từ "pending" thành "unpaid"
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

  // Hàm xử lý khi thanh toán thành công
  const handlePaymentSuccess = (bookingId: string, newStatus: string) => {
    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId ? { ...b, status: newStatus } : b
      )
    );
  };

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
      return bookings.filter(b => b.status === "paid") // Chỉ lọc paid
    }
    if (filterStatus === "unpaid") {
      return bookings.filter(b => b.status === "unpaid") // Chỉ lọc unpaid
    }
    if (filterStatus === "pending") {
      return bookings.filter(b => b.status === "pending") // Thêm filter pending
    }
    return bookings
  }, [bookings, filterStatus])

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "paid":
        return "default" // Màu xanh cho đã thanh toán
      case "unpaid":
        return "destructive" // Màu đỏ cho chưa thanh toán
      case "pending":
        return "secondary" // Màu xám cho chờ xử lý
      case "confirmed":
        return "default" // Màu xanh cho đã xác nhận
      case "cancelled":
        return "destructive" // Màu đỏ cho đã hủy
      default:
        return "outline"
    }
  }

  const getStatusText = (status: string): string => {
    switch (status) {
      case "paid": return "Paid"
      case "unpaid": return "Unpaid"
      case "pending": return "Pending"
      case "confirmed": return "Confirmed"
      case "cancelled": return "Cancelled"
      default: return status
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
              <CardTitle className="text-sm font-medium">Unpaid</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">
                {bookings.filter(b => b.status === 'unpaid').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-amber-600">
                {bookings.filter(b => b.status === 'pending').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {bookings.filter(b => b.status === 'paid').length}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <Button variant={filterStatus === 'all' ? 'default' : 'outline'} onClick={() => setFilterStatus('all')} className="mb-2 sm:mb-0">Tất cả</Button>
          <Button variant={filterStatus === 'unpaid' ? 'default' : 'outline'} onClick={() => setFilterStatus('unpaid')} className="mb-2 sm:mb-0">Unpaid</Button>
          <Button variant={filterStatus === 'pending' ? 'default' : 'outline'} onClick={() => setFilterStatus('pending')} className="mb-2 sm:mb-0">Pending</Button>
          <Button variant={filterStatus === 'paid' ? 'default' : 'outline'} onClick={() => setFilterStatus('paid')} className="mb-2 sm:mb-0">Paid</Button>
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
                <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 p-0">
                  <div className="grid grid-cols-1 md:grid-cols-3">
                    <div className="md:col-span-1">
                      <img
                        className="h-48 w-full md:h-full object-cover"
                        src={booking.propertyImage || "/placeholder.jpg"}
                        alt={booking.propertyTitle}
                      />
                    </div>
                    <div className="md:col-span-2 flex flex-col">
                      <CardContent className="p-4 md:p-6 flex-grow">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-primary">{booking.homestayName || "Homestay"}</p>
                            <h2 className="text-xl md:text-2xl font-bold tracking-tight">{booking.roomName || "Phòng"}</h2>
                            <p className="text-sm text-muted-foreground flex items-center mt-1">
                              <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
                              <span className="truncate">{booking.propertyTitle}</span>
                            </p>
                          </div>
                          <Badge variant={getStatusVariant(booking.status)} className="capitalize self-start sm:self-auto">
                            {getStatusText(booking.status)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mt-4 text-sm">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                            <span className="truncate">
                              Nhận phòng:{" "}
                              <strong>
                                {new Date(booking.checkInDate).toLocaleString("vi-VN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                })}
                              </strong>
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                            <span className="truncate">
                              Trả phòng:{" "}
                              <strong>
                                {new Date(booking.checkOutDate).toLocaleString("vi-VN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                })}
                              </strong>
                            </span>
                          </div>

                          <div className="flex items-center">
                            <Moon className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                            <span>Số đêm: <strong>{booking.totalNights}</strong></span>
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                            <span>Số khách: <strong>{booking.guests}</strong></span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="bg-gray-50 p-3 md:p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
                          <QRCodeCanvas
                            value={`${window.location.origin}/booking-details/${booking.id}`}
                            size={56}
                            bgColor={"#f9fafb"}
                            fgColor={"#111827"}
                            className="hidden xs:block"
                          />
                          <div className="text-xs text-muted-foreground text-center sm:text-left">
                            <p>Mã đặt phòng:</p>
                            <p className="font-mono text-xs">{booking.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                        <div className="text-center sm:text-right">
                          <p className="text-sm">Tổng cộng</p>
                          <p className="text-lg md:text-xl font-bold text-primary">{formatPrice(booking.totalPrice)}</p>
                        </div>
                        {(booking.status === "unpaid" || booking.status === "pending") && (
                          <Button
                            onClick={() => handleOpenPaymentModal(booking)}
                            size="lg"
                            className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md hover:shadow-lg transition-all px-4 py-2 text-sm md:text-base"
                          >
                            <CreditCard className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                            <span className="hidden xs:inline">Thanh toán ngay</span>
                            <span className="xs:hidden">Thanh toán</span>
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
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  )
}

// PaymentModal component với responsive hoàn chỉnh
function PaymentModal({
  booking,
  isOpen,
  onClose,
  onPaymentSuccess
}: {
  booking: Booking | null,
  isOpen: boolean,
  onClose: () => void,
  onPaymentSuccess?: (bookingId: string, status: string) => void
}) {
  const [paymentMethod, setPaymentMethod] = useState("pay_at_homestay");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!booking) return null;

  const handlePayment = async (method: string) => {
    if (!booking) return;

    setIsProcessing(true);

    try {
      if (method === "pay_at_homestay") {
        if (onPaymentSuccess) {
          onPaymentSuccess(booking.id, "pending");
        }
        toast.success("Đơn đặt phòng đã chuyển sang trạng thái Pending (pay at homestay).");
      } else if (method === "vnpay") {
        toast.success("Chuyển tới VNPay để thanh toán.");
        setTimeout(() => {
          if (onPaymentSuccess) {
            onPaymentSuccess(booking.id, "paid");
            toast.success("Thanh toán VNPay thành công!");
          }
          setIsProcessing(false);
        }, 2000);
        return;
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xử lý thanh toán.");
      console.error(error);
    }

    setIsProcessing(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-lg mx-4 sm:mx-0">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-bold text-center text-gray-800">
            Phương thức thanh toán
          </DialogTitle>
          <DialogDescription className="text-center text-sm sm:text-base">
            Chọn phương thức thanh toán cho đơn #{booking.id.slice(0, 8)}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            <div className="flex items-center space-x-3 p-3 sm:p-4 border rounded-lg hover:bg-accent/5 transition-colors cursor-pointer">
              <RadioGroupItem value="pay_at_homestay" id="pay_at_homestay" className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
              <Label htmlFor="pay_at_homestay" className="flex-1 cursor-pointer">
                <div className="font-medium text-sm sm:text-base">Thanh toán tại homestay</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Trả tiền mặt khi nhận phòng</div>
              </Label>
              <div className="bg-gray-100 p-1 sm:p-2 rounded-md hidden xs:block">
                <Home className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 sm:p-4 border rounded-lg hover:bg-accent/5 transition-colors cursor-pointer">
              <RadioGroupItem value="vnpay" id="vnpay" className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              <Label htmlFor="vnpay" className="flex-1 cursor-pointer">
                <div className="font-medium text-sm sm:text-base">VNPay</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Thanh toán online qua VNPay</div>
              </Label>
              <div className="bg-blue-50 p-1 sm:p-2 rounded-md hidden xs:block">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter className="flex flex-col-reverse xs:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 h-10 sm:h-11 border-gray-300 hover:bg-gray-100 order-2 xs:order-1"
            disabled={isProcessing}
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={() => handlePayment(paymentMethod)}
            className="flex-1 h-10 sm:h-11 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md hover:shadow-lg transition-all order-1 xs:order-2"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                <span className="text-xs sm:text-sm">Đang xử lý...</span>
              </>
            ) : (
              <>
                <CreditCard className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Xác nhận thanh toán</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
export default function MyBookingsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <MyBookingsContent />
    </Suspense>
  )
}
