"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import Image from "next/image"
import Link from "next/link"
import { HostService } from "@/lib/host-service"
import type { Property } from "@/types/property"
import { EditRoomModal } from "@/components/host/edit-room-modal"

import {
  LayoutDashboard,
  PlusSquare,
  List,
  Settings,
  LogOut,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Calendar,
  MapPin,
  Users,
  Bed,
  Bath,
  Star,
  EyeOff,
  CheckCircle,
  XCircle,
  Home,
} from "lucide-react"

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function ListRoomPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all")
  const [selectedHomestay, setSelectedHomestay] = useState<string>("all")
  const [homestays, setHomestays] = useState<any[]>([])

  const checkAccess = useCallback(async () => {
    if (!user || user.role !== "host") {
      toast.error("Bạn cần đăng nhập với vai trò chủ homestay")
      router.push("/")
      return
    }

    try {
      // Load homestays
      const homestaysData = await HostService.getHostHomestays(user.id)
      setHomestays(homestaysData)

      // Load rooms
      const roomsData = await HostService.getHostRooms(user.id)
      setRooms(roomsData)
    } catch (error) {
      console.error("Lỗi khi tải danh sách phòng:", error)
      toast.error("Có lỗi xảy ra khi tải danh sách phòng")
    } finally {
      setLoading(false)
    }
  }, [user, router])

  useEffect(() => {
    checkAccess()
  }, [checkAccess])

  const handleNavigation = useCallback((path: string) => {
    console.log(`Attempting navigation to: ${path}`)

    setTimeout(() => {
      try {
        console.log(`Router push to: ${path}`)
        router.push(path)
      } catch (error) {
        console.error("Router push failed:", error)
        console.log(`Fallback to window.location: ${path}`)
        window.location.href = path
      }
    }, 0)
  }, [router])

  const handleStatusToggle = async (roomId: string, currentStatus: boolean) => {
    if (!user) return

    try {
      const success = await HostService.updateRoomStatus(roomId, !currentStatus, user.id)
      if (success) {
        setRooms(prev => prev.map(room =>
          room.id === roomId
            ? { ...room, isActive: !currentStatus }
            : room
        ))
        toast.success(`Phòng đã được ${!currentStatus ? 'kích hoạt' : 'vô hiệu hóa'}`)
      } else {
        toast.error("Không thể cập nhật trạng thái phòng")
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái")
    }
  }

  const handleDeleteRoom = async (roomId: string) => {
    if (!user) return

    try {
      const success = await HostService.deleteRoom(roomId, user.id)
      if (success) {
        setRooms(prev => prev.filter(room => room.id !== roomId))
        toast.success("Phòng đã được xóa")
      } else {
        toast.error("Không thể xóa phòng")
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa phòng")
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getPropertyTypeLabel = (type: string) => {
    const labels = {
      house: "Nhà",
      apartment: "Căn hộ",
      villa: "Villa",
      cabin: "Cabin",
      treehouse: "Nhà trên cây",
      boat: "Thuyền",
    }
    return labels[type as keyof typeof labels] || type
  }

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = (room.roomType || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.roomCode || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.roomName || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" ||
      (filterStatus === "active" ? room.isActive !== false : room.isActive === false)
    const matchesHomestay = selectedHomestay === "all" || room.homestayId === selectedHomestay
    return matchesSearch && matchesStatus && matchesHomestay
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Danh sách phòng</h1>
              <p className="text-muted-foreground mt-2">
                Quản lý tất cả phòng của bạn với mã số tự động
              </p>
            </div>
            <Button
              onClick={() => handleNavigation("/host/add-room")}
              className="mt-4 md:mt-0"
            >
              <PlusSquare className="h-4 w-4 mr-2" />
              Thêm phòng mới
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tổng số phòng</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{rooms.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Phòng đang hoạt động</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">
                  {rooms.filter(room => room.isActive !== false).length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Phòng không hoạt động</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-orange-600">
                  {rooms.filter(room => room.isActive === false).length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-600">
                  {formatPrice(rooms.reduce((sum, room) => sum + (room.pricePerNight || 0), 0))}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm theo mã phòng, loại phòng hoặc mô tả..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={filterStatus === "all" ? "default" : "outline"}
                    onClick={() => setFilterStatus("all")}
                  >
                    Tất cả
                  </Button>
                  <Button
                    variant={filterStatus === "active" ? "default" : "outline"}
                    onClick={() => setFilterStatus("active")}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Đang hoạt động
                  </Button>
                  <Button
                    variant={filterStatus === "inactive" ? "default" : "outline"}
                    onClick={() => setFilterStatus("inactive")}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Không hoạt động
                  </Button>
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedHomestay}
                    onChange={(e) => setSelectedHomestay(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 text-sm"
                  >
                    <option value="all">Tất cả Homestay</option>
                    {homestays.map((homestay) => (
                      <option key={homestay.id} value={homestay.id}>
                        {homestay.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rooms List */}
          {filteredRooms.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground">
                  {rooms.length === 0 ? (
                    <>
                      <p className="text-lg mb-2">Bạn chưa có phòng nào</p>
                      <p className="mb-4">Bắt đầu bằng cách thêm phòng đầu tiên của bạn</p>
                      <Button onClick={() => handleNavigation("/host/add-room")}>
                        <PlusSquare className="h-4 w-4 mr-2" />
                        Thêm phòng mới
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-lg mb-2">Không tìm thấy phòng nào</p>
                      <p>Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border rounded shadow">
                <thead>
                  <tr>
                    <th className="px-4 py-2">Ảnh</th>
                    <th className="px-4 py-2">Tên phòng</th>
                    <th className="px-4 py-2">Mã phòng</th>
                    <th className="px-4 py-2">Loại phòng</th>
                    <th className="px-4 py-2">Homestay</th>
                    <th className="px-4 py-2">Giá/đêm</th>
                    <th className="px-4 py-2">Trạng thái</th>
                    <th className="px-4 py-2">Ngày tạo</th>
                    <th className="px-4 py-2 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRooms.map(room => (
                    <tr key={room.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <div className="relative w-16 h-12">
                          <Image src={room.images && room.images[0] ? room.images[0] : "/placeholder.jpg"} alt={room.roomName || room.roomCode || "Phòng"} fill className="object-cover rounded" />
                        </div>
                      </td>
                      <td className="px-4 py-2 font-medium">{room.roomName || "Không có tên"}</td>
                      <td className="px-4 py-2">{room.roomCode || "-"}</td>
                      <td className="px-4 py-2">{room.roomType || "-"}</td>
                      <td className="px-4 py-2">{homestays.find(h => h.id === room.homestayId)?.name || "-"}</td>
                      <td className="px-4 py-2">{formatPrice(room.pricePerNight || 0)}</td>
                      <td className="px-4 py-2">
                        <Badge variant={room.isActive !== false ? "default" : "secondary"}>
                          {room.isActive !== false ? "Đang hoạt động" : "Không hoạt động"}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 text-xs">{room.createdAt ? new Date(room.createdAt.toDate ? room.createdAt.toDate() : room.createdAt).toLocaleDateString('vi-VN') : "-"}</td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <EditRoomModal room={room} homestays={homestays} onUpdate={checkAccess}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </EditRoomModal>
                          <Button variant="outline" size="sm" onClick={() => handleStatusToggle(room.id, room.isActive !== false)}>
                            {room.isActive !== false ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm"><Trash2 className="h-4 w-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                                <AlertDialogDescription>Hành động này không thể hoàn tác. Phòng sẽ bị xóa vĩnh viễn.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteRoom(room.id)} className="bg-red-600 hover:bg-red-700">Xóa</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
