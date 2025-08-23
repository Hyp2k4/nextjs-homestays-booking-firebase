"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { RainbowButton } from "@/components/ui/rainbow-button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PropertyService } from "@/lib/property-service"
import { BookingService } from "@/lib/booking-service"
import { VoucherService } from "@/lib/voucher-service"
import { UserService } from "@/lib/user-service"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import type { Property, Room } from "@/types/property"
import type { User } from "@/types/auth";
import type { Voucher } from "@/types/voucher"
import { ReviewForm } from "@/components/review-form"
import { ReviewService } from "@/lib/review-service"
import type { Review } from "@/types/review"
import { ReviewsList } from "@/components/reviews-list"
import { formatPrice, formatPhoneNumber, formatTimeRemaining } from "@/lib/utils"
import {
  Star,
  MapPin,
  Users,
  Bed,
  Wifi,
  Car,
  FishIcon as Swimming,
  Dumbbell,
  Eye,
  Calendar,
  ArrowLeft,
  Share,
  Heart,
  Mail,
  Phone,
  Tv,
  Wind,
  Utensils,
  Refrigerator,
  ParkingCircle,
  Mountain,
  Waves,
  MessageSquare,
  AlarmClock,
} from "lucide-react"
import { SuggestedProperties } from "@/components/suggested-properties"
import { useIsDesktop } from "@/hooks/use-desktop"
import { chatService } from "@/lib/chat-service"
import type { Chat } from "@/types/chat"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChatWindow } from "@/components/chat/chat-window"
import { LoginModal } from "@/components/auth/login-modal";
import { DateTimeRangePicker } from "@/components/ui/date-time-picker"

