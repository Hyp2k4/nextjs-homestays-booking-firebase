"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HostService } from "@/lib/host-service"
import type { HostStats, RevenueData } from "@/lib/host-service"
import type { Property } from "@/types/property"
import type { Booking } from "@/types/booking"
import {
  Home,
  Calendar,
  DollarSign,
  Star,
  TrendingUp,
  Plus,
  Eye,
  Edit,
  MoreHorizontal,
  CheckCircle,
  XCircle,
} from "lucide-react"
import Image from "next/image"

export default function HostDashboard() {
  const { user, isAuthenticated } = useAuth()
  const [stats, setStats] = useState<HostStats | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated && user && user.role === "host") {
      loadHostData()
    }
    setIsLoading(false)
  }, [isAuthenticated, user])

  const loadHostData = () => {
    if (!user) return

    const hostStats = HostService.getHostStats(user.id)
    const hostProperties = HostService.getHostProperties(user.id)
    const hostBookings = HostService.getHostBookings(user.id)
    const revenue = HostService.getRevenueData(user.id)

    setStats(hostStats)
    setProperties(hostProperties)
    setBookings(hostBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    setRevenueData(revenue)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      confirmed: "default",
      cancelled: "destructive",
      completed: "outline",
    }
    const labels = {
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      cancelled: "Đã hủy",
      completed: "Hoàn thành",
    }
    return (
      <Badge variant={variants[status as keyof typeof variants] as any}>{labels[status as keyof typeof labels]}</Badge>
    )
  }

  const handleBookingAction = async (bookingId: string, action: "confirmed" | "cancelled") => {
    if (!user) return

    const result = await HostService.updateBookingStatus(bookingId, action, user.id)
    if (result.success) {
      loadHostData() // Refresh data
    } else {
      alert(result.error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Đang tải...</div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="font-serif font-bold text-2xl mb-4">Vui lòng đăng nhập</h1>
            <p className="text-muted-foreground">Bạn cần đăng nhập với tài khoản chủ nhà để truy cập trang này.</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (user.role !== "host") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="font-serif font-bold text-2xl mb-4">Không có quyền truy cập</h1>
            <p className="text-muted-foreground mb-4">Bạn cần có tài khoản chủ nhà để truy cập trang này.</p>
            <Button onClick={() => (window.location.href = "/")}>Về trang chủ</Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-serif font-bold text-3xl mb-2">Bảng điều khiển chủ nhà</h1>
          <p className="text-muted-foreground">Quản lý homestay và đặt phòng của bạn</p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng homestay</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProperties}</div>
                <p className="text-xs text-muted-foreground">{stats.activeProperties} đang hoạt động</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đặt phòng</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBookings}</div>
                <p className="text-xs text-muted-foreground">{stats.pendingBookings} chờ xác nhận</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Doanh thu tháng</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPrice(stats.monthlyRevenue)}</div>
                <p className="text-xs text-muted-foreground">Tổng: {formatPrice(stats.totalRevenue)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đánh giá TB</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">Tỷ lệ lấp đầy: {stats.occupancyRate.toFixed(1)}%</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="properties">Homestay</TabsTrigger>
            <TabsTrigger value="bookings">Đặt phòng</TabsTrigger>
            <TabsTrigger value="revenue">Doanh thu</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Recent Bookings */}
            <Card>
              <CardHeader>
                <CardTitle>Đặt phòng gần đây</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.slice(0, 5).length > 0 ? (
                  <div className="space-y-4">
                    {bookings.slice(0, 5).map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <Image
                            src={booking.propertyImage || "/placeholder.svg"}
                            alt={booking.propertyTitle}
                            width={60}
                            height={60}
                            className="rounded-md object-cover"
                          />
                          <div>
                            <h4 className="font-medium">{booking.propertyTitle}</h4>
                            <p className="text-sm text-muted-foreground">
                              {booking.userName} • {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(booking.status)}
                          <span className="font-medium">{formatPrice(booking.total)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">Chưa có đặt phòng nào</p>
                )}
              </CardContent>
            </Card>

            {/* Top Properties */}
            <Card>
              <CardHeader>
                <CardTitle>Homestay hàng đầu</CardTitle>
              </CardHeader>
              <CardContent>
                {properties.slice(0, 3).length > 0 ? (
                  <div className="space-y-4">
                    {properties.slice(0, 3).map((property) => (
                      <div
                        key={property.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <Image
                            src={property.images[0] || "/placeholder.svg"}
                            alt={property.title}
                            width={60}
                            height={60}
                            className="rounded-md object-cover"
                          />
                          <div>
                            <h4 className="font-medium">{property.title}</h4>
                            <p className="text-sm text-muted-foreground">{property.location.city}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{property.rating.average}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{formatPrice(property.price.perNight)}/đêm</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Bạn chưa có homestay nào</p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm homestay đầu tiên
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="properties" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-serif font-semibold text-2xl">Homestay của bạn</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Thêm homestay mới
              </Button>
            </div>

            {properties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <Card key={property.id} className="overflow-hidden">
                    <div className="relative aspect-[4/3]">
                      <Image
                        src={property.images[0] || "/placeholder.svg"}
                        alt={property.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge variant={property.isActive ? "default" : "secondary"}>
                          {property.isActive ? "Hoạt động" : "Tạm dừng"}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2">{property.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{property.location.city}</p>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{property.rating.average}</span>
                          <span className="text-sm text-muted-foreground">({property.rating.count})</span>
                        </div>
                        <span className="font-semibold">{formatPrice(property.price.perNight)}/đêm</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                          <Eye className="h-4 w-4 mr-1" />
                          Xem
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                          <Edit className="h-4 w-4 mr-1" />
                          Sửa
                        </Button>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Home className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-serif font-semibold text-xl mb-2">Chưa có homestay nào</h3>
                <p className="text-muted-foreground mb-4">Bắt đầu kiếm tiền bằng cách cho thuê homestay của bạn!</p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm homestay đầu tiên
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <h2 className="font-serif font-semibold text-2xl">Quản lý đặt phòng</h2>

            {bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <Image
                            src={booking.propertyImage || "/placeholder.svg"}
                            alt={booking.propertyTitle}
                            width={80}
                            height={80}
                            className="rounded-md object-cover"
                          />
                          <div>
                            <h3 className="font-semibold text-lg">{booking.propertyTitle}</h3>
                            <p className="text-muted-foreground">
                              {booking.userName} • {booking.guestInfo.email}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)} • {booking.guests} khách
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-bold text-lg">{formatPrice(booking.total)}</div>
                            <div className="text-sm text-muted-foreground">{booking.totalNights} đêm</div>
                          </div>
                          {getStatusBadge(booking.status)}
                        </div>
                      </div>

                      {booking.status === "pending" && (
                        <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                          <Button
                            size="sm"
                            onClick={() => handleBookingAction(booking.id, "confirmed")}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Chấp nhận
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBookingAction(booking.id, "cancelled")}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Từ chối
                          </Button>
                        </div>
                      )}

                      {booking.guestInfo.specialRequests && (
                        <div className="mt-4 p-3 bg-muted rounded-md">
                          <p className="text-sm font-medium mb-1">Yêu cầu đặc biệt:</p>
                          <p className="text-sm text-muted-foreground">{booking.guestInfo.specialRequests}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-serif font-semibold text-xl mb-2">Chưa có đặt phòng nào</h3>
                <p className="text-muted-foreground">
                  Đặt phòng sẽ xuất hiện ở đây khi khách hàng đặt homestay của bạn.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <h2 className="font-serif font-semibold text-2xl">Báo cáo doanh thu</h2>

            {revenueData.length > 0 ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Doanh thu 6 tháng gần đây</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {revenueData.map((data) => (
                        <div
                          key={data.month}
                          className="flex items-center justify-between p-4 border border-border rounded-lg"
                        >
                          <div>
                            <div className="font-medium">Tháng {data.month}</div>
                            <div className="text-sm text-muted-foreground">{data.bookings} đặt phòng</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">{formatPrice(data.revenue)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {stats && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Tổng doanh thu</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatPrice(stats.totalRevenue)}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Doanh thu tháng này</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatPrice(stats.monthlyRevenue)}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Tỷ lệ lấp đầy</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.occupancyRate.toFixed(1)}%</div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-serif font-semibold text-xl mb-2">Chưa có dữ liệu doanh thu</h3>
                <p className="text-muted-foreground">
                  Doanh thu sẽ xuất hiện ở đây khi bạn có đặt phòng được xác nhận.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  )
}
