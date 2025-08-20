"use client"

import { useEffect, useState } from "react"
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
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import Image from "next/image"
import { Loader2, Edit, X } from "lucide-react"
import { updateDoc, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/components/ui/use-toast"

type EditRoomModalProps = {
    children?: React.ReactNode
    room: any
    homestays: any[]
    onUpdate: () => void
}

export function EditRoomModal({ children, room, homestays, onUpdate }: EditRoomModalProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const { user } = useAuth()

    const [formData, setFormData] = useState<any>({
        roomName: "",
        roomType: "",
        homestayId: "",
        pricePerNight: "",
        description: "",
        amenities: {},
        images: [] as string[],
    })

    useEffect(() => {
        if (room) {
            setFormData({
                roomName: room.roomName || "",
                roomType: room.roomType || "",
                homestayId: room.homestayId || "",
                pricePerNight: room.pricePerNight?.toString() || "",
                description: room.description || "",
                amenities: room.amenities || {},
                images: room.images || [],
            })
        }
    }, [room])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev: any) => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev: any) => ({ ...prev, [name]: value }))
    }

    const handleAmenityToggle = (key: string) => {
        setFormData((prev: any) => ({
            ...prev,
            amenities: {
                ...prev.amenities,
                [key]: !prev.amenities?.[key],
            },
        }))
    }

    const uploadImagesToCloudinary = async (files: FileList): Promise<string[]> => {
        const form = new FormData()
        Array.from(files).forEach((file) => {
            form.append("file", file)
        })

        const res = await fetch("/api/upload", { method: "POST", body: form })
        if (!res.ok) {
            const err = await res.json()
            throw new Error(err.error || "Upload failed")
        }
        const data = await res.json()
        return data.urls
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return
        setUploading(true)
        try {
            const uploadedUrls = await uploadImagesToCloudinary(files)
            setFormData((prev: any) => ({ ...prev, images: [...prev.images, ...uploadedUrls] }))
            toast.success("Tải ảnh lên thành công")
        } catch (error) {
            toast.error("Có lỗi khi tải ảnh")
        } finally {
            setUploading(false)
        }
    }

    const removeImage = (index: number) => {
        setFormData((prev: any) => ({ ...prev, images: prev.images.filter((_: string, i: number) => i !== index) }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user || user.role !== "host") {
            toast.error("Bạn cần đăng nhập bằng tài khoản host")
            return
        }
        if (!room?.id) {
            toast.error("Không tìm thấy phòng")
            return
        }

        if (!formData.roomType || !formData.homestayId || !formData.pricePerNight) {
            toast.error("Vui lòng nhập đủ thông tin bắt buộc")
            return
        }

        setLoading(true)
        try {
            // Ownership check
            const roomRef = doc(db, "rooms", room.id)
            const roomSnap = await getDoc(roomRef)
            if (!roomSnap.exists() || roomSnap.data().hostId !== user.id) {
                toast.error("Phòng không thuộc tài khoản của bạn")
                setLoading(false)
                return
            }

            await updateDoc(roomRef, {
                roomName: formData.roomName,
                roomType: formData.roomType,
                homestayId: formData.homestayId,
                pricePerNight: parseInt(formData.pricePerNight, 10) || 0,
                description: formData.description,
                amenities: formData.amenities,
                images: formData.images,
                updatedAt: new Date(),
            })

            toast.success("Cập nhật phòng thành công")
            setOpen(false)
            onUpdate()
        } catch (error) {
            toast.error("Cập nhật phòng thất bại")
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
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa phòng</DialogTitle>
                    <DialogDescription>Cập nhật thông tin chi tiết của phòng</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="roomName">Tên phòng</Label>
                            <Input id="roomName" name="roomName" value={formData.roomName} onChange={handleInputChange} placeholder="VD: MDR101 - Deluxe Room" />
                        </div>
                        <div className="space-y-2">
                            <Label>Loại phòng *</Label>
                            <Select value={formData.roomType} onValueChange={(v) => handleSelectChange("roomType", v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn loại phòng" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Single Bed">Single Bed</SelectItem>
                                    <SelectItem value="Double Bed">Double Bed</SelectItem>
                                    <SelectItem value="Deluxe Room">Deluxe Room</SelectItem>
                                    <SelectItem value="Family Suite">Family Suite</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Thuộc Homestay *</Label>
                            <Select value={formData.homestayId} onValueChange={(v) => handleSelectChange("homestayId", v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn homestay" />
                                </SelectTrigger>
                                <SelectContent>
                                    {homestays.map((h) => (
                                        <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Giá mỗi đêm (VND) *</Label>
                            <Input name="pricePerNight" type="number" min="0" value={formData.pricePerNight} onChange={handleInputChange} />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <Label>Mô tả</Label>
                            <Textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Tiện nghi</Label>
                        <div className="flex flex-wrap gap-3">
                            {Object.keys(formData.amenities || {}).length > 0 ? (
                                Object.entries(formData.amenities).map(([key, value]) => (
                                    <label key={key} className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" checked={!!value} onChange={() => handleAmenityToggle(key)} />
                                        {key}
                                    </label>
                                ))
                            ) : (
                                // Mặc định nếu amenities rỗng
                                ["Wifi", "Air Conditioner", "TV", "Parking", "Room Service"].map((k) => (
                                    <label key={k} className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" checked={!!formData.amenities?.[k]} onChange={() => handleAmenityToggle(k)} />
                                        {k}
                                    </label>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Hình ảnh phòng</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {formData.images?.map((img: string, idx: number) => (
                                <div key={idx} className="relative w-20 h-20">
                                    <Image src={img} alt="room" fill className="object-cover rounded" />
                                    <button type="button" className="absolute top-0 right-0 bg-white rounded-full p-1 shadow" onClick={() => removeImage(idx)}>
                                        <X className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            ))}
                            <label className="w-20 h-20 flex items-center justify-center border rounded cursor-pointer bg-muted">
                                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                                {uploading ? <Loader2 className="animate-spin" /> : <Edit />}
                            </label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={() => setOpen(false)} disabled={loading}>Hủy</Button>
                        <Button type="submit" disabled={loading}>{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Lưu thay đổi</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
