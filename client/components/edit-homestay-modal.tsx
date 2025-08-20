"use client"

import { useState, useEffect } from 'react'
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
import { Loader2, Home, Edit, Upload, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { vietnameseCities } from '@/data/vietnamese-cities'
import { updateDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"

type EditHomestayModalProps = {
    children?: React.ReactNode
    homestay: any
    onUpdate: () => void
}

export function EditHomestayModal({ children, homestay, onUpdate }: EditHomestayModalProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [formData, setFormData] = useState({
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

    const { user } = useAuth()

    useEffect(() => {
        if (homestay) {
            setFormData({
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
        }
    }, [homestay])

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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setUploading(true)
        try {
            const uploadedUrls = []
            
            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                const formData = new FormData()
                formData.append('file', file)
                formData.append('upload_preset', 'homestay_booking') // Thay bằng upload preset của bạn

                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload`, // Thay YOUR_CLOUD_NAME
                    {
                        method: 'POST',
                        body: formData,
                    }
                )

                const data = await response.json()
                if (data.secure_url) {
                    uploadedUrls.push(data.secure_url)
                }
            }

            setFormData(prev => ({
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

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name || !formData.address || !formData.phone || !formData.city || !formData.propertyType || !formData.maxGuests || !formData.pricePerNight) {
            toast.error("Vui lòng điền đầy đủ thông tin bắt buộc")
            return
        }

        if (!user || !homestay?.id) {
            toast.error("Không tìm thấy thông tin homestay")
            return
        }

        setLoading(true)
        try {
            const updateData = {
                name: formData.name,
                description: formData.description,
                address: formData.address,
                city: formData.city,
                propertyType: formData.propertyType,
                maxGuests: parseInt(formData.maxGuests),
                pricePerNight: parseInt(formData.pricePerNight),
                phone: formData.phone,
                images: formData.images,
                amenities: formData.amenities,
                updatedAt: new Date()
            }

            await updateDoc(doc(db, "homestays", homestay.id), updateData)

            toast.success("Cập nhật homestay thành công!")
            setOpen(false)
            onUpdate()
        } catch (error) {
            console.error("Update error:", error)
            toast.error("Có lỗi xảy ra khi cập nhật homestay")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Chỉnh sửa
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-purple-100">
                        <Home className="h-6 w-6 text-blue-600" />
                    </div>
                    <DialogTitle className="text-2xl font-bold text-gray-900">Chỉnh sửa Homestay</DialogTitle>
                    <DialogDescription className="text-gray-600">
                        Cập nhật thông tin chi tiết về homestay của bạn
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
                            </div>
                        </div>
                    </div>

                    {/* Images Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                            <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                            <h3 className="font-semibold text-gray-900">Hình ảnh</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Label htmlFor="images" className="text-sm font-medium text-gray-700">
                                    Tải ảnh lên
                                </Label>
                                <Input
                                    id="images"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    disabled={uploading}
                                />
                                {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                            </div>
                            
                            {formData.images.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {formData.images.map((image, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={image}
                                                alt={`Homestay ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-lg"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => removeImage(index)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
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
                    </div>
                </form>
                
                <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                    <Button 
                        variant="outline" 
                        onClick={() => setOpen(false)}
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
                                Đang cập nhật...
                            </>
                        ) : (
                            <>
                                <Edit className="h-4 w-4 mr-2" />
                                Cập nhật Homestay
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
