"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { HostService } from "@/lib/host-service"
import { HomestayRegistrationModal } from "@/components/homestay-registration-modal"
import { vietnameseCities } from '@/data/vietnamese-cities'
import { updateDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import {
  Home,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  X,
} from "lucide-react"
import { toast } from "react-toastify"
import Image from "next/image"

export default function HostDashboard() {
  const { user, isAuthenticated } = useAuth()
  const [homestays, setHomestays] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  // Search state
  const [searchTerm, setSearchTerm] = useState("")
  // Filter states
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterCity, setFilterCity] = useState("all")
  const [filterType, setFilterType] = useState("all")
  // Sort state
  const [sortBy, setSortBy] = useState("createdAt-desc")
  
  // Edit Homestay Modal States
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingHomestay, setEditingHomestay] = useState<any>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    propertyType: '',
    maxGuests: '',
    pricePerNight: '',
    phone: '',
    images: [] as string[],
    amenities: {
      wifi: false,
      parking: false,
      kitchen: false,
      ac: false,
      tv: false,
    }
  })

  // State cho admin xem toàn bộ homestay
  const [allHomestays, setAllHomestays] = useState<any[] | null>(null)
  const [loadingAll, setLoadingAll] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user && user.role === "host") {
      loadHostData()
    }
    setIsLoading(false)
  }, [isAuthenticated, user])

  const loadHostData = async () => {
    if (!user) return

    try {
      const homestaysData = await HostService.getHostHomestays(user.id)
      setHomestays(homestaysData)
    } catch (error) {
      console.error("Error loading homestays:", error)
      toast.error("Có lỗi xảy ra khi tải dữ liệu homestay")
    }
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

  const handleToggleStatus = async (homestayId: string, currentStatus: boolean) => {
    if (!user) return

    try {
      const result = await HostService.updateHomestayStatus(homestayId, !currentStatus, user.id)
      if (result) {
        toast.success(`Đã ${!currentStatus ? 'kích hoạt' : 'tạm dừng'} homestay`)
        loadHostData()
      } else {
        toast.error("Có lỗi xảy ra khi cập nhật trạng thái")
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái")
    }
  }

  const handleDeleteHomestay = async (homestayId: string) => {
    if (!user) return

    if (!confirm("Bạn có chắc chắn muốn xóa homestay này?")) return

    try {
      const result = await HostService.deleteHomestay(homestayId, user.id)
      if (result) {
        toast.success("Đã xóa homestay thành công")
        loadHostData()
    } else {
        toast.error("Có lỗi xảy ra khi xóa homestay")
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa homestay")
    }
  }

  // Edit Homestay Modal Functions
  const openEditModal = (homestay: any) => {
    setEditingHomestay(homestay)
    setEditFormData({
      name: homestay.name || '',
      description: homestay.description || '',
      address: homestay.address || '',
      city: homestay.city || '',
      propertyType: homestay.propertyType || '',
      maxGuests: homestay.maxGuests?.toString() || '',
      pricePerNight: homestay.pricePerNight?.toString() || '',
      phone: homestay.phone || '',
      images: homestay.images || [],
      amenities: {
        wifi: homestay.amenities?.wifi || false,
        parking: homestay.amenities?.parking || false,
        kitchen: homestay.amenities?.kitchen || false,
        ac: homestay.amenities?.ac || false,
        tv: homestay.amenities?.tv || false,
      }
    })
    setEditModalOpen(true)
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleEditSelectChange = (name: string, value: string) => {
    setEditFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleEditAmenityChange = (key: string, checked: boolean) => {
    setEditFormData(prev => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [key]: checked
      }
    }))
  }

  const uploadImagesToCloudinary = async (files: FileList): Promise<string[]> => {
    const formData = new FormData()
    Array.from(files).forEach((file) => {
      formData.append("file", file)
    })

    const res = await fetch("/api/upload", { method: "POST", body: formData })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || "Upload failed")
    }

    const data = await res.json()
    console.log("Upload thành công, nhận URLs từ Cloudinary:", data.urls)
    return data.urls
  }

  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const uploadedUrls = await uploadImagesToCloudinary(files)

      setEditFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }))

      toast.success('Tải ảnh lên thành công!')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Có lỗi xảy ra khi tải ảnh lên')
    } finally {
      setUploading(false)
    }
  }

  const removeEditImage = (index: number) => {
    setEditFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editFormData.name || !editFormData.address || !editFormData.phone || !editFormData.city || !editFormData.propertyType || !editFormData.maxGuests || !editFormData.pricePerNight) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc")
      return
    }

    if (!user || !editingHomestay?.id) {
      toast.error("Không tìm thấy thông tin homestay")
      return
    }

    setEditLoading(true)
    try {
      const updateData = {
        name: editFormData.name,
        description: editFormData.description,
        address: editFormData.address,
        city: editFormData.city,
        propertyType: editFormData.propertyType,
        maxGuests: parseInt(editFormData.maxGuests),
        pricePerNight: parseInt(editFormData.pricePerNight),
        phone: editFormData.phone,
        images: editFormData.images,
        amenities: editFormData.amenities,
        updatedAt: new Date()
      }

      await updateDoc(doc(db, "homestays", editingHomestay.id), updateData)

      toast.success("Cập nhật homestay thành công!")
      setEditModalOpen(false)
      loadHostData()
    } catch (error) {
      console.error("Update error:", error)
      toast.error("Có lỗi xảy ra khi cập nhật homestay")
    } finally {
      setEditLoading(false)
    }
  }

  const handleGetAllHomestays = async () => {
    setLoadingAll(true)
    try {
      const data = await HostService.getAllHomestays()
      setAllHomestays(data)
    } catch (error) {
      toast.error("Có lỗi khi lấy toàn bộ homestay")
    } finally {
      setLoadingAll(false)
    }
  }

  // Filtered + Sorted homestays
  let filteredHomestays = homestays.filter(h => {
    // Search
    const term = searchTerm.toLowerCase()
    const matchSearch =
      !searchTerm ||
      (h.name && h.name.toLowerCase().includes(term)) ||
      (h.address && h.address.toLowerCase().includes(term))
    // Status
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && h.isActive) ||
      (filterStatus === "inactive" && !h.isActive)
    // City
    const matchCity =
      filterCity === "all" || h.city === filterCity
    // Type
    const matchType =
      filterType === "all" || h.propertyType === filterType
    return matchSearch && matchStatus && matchCity && matchType
  })
  // Sort
  filteredHomestays = [...filteredHomestays].sort((a, b) => {
    switch (sortBy) {
      case "name-asc":
        return (a.name || "").localeCompare(b.name || "")
      case "name-desc":
        return (b.name || "").localeCompare(a.name || "")
      case "price-asc":
        return (a.pricePerNight || 0) - (b.pricePerNight || 0)
      case "price-desc":
        return (b.pricePerNight || 0) - (a.pricePerNight || 0)
      case "createdAt-asc":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case "createdAt-desc":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "status-active":
        return (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0)
      case "status-inactive":
        return (a.isActive ? 1 : 0) - (b.isActive ? 1 : 0)
      default:
        return 0
    }
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background">
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

  const stats = {
    totalHomestays: homestays.length,
    activeHomestays: homestays.filter(h => h.isActive).length,
    totalRevenue: homestays.reduce((sum, h) => sum + (h.pricePerNight || 0), 0),
  }

  return (
    <div className="min-h-screen bg-background">

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-serif font-bold text-3xl mb-2">Bảng điều khiển chủ nhà</h1>
          <p className="text-muted-foreground">Quản lý homestay của bạn</p>
        </div>
        {/* Search + Filter + Sort Row */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <Input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc địa chỉ..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full md:w-80"
          />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="inactive">Tạm dừng</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterCity} onValueChange={setFilterCity}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Thành phố" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả thành phố</SelectItem>
              {Array.from(new Set(homestays.map(h => h.city).filter(Boolean))).map(city => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Loại homestay" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              {Array.from(new Set(homestays.map(h => h.propertyType).filter(Boolean))).map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt-desc">Mới nhất</SelectItem>
              <SelectItem value="createdAt-asc">Cũ nhất</SelectItem>
              <SelectItem value="name-asc">Tên A-Z</SelectItem>
              <SelectItem value="name-desc">Tên Z-A</SelectItem>
              <SelectItem value="price-asc">Giá tăng dần</SelectItem>
              <SelectItem value="price-desc">Giá giảm dần</SelectItem>
              <SelectItem value="status-active">Hoạt động trước</SelectItem>
              <SelectItem value="status-inactive">Tạm dừng trước</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng homestay</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
              <div className="text-2xl font-bold">{stats.totalHomestays}</div>
              <p className="text-xs text-muted-foreground">{stats.activeHomestays} đang hoạt động</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Homestay hoạt động</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeHomestays}</div>
              <p className="text-xs text-muted-foreground">Đang cho thuê</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng giá trị</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
              <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">Tổng giá trị homestay</p>
              </CardContent>
            </Card>
          </div>

        {/* Homestay Management */}
            <Card>
              <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Quản lý Homestay</CardTitle>
              {homestays.some(h => h.status === 'denied') && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <strong className="font-bold">Thông báo: </strong>
                  <span className="block sm:inline">Một hoặc nhiều homestay của bạn đã bị từ chối.</span>
                </div>
              )}
              <HomestayRegistrationModal>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm homestay mới
                </Button>
              </HomestayRegistrationModal>
            </div>
              </CardHeader>
              <CardContent>
            {filteredHomestays.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hình ảnh</TableHead>
                      <TableHead>Tên homestay</TableHead>
                      <TableHead>Địa chỉ</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Giá/đêm</TableHead>
                      <TableHead>Trạng thái Host</TableHead>
                      <TableHead>Trạng thái Admin</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHomestays.map((homestay) => (
                      <TableRow key={homestay.id}>
                        <TableCell>
                          <div className="relative w-16 h-16">
                          <Image
                              src={homestay.images?.[0] || "/placeholder.svg"}
                              alt={homestay.name}
                              fill
                              className="object-cover rounded-md"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{homestay.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {homestay.maxGuests} khách tối đa
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{homestay.city}</div>
                            <div className="text-sm text-muted-foreground">
                              {homestay.address}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {homestay.propertyType === 'house' && '🏠 Nhà'}
                            {homestay.propertyType === 'apartment' && '🏢 Căn hộ'}
                            {homestay.propertyType === 'villa' && '🏰 Villa'}
                            {homestay.propertyType === 'cabin' && '🛖 Cabin'}
                            {homestay.propertyType === 'treehouse' && '🌳 Nhà trên cây'}
                            {homestay.propertyType === 'boat' && '⛵ Thuyền'}
                            {!['house', 'apartment', 'villa', 'cabin', 'treehouse', 'boat'].includes(homestay.propertyType) && homestay.propertyType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {formatPrice(homestay.pricePerNight)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={homestay.isActive ? "default" : "secondary"}>
                            {homestay.isActive ? "Hoạt động" : "Tạm dừng"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              homestay.status === "approved"
                                ? "default"
                                : homestay.status === "pending"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {homestay.status === "approved"
                              ? "Đã duyệt"
                              : homestay.status === "pending"
                              ? "Chờ duyệt"
                              : "Từ chối"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(homestay.createdAt?.toDate ? homestay.createdAt.toDate() : homestay.createdAt)}
                      </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStatus(homestay.id, homestay.isActive)}
                            >
                              {homestay.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openEditModal(homestay)}
                            >
                              <Edit className="h-4 w-4" />
                        </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteHomestay(homestay.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                        </TableCell>
                      </TableRow>
                ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Home className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-serif font-semibold text-xl mb-2">Chưa có homestay nào</h3>
                <p className="text-muted-foreground mb-4">Bắt đầu kiếm tiền bằng cách cho thuê homestay của bạn!</p>
                <HomestayRegistrationModal>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm homestay đầu tiên
                </Button>
                </HomestayRegistrationModal>
              </div>
            )}
                  </CardContent>
                </Card>

      </main>

      {/* Modal chỉnh sửa homestay */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Homestay</DialogTitle>
            <DialogDescription>Cập nhật thông tin homestay của bạn.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Tên homestay *</Label>
                <Input name="name" value={editFormData.name} onChange={handleEditInputChange} required />
              </div>
              <div>
                <Label>Thành phố *</Label>
                <Select value={editFormData.city} onValueChange={v => handleEditSelectChange('city', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thành phố" />
                  </SelectTrigger>
                  <SelectContent>
                    {vietnameseCities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>Địa chỉ *</Label>
                <Input name="address" value={editFormData.address} onChange={handleEditInputChange} required />
              </div>
              <div className="md:col-span-2">
                <Label>Mô tả</Label>
                <Textarea name="description" value={editFormData.description} onChange={handleEditInputChange} rows={3} />
              </div>
              <div>
                <Label>Loại hình *</Label>
                <Select value={editFormData.propertyType} onValueChange={v => handleEditSelectChange('propertyType', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại hình" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="house">Nhà</SelectItem>
                    <SelectItem value="apartment">Căn hộ</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="cabin">Cabin</SelectItem>
                    <SelectItem value="treehouse">Nhà trên cây</SelectItem>
                    <SelectItem value="boat">Thuyền</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Số khách tối đa *</Label>
                <Input name="maxGuests" type="number" min={1} value={editFormData.maxGuests} onChange={handleEditInputChange} required />
              </div>
              <div>
                <Label>Giá/đêm (VND) *</Label>
                <Input name="pricePerNight" type="number" min={0} value={editFormData.pricePerNight} onChange={handleEditInputChange} required />
              </div>
              <div>
                <Label>Số điện thoại *</Label>
                <Input name="phone" value={editFormData.phone} onChange={handleEditInputChange} required />
              </div>
            </div>
            <div>
              <Label>Tiện nghi</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {Object.entries(editFormData.amenities).map(([key, checked]) => (
                  <label key={key} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={!!checked}
                      onChange={e => handleEditAmenityChange(key, e.target.checked)}
                      className="accent-primary"
                    />
                    {key}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label>Ảnh homestay</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {editFormData.images.map((img, idx) => (
                  <div key={idx} className="relative w-20 h-20">
                    <Image src={img} alt="homestay" fill className="object-cover rounded" />
                    <button type="button" className="absolute top-0 right-0 bg-white rounded-full p-1 shadow" onClick={() => removeEditImage(idx)}>
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))}
                <label className="w-20 h-20 flex items-center justify-center border rounded cursor-pointer bg-muted">
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleEditImageUpload} />
                  {uploading ? <Loader2 className="animate-spin" /> : <Plus />}
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setEditModalOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={editLoading}>
                {editLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
