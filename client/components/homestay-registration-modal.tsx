"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
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
import { toast } from "react-toastify"
import { Loader2, Home } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { vietnameseCities } from '@/data/vietnamese-cities'

type HomestayRegistrationModalProps = {
    children?: React.ReactNode
}

export function HomestayRegistrationModal({ children }: HomestayRegistrationModalProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
        city: '',
        propertyType: '',
        maxGuests: '',
        pricePerNight: '',
        phone: '',
        amenities: {
            wifi: false,
            parking: false,
            kitchen: false,
            ac: false,
            tv: false,
        }
    })
    const { registerHomestay } = useAuth()

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleAmenityChange = (key: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            amenities: {
                ...prev.amenities,
                [key]: checked
            }
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name || !formData.address || !formData.phone || !formData.city || !formData.propertyType || !formData.maxGuests || !formData.pricePerNight) {
            toast.error("Vui lòng điền đầy đủ thông tin bắt buộc")
            return
        }

        console.log("Submitting:", formData)
        setLoading(true)

        try {
            const result = await registerHomestay({ ...formData, status: "pending" })

            if (result.success) {
                toast.success("Homestay của bạn đã được đăng ký thành công và đang chờ phê duyệt.")
                setOpen(false)
                setFormData({
                    name: '',
                    description: '',
                    address: '',
                    city: '',
                    propertyType: '',
                    maxGuests: '',
                    pricePerNight: '',
                    phone: '',
                    amenities: {
                        wifi: false,
                        parking: false,
                        kitchen: false,
                        ac: false,
                        tv: false,
                    }
                })
            } else {
                toast.error(result.error || "Có lỗi xảy ra khi đăng ký homestay")
            }
        } catch (error) {
            toast.error("Đã xảy ra lỗi không mong muốn")
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            address: '',
            city: '',
            propertyType: '',
            maxGuests: '',
            pricePerNight: '',
            phone: '',
            amenities: {
                wifi: false,
                parking: false,
                kitchen: false,
                ac: false,
                tv: false,
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                        <Home className="h-4 w-4 mr-2" />
                        List Your Homestay
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-purple-100">
                        <Home className="h-6 w-6 text-blue-600" />
                    </div>
                    <DialogTitle className="text-2xl font-bold text-gray-900">Đăng ký Homestay Mới</DialogTitle>
                    <DialogDescription className="text-gray-600">
                        Điền thông tin chi tiết về homestay của bạn để bắt đầu đón khách
                    </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-6 py-6">
                    {/* Basic Information Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                            <h3 className="font-semibold text-gray-900">Thông tin cơ bản</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                                    Tên Homestay <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Ví dụ: Villa Biển Đà Nẵng"
                                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="propertyType" className="text-sm font-medium text-gray-700">
                                    Loại Bất Động Sản <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.propertyType}
                                    onValueChange={(value) => handleSelectChange("propertyType", value)}
                                    required
                                >
                                    <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                        <SelectValue placeholder="Chọn loại bất động sản" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="house">🏠 Nhà</SelectItem>
                                        <SelectItem value="apartment">🏢 Căn hộ</SelectItem>
                                        <SelectItem value="villa">🏰 Villa</SelectItem>
                                        <SelectItem value="cabin">🛖 Cabin</SelectItem>
                                        <SelectItem value="treehouse">🌳 Nhà trên cây</SelectItem>
                                        <SelectItem value="boat">⛵ Thuyền</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                                Mô tả chi tiết
                            </Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Mô tả về homestay, vị trí, view, đặc điểm nổi bật..."
                                rows={4}
                                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                            />
                        </div>
                    </div>

                    {/* Location Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <h3 className="font-semibold text-gray-900">Vị trí & Địa chỉ</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                                    Địa chỉ chi tiết <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="Số nhà, tên đường, quận/huyện"
                                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                                    Thành phố <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.city}
                                    onValueChange={(value) => handleSelectChange("city", value)}
                                    required
                                >
                                    <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                        <SelectValue placeholder="Chọn thành phố" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {vietnameseCities.map(city => (
                                            <SelectItem key={city} value={city}>
                                                {city}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Capacity & Pricing Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                            <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                            <h3 className="font-semibold text-gray-900">Sức chứa & Giá cả</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="maxGuests" className="text-sm font-medium text-gray-700">
                                    Số khách tối đa <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="maxGuests"
                                    name="maxGuests"
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={formData.maxGuests}
                                    onChange={handleInputChange}
                                    placeholder="Ví dụ: 4"
                                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                                <p className="text-xs text-gray-500">Số lượng khách tối đa có thể ở cùng lúc</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pricePerNight" className="text-sm font-medium text-gray-700">
                                    Giá mỗi đêm (VND) <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="pricePerNight"
                                    name="pricePerNight"
                                    type="number"
                                    min="0"
                                    step="100000"
                                    value={formData.pricePerNight}
                                    onChange={handleInputChange}
                                    placeholder="Ví dụ: 1500000"
                                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                                <p className="text-xs text-gray-500">Giá thuê cho 1 đêm</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                                    Số điện thoại <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="0123456789"
                                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                                <p className="text-xs text-gray-500">Để khách hàng liên hệ</p>
                            </div>
                        </div>
                    </div>

                    {/* Amenities Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                            <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                            <h3 className="font-semibold text-gray-900">Tiện ích & Dịch vụ</h3>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {Object.entries(formData.amenities).map(([key, value]) => (
                                <div key={key} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                                    <input
                                        type="checkbox"
                                        id={key}
                                        checked={value}
                                        onChange={(e) => handleAmenityChange(key, e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <Label 
                                        htmlFor={key} 
                                        className="text-sm font-medium text-gray-700 cursor-pointer flex-1"
                                    >
                                        {key === 'wifi' && '📶 WiFi'}
                                        {key === 'parking' && '🅿️ Bãi đỗ xe'}
                                        {key === 'kitchen' && '🍳 Nhà bếp'}
                                        {key === 'ac' && '❄️ Điều hòa'}
                                        {key === 'tv' && '📺 TV'}
                                        {!['wifi', 'parking', 'kitchen', 'ac', 'tv'].includes(key) && key}
                                    </Label>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 text-center">
                            Chọn các tiện ích có sẵn tại homestay của bạn
                        </p>
                    </div>
                </form>
                
                <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                    <Button 
                        variant="outline" 
                        onClick={() => {
                            setOpen(false)
                            resetForm()
                        }}
                        className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50"
                        disabled={loading}
                    >
                        Hủy bỏ
                    </Button>
                    <Button 
                        onClick={handleSubmit}
                        className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                        disabled={loading || !formData.name || !formData.propertyType || !formData.address || !formData.city || !formData.maxGuests || !formData.pricePerNight || !formData.phone}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <Home className="h-4 w-4 mr-2" />
                                Đăng ký Homestay
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
