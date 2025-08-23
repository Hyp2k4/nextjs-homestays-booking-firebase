"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroSlider } from "@/components/hero-slider"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PropertyService } from "@/lib/property-service"
import type { Property, SearchFilters } from "@/types/property"
import { Star, Heart, MapPin, Users, Bed, Bath, Calendar } from "lucide-react"
import Image from "next/image"
import { formatPrice } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { DatePicker } from "@/components/date-picker"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function AllHomestaysPage() {
    const [properties, setProperties] = useState<Property[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [filters, setFilters] = useState<SearchFilters>({})
    const { user } = useAuth()
    const router = useRouter()

    // Các loại homestay
    const propertyTypeOptions = [
        { value: "house", label: "Nhà" },
        { value: "apartment", label: "Căn hộ" },
        { value: "villa", label: "Biệt thự" },
        { value: "cabin", label: "Nhà gỗ" },
        { value: "treehouse", label: "Nhà cây" },
        { value: "boat", label: "Thuyền" }
    ]

    useEffect(() => {
        loadProperties(filters)
    }, [filters])

    const loadProperties = async (currentFilters: SearchFilters) => {
        setIsLoading(true); // Bắt đầu loading
        try {
            const data = await PropertyService.searchProperties(currentFilters);
            setProperties(data.properties);
        } catch (error) {
            console.error("Error fetching properties:", error);
        } finally {
            setIsLoading(false); // Kết thúc loading
        }
    };

    const handlePropertyClick = (id: string) => {
        router.push(`/homestay/${id}`)
    }

    const handleWishlist = (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        // TODO: Xử lý thêm vào wishlist
        console.log("Added to wishlist:", id)
    }

    const resetFilters = () => {
        setFilters({})
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <HeroSlider />

            <main className="container mx-auto px-4 py-8">
                {/* Filter Section */}
                <div className="mb-8 p-6 bg-white rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">Tìm homestay phù hợp</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Địa điểm</label>
                            <Input
                                placeholder="Thành phố, quận..."
                                value={filters.location || ''}
                                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Ngày nhận/phòng</label>
                            <DatePicker
                                selected={filters.checkIn ? new Date(filters.checkIn) : undefined}
                                onSelect={(date) => setFilters({ ...filters, checkIn: date?.toISOString() })}
                                placeholderText="Chọn ngày"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Ngày trả phòng</label>
                            <DatePicker
                                selected={filters.checkOut ? new Date(filters.checkOut) : undefined}
                                onSelect={(date) => setFilters({ ...filters, checkOut: date?.toISOString() })}
                                placeholderText="Chọn ngày"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Số khách</label>
                            <Input
                                type="number"
                                min="1"
                                value={filters.guests || ''}
                                onChange={(e) => setFilters({ ...filters, guests: parseInt(e.target.value) || undefined })}
                                placeholder="Số khách"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Loại homestay</label>
                            <Select
                                value={filters.propertyTypes?.[0] || undefined} // ✅ Đã đúng
                                onValueChange={(value) => setFilters({
                                    ...filters,
                                    propertyTypes: value ? [value] : undefined
                                })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn loại" />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* Option "Tất cả" - đang dùng value="all" là hợp lệ ✅ */}
                                    <SelectItem value="all">Tất cả loại</SelectItem>
                                    {propertyTypeOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Select khoảng giá */}
                            <Select
                                value={
                                    filters.priceRange
                                        ? `${filters.priceRange.min}-${filters.priceRange.max}`
                                        : undefined // ✅ Đã sửa từ '' thành undefined
                                }
                                onValueChange={(value) => {
                                    if (!value) {
                                        setFilters({ ...filters, priceRange: undefined })
                                    } else {
                                        const [min, max] = value.split('-').map(Number)
                                        setFilters({
                                            ...filters,
                                            priceRange: { min, max }
                                        })
                                    }
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn khoảng giá" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0-1,000,0000">Tất cả</SelectItem>
                                    <SelectItem value="0-1,000,000">Dưới 1 triệu</SelectItem>
                                    <SelectItem value="1,000,000-2,000,000">1 - 2 triệu</SelectItem>
                                    <SelectItem value="2,000,000-5,000,000">2 - 5 triệu</SelectItem>
                                    <SelectItem value="5,000,000-10,000,000">Trên 5 triệu</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Select đánh giá */}
                            <Select
                                value={filters.rating?.toString() || undefined} // Thay '' bằng undefined
                                onValueChange={(value) => setFilters({
                                    ...filters,
                                    rating: value ? parseInt(value) : undefined
                                })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn đánh giá" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="4">Từ 4 sao</SelectItem>
                                    <SelectItem value="4.5">Từ 4.5 sao</SelectItem>
                                    <SelectItem value="5">5 sao</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Khoảng giá</label>
                            <Select
                                value={
                                    filters.priceRange
                                        ? `${filters.priceRange.min}-${filters.priceRange.max}`
                                        : ''
                                }
                                onValueChange={(value) => {
                                    const [min, max] = value.split('-').map(Number)
                                    setFilters({
                                        ...filters,
                                        priceRange: { min, max }
                                    })
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn khoảng giá" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0-10000000">Tất cả</SelectItem>
                                    <SelectItem value="0-1000000">Dưới 1 triệu</SelectItem>
                                    <SelectItem value="1000000-2000000">1 - 2 triệu</SelectItem>
                                    <SelectItem value="2000000-5000000">2 - 5 triệu</SelectItem>
                                    <SelectItem value="5000000-10000000">Trên 5 triệu</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Đánh giá</label>
                            <Select
                                value={filters.rating?.toString() || undefined} // ✅ Sửa '' thành undefined
                                onValueChange={(value) => setFilters({
                                    ...filters,
                                    rating: value ? parseInt(value) : undefined
                                })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn đánh giá" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">Tất cả</SelectItem> {/* ✅ Thay "" bằng "0" */}
                                    <SelectItem value="4">Từ 4 sao</SelectItem>
                                    <SelectItem value="4.5">Từ 4.5 sao</SelectItem>
                                    <SelectItem value="5">5 sao</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                        <Button variant="ghost" onClick={resetFilters}>
                            Xóa bộ lọc
                        </Button>
                        <Button onClick={() => loadProperties(filters)}>
                            Áp dụng bộ lọc
                        </Button>
                    </div>
                </div>

                {/* Results Section */}
                <div className="mb-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">
                        {properties.length} Homestay được tìm thấy
                    </h1>
                    <div className="text-sm text-muted-foreground">
                        Sắp xếp theo: <span className="font-medium">Phổ biến</span>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <Card key={i}>
                                <Skeleton className="h-[200px] w-full rounded-t-lg" />
                                <CardContent className="p-4 space-y-3">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                    <Skeleton className="h-4 w-1/3" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : properties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.map((property) => (
                            <Card
                                key={property.id}
                                className="hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => handlePropertyClick(property.id)}
                            >
                                <div className="relative aspect-[4/3]">
                                    <Image
                                        src={property.images[0] || "/placeholder.svg"}
                                        alt={property.name || "Homestay image"}
                                        fill
                                        className="object-cover rounded-t-lg"
                                        priority={property.id === properties[0]?.id}
                                    />
                                    <button
                                        className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                                        onClick={(e) => handleWishlist(e, property.id)}
                                    >
                                        <Heart className="h-5 w-5" fill={user?.propertyWishlist?.includes(property.id) ? "red" : "none"} />
                                    </button>
                                    {property.featured && (
                                        <div className="absolute top-3 left-3">
                                            <Badge variant="default">Nổi bật</Badge>
                                        </div>
                                    )}
                                </div>
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold text-lg line-clamp-1">{property.name}</h3>
                                        <div className="flex items-center">
                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                                            <span>{Number(property.rating?.average ?? 0).toFixed(1)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                                        <MapPin className="h-4 w-4 mr-1" />
                                        <span className="line-clamp-1">
                                            {(property.district || "").toString()} {property.district && property.city ? ", " : ""}{(property.city || "").toString()}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm mb-4">
                                        <div className="flex items-center">
                                            <Users className="h-4 w-4 mr-1" />
                                            {(property.maxGuests ?? 0)} khách
                                        </div>
                                        <div className="flex items-center">
                                            <Bed className="h-4 w-4 mr-1" />
                                            {(property.bedrooms ?? 0)} phòng ngủ
                                        </div>
                                        <div className="flex items-center">
                                            <Bath className="h-4 w-4 mr-1" />
                                            {(property.bathrooms ?? 0)} phòng tắm
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mb-4">
                                        <div className="text-sm">
                                            {property.isActive ? (
                                                <div className="flex items-center text-green-600">
                                                    <Calendar className="h-4 w-4 mr-1" />
                                                    Còn phòng
                                                </div>
                                            ) : (
                                                <div className="text-red-600">Hết phòng</div>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-lg text-primary">
                                                {formatPrice(property.pricePerNight || 0)}
                                            </div>
                                            <div className="text-xs text-muted-foreground">/đêm</div>
                                        </div>
                                    </div>

                                    <Button className="w-full" variant="outline">
                                        Xem chi tiết
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 border rounded-lg bg-white">
                        <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-semibold text-xl mb-2">Không tìm thấy homestay phù hợp</h3>
                        <p className="text-muted-foreground mb-4">
                            Hãy thử điều chỉnh bộ lọc tìm kiếm của bạn
                        </p>
                        <Button variant="outline" onClick={resetFilters}>
                            Xóa bộ lọc
                        </Button>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    )
}
