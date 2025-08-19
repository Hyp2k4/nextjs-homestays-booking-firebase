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
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "react-toastify"
import { Loader2 } from "lucide-react"
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
        address: '',
        phone: '',
        city: ''
    })
    const { registerHomestay } = useAuth()

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name || !formData.address || !formData.phone || !formData.city) {
            toast.error("Vui lòng điền đầy đủ thông tin")
            return
        }
        console.log("Submitting:", formData)
        setLoading(true)

        try {
            const result = await registerHomestay(formData)

            if (result.success) {
                toast.success("Homestay của bạn đã được đăng ký thành công và đang chờ phê duyệt.")
                setOpen(false)
                setFormData({
                    name: '',
                    address: '',
                    phone: '',
                    city: ''
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

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button
                        variant="ghost"
                        className="text-sm font-medium text-foreground hover:text-primary"
                    >
                        List Your Homestay
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>🏡 Đăng ký Homestay</DialogTitle>
                    <DialogDescription>
                        Điền đầy đủ thông tin để bắt đầu đón khách
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium">Tên Homestay *</label>
                        <Input
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Ví dụ: Biệt thự ven biển"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium">Địa chỉ chi tiết *</label>
                        <Input
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Số nhà, đường, phường/xã, quận/huyện"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium">Số điện thoại *</label>
                        <Input
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Số điện thoại liên hệ"
                            type="tel"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium">Tỉnh/Thành phố *</label>
                        <Select
                            value={formData.city}
                            onValueChange={(value) => setFormData({ ...formData, city: value })}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn tỉnh/thành phố" />
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

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            Hủy bỏ
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                "Đăng ký ngay"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}