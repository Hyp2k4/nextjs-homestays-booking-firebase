"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { AdminService } from "@/lib/admin-service"
import type { AdminStats, UserManagement, PropertyManagement } from "@/lib/admin-service"
import type { Booking } from "@/types/booking"
import {
  Users,
  Home,
  Calendar,
  DollarSign,
  TrendingUp,
  Shield,
  Search,
  MoreHorizontal,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react"
import Image from "next/image"

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<UserManagement[]>([])
  const [properties, setProperties] = useState<PropertyManagement[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated && user && user.role === "admin") {
      loadAdminData()
    }
    setIsLoading(false)
  }, [isAuthenticated, user])

  const loadAdminData = () => {
    const adminStats = AdminService.getAdminStats()
    const allUsers = AdminService.getAllUsers()
    const allProperties = AdminService.getAllProperties()
    const allBookings = AdminService.getAllBookings()

    setStats(adminStats)
    setUsers(allUsers)
    setProperties(allProperties)
    setBookings(allBookings)
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

  const getStatusBadge = (status: string, type: "user" | "property" | "booking" = "user") => {
    const variants: { [key: string]: any } = {
      active: "default",
      pending: "secondary",
      suspended: "destructive",
      banned: "destructive",
      rejected: "destructive",
      confirmed: "default",
      cancelled: "outline",
      completed: "outline",
    }

    const labels: { [key: string]: string } = {
      active: "Hoạt động",
      pending: "Chờ duyệt",
      suspended: "Tạm khóa",
      banned: "Cấm",
      rejected: "Từ chối",
      confirmed: "Đã xác nhận",
      cancelled: "Đã hủy",
      completed: "Hoàn thành",
    }

    return <Badge variant={variants[status] || "secondary"}>{labels[status] || status}</Badge>
  }

  const handleUserAction = async (userId: string, action: "suspend" | "activate" | "ban") => {
    const statusMap = {
      suspend: "suspended" as const,
      activate: "active" as const,
      ban: "banned" as const,
    }

    const reason = prompt(`Lý do ${action === "suspend" ? "tạm khóa" : action === "ban" ? "cấm" : "kích hoạt"}:`)
    if (reason !== null) {
      const result = await AdminService.updateUserStatus(userId, statusMap[action], reason)
      if (result.success) {
        loadAdminData()
      } else {
        alert(result.error)
      }
    }
  }

  const handlePropertyAction = async (propertyId: string, action: "approve" | "reject" | "suspend") => {
    const statusMap = {
      approve: "active" as const,
      reject: "rejected" as const,
      suspend: "suspended" as const,
    }

    const notes = prompt(
      `Ghi chú cho việc ${action === "approve" ? "duyệt" : action === "reject" ? "từ chối" : "tạm khóa"}:`,
    )
    if (notes !== null) {
      const result = await AdminService.updatePropertyStatus(propertyId, statusMap[action], notes)
      if (result.success) {
        loadAdminData()
      } else {
        alert(result.error)
      }
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
            <p className="text-muted-foreground">
              Bạn cần đăng nhập với tài khoản quản trị viên để truy cập trang này.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="font-serif font-bold text-2xl mb-4">Không có quyền truy cập</h1>
            <p className="text-muted-foreground mb-4">Bạn cần có quyền quản trị viên để truy cập trang này.</p>
            <Button onClick={() => (window.location.href = "/")}>Về trang chủ</Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredProperties = properties.filter((property) =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-serif font-bold text-3xl mb-2">Bảng điều khiển quản trị</h1>
          <p className="text-muted-foreground">Quản lý toàn bộ hệ thống VietStay</p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalHosts} chủ nhà • {stats.totalCustomers} khách hàng
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Homestay</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProperties}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeProperties} hoạt động • {stats.pendingProperties} chờ duyệt
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đặt phòng</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBookings}</div>
                <p className="text-xs text-muted-foreground">{stats.confirmedBookings} đã xác nhận</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Doanh thu nền tảng</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPrice(stats.platformFee)}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-3 w-3 mr-1" />+{stats.monthlyGrowth}% tháng này
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="users">Người dùng</TabsTrigger>
            <TabsTrigger value="properties">Homestay</TabsTrigger>
            <TabsTrigger value="bookings">Đặt phòng</TabsTrigger>
            <TabsTrigger value="analytics">Phân tích</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Đặt phòng gần đây</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{booking.propertyTitle}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.userName} • {formatDate(booking.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(booking.status, "booking")}
                          <span className="text-sm font-medium">{formatPrice(booking.total)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Người dùng mới</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users
                      .sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())
                      .slice(0, 5)
                      .map((user) => (
                        <div key={user.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {user.role === "host" ? "Chủ nhà" : "Khách hàng"} • {formatDate(user.joinDate)}
                            </p>
                          </div>
                          {getStatusBadge(user.status)}
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle>Tình trạng hệ thống</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="font-medium">Hệ thống thanh toán</p>
                      <p className="text-sm text-muted-foreground">Hoạt động bình thường</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="font-medium">Cơ sở dữ liệu</p>
                      <p className="text-sm text-muted-foreground">Kết nối ổn định</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
                    <AlertTriangle className="h-8 w-8 text-yellow-500" />
                    <div>
                      <p className="font-medium">Email service</p>
                      <p className="text-sm text-muted-foreground">Độ trễ cao</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-serif font-semibold text-2xl">Quản lý người dùng</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm người dùng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <Card key={user.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                          {user.name[0].toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{user.name}</h3>
                          <p className="text-muted-foreground">{user.email}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-muted-foreground">
                              {user.role === "host" ? "Chủ nhà" : "Khách hàng"}
                            </span>
                            <span className="text-sm text-muted-foreground">Tham gia: {formatDate(user.joinDate)}</span>
                            <span className="text-sm text-muted-foreground">
                              {user.totalBookings} đặt phòng • {formatPrice(user.totalSpent)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {getStatusBadge(user.status)}
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {user.status === "active" ? (
                            <Button variant="outline" size="sm" onClick={() => handleUserAction(user.id, "suspend")}>
                              <Ban className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => handleUserAction(user.id, "activate")}>
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="properties" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-serif font-semibold text-2xl">Quản lý homestay</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm homestay..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <Card key={property.id} className="overflow-hidden">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={property.images[0] || "/placeholder.svg"}
                      alt={property.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 right-3">{getStatusBadge(property.status, "property")}</div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">{property.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{property.location.city}</p>
                    <p className="text-sm text-muted-foreground mb-3">Chủ nhà: {property.hostName}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold">{formatPrice(property.price.perNight)}/đêm</span>
                      <div className="flex items-center gap-1">
                        <Shield className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm">{property.rating.average}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Eye className="h-4 w-4 mr-1" />
                        Xem
                      </Button>
                      {property.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handlePropertyAction(property.id, "approve")}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePropertyAction(property.id, "reject")}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <h2 className="font-serif font-semibold text-2xl">Quản lý đặt phòng</h2>

            <div className="space-y-4">
              {bookings.slice(0, 20).map((booking) => (
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
                            Khách: {booking.userName} ({booking.guestInfo.email})
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)} • {booking.guests} khách •{" "}
                            {booking.totalNights} đêm
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Đặt lúc: {formatDate(booking.createdAt)} • Mã: {booking.id}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-bold text-lg">{formatPrice(booking.total)}</div>
                          <div className="text-sm text-muted-foreground">
                            Phí nền tảng: {formatPrice(booking.total * 0.1)}
                          </div>
                        </div>
                        {getStatusBadge(booking.status, "booking")}
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <h2 className="font-serif font-semibold text-2xl">Phân tích và báo cáo</h2>

            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Tổng doanh thu</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{formatPrice(stats.totalRevenue)}</div>
                    <p className="text-sm text-muted-foreground">Phí nền tảng: {formatPrice(stats.platformFee)}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Doanh thu tháng này</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatPrice(stats.monthlyRevenue)}</div>
                    <p className="text-sm text-green-600">+{stats.monthlyGrowth}% so với tháng trước</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Tỷ lệ chuyển đổi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {((stats.confirmedBookings / stats.totalBookings) * 100).toFixed(1)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Đặt phòng thành công</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Giá trị trung bình</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatPrice(stats.totalRevenue / (stats.confirmedBookings || 1))}
                    </div>
                    <p className="text-sm text-muted-foreground">Mỗi đặt phòng</p>
                  </CardContent>
                </Card>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Xu hướng doanh thu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {AdminService.getRevenueAnalytics().map((data) => (
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
                        <div className="text-sm text-muted-foreground">Phí: {formatPrice(data.platformFee)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  )
}