export default function RoomDetailPage() {
  const isDesktop = useIsDesktop()
  const params = useParams()
  const router = useRouter()
  const [room, setRoom] = useState<Room | null>(null)
  const [homestay, setHomestay] = useState<Property | null>(null)
  const [host, setHost] = useState<User | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [checkIn, setCheckIn] = useState<Date>()
  const [checkOut, setCheckOut] = useState<Date>()
  const [guests, setGuests] = useState(2)
  const [loading, setLoading] = useState(true)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [guestEmail, setGuestEmail] = useState("")
  const { user, isAuthenticated, toggleRoomWishlist } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [isInWishlist, setIsInWishlist] = useState(
    user?.roomWishlist?.includes(params?.id as string) ?? false,
  )
  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [userVouchers, setUserVouchers] = useState<Voucher[]>([])
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [tempCheckIn, setTempCheckIn] = useState<Date | undefined>(checkIn)
  const [tempCheckOut, setTempCheckOut] = useState<Date | undefined>(checkOut)
  const [voucherInput, setVoucherInput] = useState(""); // Mã nhập tay
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null); // Voucher áp dụng
  const [allVouchers, setAllVouchers] = useState<Voucher[]>([]);

  useEffect(() => {
    setIsInWishlist(user?.roomWishlist?.includes(params?.id as string) ?? false)
  }, [user?.roomWishlist, params?.id])
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const vouchers = await VoucherService.getAllVouchers(); // API lấy tất cả voucher
        setAllVouchers(vouchers);
      } catch (error) {
        console.error("Failed to fetch vouchers", error);
      }
    };
    fetchVouchers();
  }, []);
  const handleToggleWishlist = async () => {
    const roomId = params?.id as string
    console.log("Toggling wishlist for room:", roomId);
    if (!user || !toggleRoomWishlist) {
      console.log("User not logged in or toggle function not available.");
      toast.error("Please log in to add rooms to your wishlist.")
      return
    }

    setIsInWishlist(!isInWishlist) // Optimistic update
    const result = await toggleRoomWishlist(roomId)
    console.log("Wishlist toggle result:", result);
    if (!result.success) {
      setIsInWishlist(isInWishlist) // Revert on error
      toast.error(result.error || "Failed to update wishlist.")
    } else {
      toast.success(
        result.inWishlist
          ? "Added to your wishlist!"
          : "Removed from your wishlist.",
      )
    }
  }

  useEffect(() => {
    const id = params?.id as string
    if (!id) return

    // Set up a real-time listener for reviews
    const unsubscribe = ReviewService.listenForReviews(id, (updatedReviews) => {
      setReviews(updatedReviews)
    })

    const run = async () => {
      const id = params?.id
      if (!id) {
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const { room: roomData, homestay: homestayData } = await PropertyService.getRoomById(id as string)
        setRoom(roomData)
        setHomestay(homestayData)
        if (homestayData?.hostId) {
          const hostData = await UserService.getUserById(homestayData.hostId)
          setHost(hostData)
        }
        if (user) {
          const vouchers = await VoucherService.getMyVouchers(user.id)
          setUserVouchers(vouchers)
        }
      } catch (error) {
        console.error("Failed to fetch room details:", error)
        toast.error("Không thể tải thông tin phòng.")
      } finally {
        setLoading(false)
      }
    }
    run()

    // Cleanup listener on component unmount
    return () => unsubscribe()
  }, [params?.id, user])

  useEffect(() => {
    const checkAvailability = async () => {
      if (checkIn && checkOut && room) {
        const available = await BookingService.isRoomAvailable(
          room.id,
          checkIn.toISOString(),
          checkOut.toISOString()
        );
        setIsAvailable(available);
        if (available) {
          toast.success("Phòng trống trong khoảng thời gian đã chọn!");
        } else {
          toast.error("Phòng đã được đặt trong khoảng thời gian này.");
        }
      }
    };
    checkAvailability();
  }, [checkIn, checkOut, room]);


  if (loading || isDesktop === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
      </div>
    )
  }
  const handleApplyVoucher = () => {
    // tìm voucher trong danh sách tất cả voucher (không giới hạn user)
    const voucher = allVouchers.find(v => v.code.toUpperCase() === voucherInput.toUpperCase());
    if (voucher) {
      setAppliedVoucher(voucher);
      toast.success(`Áp dụng voucher ${voucher.code} thành công!`);
    } else {
      setAppliedVoucher(null);
      toast.error("Voucher không hợp lệ");
    }
  };

  if (!room) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="font-serif font-bold text-2xl mb-4">Không tìm thấy phòng</h1>
            <RainbowButton onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </RainbowButton>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const amenityMap: { [key: string]: { name: string; icon: React.ElementType } } = {
    wifi: { name: "Wifi", icon: Wifi },
    ac: { name: "Air Condition", icon: Wind },
    tv: { name: "Television", icon: Tv },
    kitchen: { name: "Kitchen", icon: Utensils },
    fridge: { name: "Fridge", icon: Refrigerator },
    parking: { name: "Parking", icon: ParkingCircle },
    pool: { name: "Swimming Pool", icon: Swimming },
    gym: { name: "Gym", icon: Dumbbell },
    mountain_view: { name: "Mountain View", icon: Mountain },
    sea_view: { name: "Sea View", icon: Waves },
  }



  const handleChatWithHost = async () => {
    if (!user) {
      toast.error("Please log in to chat with the host.")
      return
    }
    if (!host) {
      toast.error("Host information is not available.")
      return
    }
    if (user.id === host.id) {
      toast.info("You cannot start a chat with yourself.")
      return
    }

    const chat = await chatService.findOrCreateChat(
      user.id,
      user.name || "Guest",
      user.avatar || "",
      host.id,
      host.name || "Host",
      host.avatar || "",
    )

    if (chat) {
      setActiveChat(chat)
    } else {
      toast.error("Could not start chat. Please try again.")
    }
  }

  const handleBookNow = async () => {
    if (!checkIn || !checkOut) {
      toast.error("Vui lòng chọn ngày nhận và trả phòng.");
      return;
    }
    if (!user) {
      toast.error("Please login to book our room", {
        action: {
          label: "Login",
          onClick: () => setIsLoginModalOpen(true),
        },
      });
      return;
    }

    setLoading(true);
    try {
      const totalNights = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) /
        (1000 * 60 * 60 * 24)
      );
      let totalPrice = room.pricePerNight * totalNights;

      if (appliedVoucher) {
        if (appliedVoucher.discountType === "percentage") {
          totalPrice -= totalPrice * (appliedVoucher.discountValue / 100);
        } else {
          totalPrice -= appliedVoucher.discountValue;
        }
      }
      const bookingData = {
        userId: user.id,
        roomId: room.id,
        homestayId: room.homestayId,
        checkInDate: checkIn.toISOString(),
        checkOutDate: checkOut.toISOString(),
        guests,
        totalPrice,
        status: "pending" as const,
        roomName: room.roomName,
        totalNights,
        pricePerNight: room.pricePerNight,
        hostId: homestay.hostId,
        paymentMethod: "pay_at_homestay",
      };

      // ✅ Gọi createRoomBooking (có check available trong service)
      const result = await BookingService.createRoomBooking(
        bookingData,
        { name: user.name, email: user.email },
        room,
        selectedVoucher?.id
      );

      if (result.success && result.bookingId) {
        toast.success("Đặt phòng thành công! Đang gửi email xác nhận...");

        // Gửi email xác nhận
        fetch("/api/send-booking-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: user.email,
            bookingId: result.bookingId,
            bookingDetails: {
              userName: user.name,
              userEmail: user.email,
              userPhone: user.phone,
              roomName: room.roomName,
              location: homestay?.address,
              phone: host?.phone,
              checkInDate: bookingData.checkInDate,
              checkOutDate: bookingData.checkOutDate,
              totalPrice: bookingData.totalPrice,
              guests: bookingData.guests,
              voucherCode: selectedVoucher?.code,
              discountAmount: selectedVoucher
                ? selectedVoucher.discountType === "percentage"
                  ? room.pricePerNight *
                  totalNights *
                  (selectedVoucher.discountValue / 100)
                  : selectedVoucher.discountValue
                : 0,
            },
          }),
        }).catch((err) => console.error("Failed to send email:", err));

        router.push("/bookings");
      } else {
        // ❌ Không khả dụng
        toast.error(result.error || "Phòng không khả dụng trong khoảng thời gian đã chọn.");
      }
    } catch (error) {
      console.error("Booking failed:", error);
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookNowMobile = async () => {
    if (!tempCheckIn || !tempCheckOut) {
      toast.error("Vui lòng chọn ngày nhận và trả phòng.");
      return;
    }
    // đồng bộ tempCheckIn/tempCheckOut vào checkIn/checkOut
    setCheckIn(tempCheckIn);
    setCheckOut(tempCheckOut);

    await handleBookNow();
  };


  // --- Bên trong RoomDetailPage, trước return ---
  const totalNights = checkIn && checkOut
    ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const roomTotal = room ? room.pricePerNight * totalNights : 0;

  const serviceFee = 50000;

  const discount = selectedVoucher
    ? selectedVoucher.discountType === "percentage"
      ? roomTotal * (selectedVoucher.discountValue / 100)
      : selectedVoucher.discountValue
    : 0;

  const totalPrice = roomTotal + serviceFee - discount;


  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className={`container mx-auto px-4 py-8 ${!isDesktop ? "pb-24" : ""}`}>
        {/* Back Button */}
        <Button variant="ghost" className="mb-4" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        {/* Room Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-serif font-bold text-3xl text-foreground mb-2">{room.roomName}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{homestay?.address}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Chia sẻ
            </Button>
            {user && (
              <Button variant="outline" size="sm" onClick={handleToggleWishlist} className="hover:bg-transparent">
                <Heart
                  className={`h-4 w-4 mr-2 ${isInWishlist ? "text-red-500 fill-red-500" : ""
                    }`}
                />
                {isInWishlist ? "Đã yêu thích" : "Yêu thích"}
              </Button>
            )}
          </div>
        </div>

        <div className={isDesktop ? "grid grid-cols-1 xl:grid-cols-3 gap-8" : ""}>
          {/* Left Column - Images and Details */}
          <div className={isDesktop ? "xl:col-span-2 space-y-8" : "space-y-8"}>
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                <Image
                  src={room.images[currentImageIndex] || "/placeholder.svg"}
                  alt={room.roomName}
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-md text-sm">
                  {currentImageIndex + 1} / {room.images.length}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {room.images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-square rounded-md overflow-hidden ${index === currentImageIndex ? "ring-2 ring-primary" : ""
                      }`}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${room.roomName} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Room Info */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif font-semibold text-xl mb-2">Phòng tại {homestay?.name}</h2>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {room.capacity} khách
                    </span>
                    <span className="flex items-center gap-1">
                      <Bed className="h-4 w-4" />
                      {room.roomType}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="font-semibold text-lg mb-3">Mô tả</h3>
                <p className="text-muted-foreground leading-relaxed">{room.description}</p>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="font-semibold text-lg mb-4">Tiện nghi</h3>
                <div className="grid grid-cols-2 gap-3">
                  {homestay?.amenities &&
                    Object.entries(homestay.amenities)
                      .filter(([, value]) => value)
                      .map(([key]) => {
                        const amenity = amenityMap[key]
                        if (!amenity) return null
                        const Icon = amenity.icon
                        return (
                          <div key={key} className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span className="text-sm">{amenity.name}</span>
                          </div>
                        )
                      })}
                </div>
              </div>

              {room.rules && room.rules.length > 0 && (
                <div className="border-t border-border pt-6">
                  <h3 className="font-semibold text-lg mb-3">Nội quy phòng</h3>
                  <ul className="list-none space-y-2">
                    {room.rules.map((rule: string, index: number) => (
                      <li key={index} className="text-muted-foreground">
                        +) {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {host && (
                <div className="border-t border-border pt-6">
                  <h3 className="font-semibold text-lg mb-4">Thông tin chủ nhà</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={host.avatar || "/placeholder.svg"} alt={host.name} />
                        <AvatarFallback>{host.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{host.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {host.email}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {host.phone ? formatPhoneNumber(host.phone) : "Chưa cập nhật"}
                        </div>
                      </div>
                    </div>
                    {user && user.id !== host.id && (
                      <Button onClick={handleChatWithHost}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Chat với host
                      </Button>
                    )}
                  </div>
                </div>
              )}

              <div className="border-t border-border pt-6">
                <SuggestedProperties type="room" />
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="font-semibold text-lg mb-3">Đánh giá</h3>
                <ReviewsList reviews={reviews} loading={loading} hostId={homestay?.hostId} />
              </div>

              <div className="border-t border-border pt-6">
                <ReviewForm
                  propertyId={room.homestayId}
                  roomId={room.id}
                  onReviewSubmit={() => {
                    // No need to manually refetch, listener will handle it
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          {isDesktop && (
            <div className="xl:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6 space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{formatPrice(room.pricePerNight)}</div>
                    <div className="text-sm text-muted-foreground">/ đêm</div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-sm font-medium">Nhận phòng</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                              <Calendar className="mr-2 h-4 w-4" />
                              {tempCheckIn ? tempCheckIn.toLocaleString() : <span>Chọn ngày nhận phòng</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <DateTimeRangePicker
                              checkIn={tempCheckIn}
                              checkOut={tempCheckOut}
                              onChange={({ checkIn, checkOut }) => {
                                setTempCheckIn(checkIn)
                                setTempCheckOut(checkOut)

                                // Đồng bộ với state chính để trigger check availability
                                setCheckIn(checkIn)
                                setCheckOut(checkOut)
                              }}
                            />

                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Trả phòng</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                              <Calendar className="mr-2 h-4 w-4" />
                              {tempCheckOut ? tempCheckOut.toLocaleString() : <span>Chọn ngày trả phòng</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <DateTimeRangePicker
                              checkIn={tempCheckIn}
                              checkOut={tempCheckOut}
                              onChange={({ checkIn, checkOut }) => {
                                setTempCheckIn(checkIn)
                                setTempCheckOut(checkOut)

                                // Đồng bộ với state chính để trigger check availability
                                setCheckIn(checkIn)
                                setCheckOut(checkOut)
                              }}
                            />

                          </PopoverContent>
                        </Popover>

                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Số khách</label>
                      <input
                        type="number"
                        value={guests}
                        onChange={(e) => setGuests(Math.min(10, Number.parseInt(e.target.value)))}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
                        min={1}
                        max={10}
                      />
                    </div>

                    {userVouchers.length > 0 && (
                      <div className="mb-3">
                        <Select
                          value={selectedVoucher?.id}
                          onValueChange={(voucherId) => {
                            const voucher = userVouchers.find((v) => v.id === voucherId);
                            setSelectedVoucher(voucher || null);
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn voucher">
                              {selectedVoucher && selectedVoucher.code}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="w-96 rounded-lg shadow-lg">
                            {userVouchers.map((voucher) => (
                              <SelectItem key={voucher.id} value={voucher.id}>
                                {voucher.code} - {voucher.discountType === "percentage" ? `${voucher.discountValue}% OFF` : `${formatPrice(voucher.discountValue)} OFF`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                  </div>

                  <RainbowButton className="w-full" onClick={handleBookNow} disabled={!isAvailable}>
                    <div className="flex items-center justify-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Now
                    </div>
                  </RainbowButton>

                  <div className="text-center text-sm text-muted-foreground">Bạn chưa bị tính phí</div>

                  {checkIn && checkOut && (
                    <div className="border-t border-border pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Giá phòng x {totalNights} đêm</span>
                        <span>{formatPrice(roomTotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Phí dịch vụ</span>
                        <span>{formatPrice(serviceFee)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Discount ({selectedVoucher?.code})</span>
                          <span>-{formatPrice(discount)}</span>
                        </div>
                      )}
                      <div className="border-t border-border pt-2 flex justify-between font-semibold">
                        <span>Tổng cộng</span>
                        <span>{formatPrice(totalPrice)}</span>
                      </div>
                    </div>
                  )}

                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Booking Drawer */}
      {!isDesktop && (
        <div>
          {!isAuthenticated ? (
            <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 shadow-lg z-10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-lg">{formatPrice(room.pricePerNight)}</div>
                  <div className="text-sm text-muted-foreground">/ đêm</div>
                </div>
                <RainbowButton onClick={() => setIsLoginModalOpen(true)}>Sign In to Book</RainbowButton>
              </div>
            </div>
          ) : (
            <Drawer>
              <DrawerTrigger asChild>
                <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 shadow-lg z-10">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-lg">{formatPrice(room.pricePerNight)}</div>
                      <div className="text-sm text-muted-foreground">/ đêm</div>
                    </div>
                    <RainbowButton>Đặt phòng</RainbowButton>
                  </div>
                </div>
              </DrawerTrigger>

              <DrawerContent className="p-4">
                <DrawerHeader className="text-left">
                  <DrawerTitle>Thông tin đặt phòng</DrawerTitle>
                  <DrawerDescription>Chọn ngày và số lượng khách.</DrawerDescription>
                </DrawerHeader>

                <div className="space-y-3 px-4">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Check-in */}
                    <div>
                      <label className="text-sm font-medium">Nhận phòng</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                            <Calendar className="mr-2 h-4 w-4" />
                            {tempCheckIn ? tempCheckIn.toLocaleString() : <span>Chọn ngày nhận phòng</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <DateTimeRangePicker
                            checkIn={checkIn}
                            checkOut={checkOut}
                            onChange={({ checkIn, checkOut }) => {
                              setCheckIn(checkIn)
                              setCheckOut(checkOut)
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Check-out */}
                    <div>
                      <label className="text-sm font-medium">Trả phòng</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                            <Calendar className="mr-2 h-4 w-4" />
                            {tempCheckOut ? tempCheckOut.toLocaleString() : <span>Chọn ngày trả phòng</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <DateTimeRangePicker
                            checkIn={checkIn}
                            checkOut={checkOut}
                            onChange={({ checkIn, checkOut }) => {
                              setCheckIn(checkIn)
                              setCheckOut(checkOut)
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Guests */}
                  <div>
                    <label className="text-sm font-medium">Số khách</label>
                    <input
                      type="number"
                      value={guests}
                      onChange={(e) => setGuests(Math.min(10, Number.parseInt(e.target.value)))}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
                      min={1}
                      max={10}
                    />
                  </div>

                  {userVouchers.length > 0 && (
                    <div className="mb-3">
                      <label className="text-sm font-medium">Voucher</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={voucherInput}
                          onChange={(e) => setVoucherInput(e.target.value)}
                          placeholder="Nhập mã voucher"
                          className="w-full px-3 py-2 border rounded-md"
                        />
                        <button
                          onClick={handleApplyVoucher}
                          className="px-4 py-2 bg-primary text-white rounded-md"
                        >
                          Áp dụng
                        </button>
                      </div>

                      <Select
                        value={selectedVoucher?.id}
                        onValueChange={(voucherId) => {
                          const voucher = userVouchers.find((v) => v.id === voucherId);
                          setSelectedVoucher(voucher || null);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn voucher">
                            {selectedVoucher && selectedVoucher.code}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="w-96 rounded-lg shadow-lg">
                          {userVouchers.map((voucher) => (
                            <SelectItem key={voucher.id} value={voucher.id}>
                              {voucher.code} - {voucher.discountType === "percentage" ? `${voucher.discountValue}% OFF` : `${formatPrice(voucher.discountValue)} OFF`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                </div>

                {/* Price summary */}
                {checkIn && checkOut && (
                  <div className="border-t border-border pt-4 mt-4 space-y-2 px-4">
                    <div className="flex justify-between text-sm">
                      <span>
                        Giá phòng x{" "}
                        {Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))} đêm
                      </span>
                      <span>
                        {formatPrice(
                          room.pricePerNight *
                          Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Phí dịch vụ</span>
                      <span>{formatPrice(50000)}</span>
                    </div>
                    {selectedVoucher && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount ({selectedVoucher.code})</span>
                        <span>
                          -
                          {selectedVoucher.discountType === 'percentage'
                            ? formatPrice(
                              room.pricePerNight *
                              Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) *
                              (selectedVoucher.discountValue / 100)
                            )
                            : formatPrice(selectedVoucher.discountValue)}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-border pt-2 flex justify-between font-semibold">
                      <span>Tổng cộng</span>
                      <span>
                        {formatPrice(
                          room.pricePerNight *
                          Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) +
                          50000 -
                          (selectedVoucher
                            ? selectedVoucher.discountType === 'percentage'
                              ? room.pricePerNight *
                              Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) *
                              (selectedVoucher.discountValue / 100)
                              : selectedVoucher.discountValue
                            : 0)
                        )}
                      </span>
                    </div>
                  </div>
                )}

                <DrawerFooter className="flex flex-col gap-2">
                  <RainbowButton className="w-full" onClick={handleBookNowMobile} disabled={!tempCheckIn || !tempCheckOut}>
                    Book Now
                  </RainbowButton>
                  <DrawerClose asChild>
                    <Button variant="outline">Hủy</Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          )}
        </div>
      )}


      {activeChat && (
        <div className="fixed bottom-4 right-4 z-[60]">
          <ChatWindow chat={activeChat} onBack={() => setActiveChat(null)} />
        </div>
      )}

      <Footer />
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  )
}
