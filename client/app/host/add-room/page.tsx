"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { LayoutDashboard, PlusSquare, List, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/firebase/config"
import { addDoc, collection } from "firebase/firestore"
import { toast } from "sonner"
import { HostService } from "@/lib/host-service"
import { useAuth } from "@/contexts/auth-context"

const defaultAmenities = {
  Wifi: false,
  "Air Conditioner": false,
  TV: false,
  Parking: false,
  "Room Service": false,
}

export default function AddRoomPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [navigating, setNavigating] = useState(false)
  const [images, setImages] = useState<{ [key: string]: File | null }>({
    img1: null, img2: null, img3: null, img4: null,
  })
  const [previews, setPreviews] = useState<{ [key: string]: string }>({
    img1: "", img2: "", img3: "", img4: "",
  })
  const [inputs, setInputs] = useState({
    homestayId: "", // Thêm homestayId
    roomName: "",
    roomType: "",
    pricePerNight: "",
    description: "",
    amenities: defaultAmenities,
  })
  const [homestays, setHomestays] = useState<any[]>([])

  // Thêm navigation handler
  const handleNavigation = useCallback((path: string) => {
    if (navigating) {
      console.log("Navigation already in progress, ignoring")
      return
    }

    console.log(`Attempting navigation to: ${path}`)
    setNavigating(true)

    setTimeout(() => {
      try {
        console.log(`Router push to: ${path}`)
        router.push(path)
      } catch (error) {
        console.error("Router push failed:", error)
        console.log(`Fallback to window.location: ${path}`)
        window.location.href = path
      } finally {
        setTimeout(() => setNavigating(false), 2000)
      }
    }, 0)
  }, [router, navigating])

  // Logout handler
  const handleLogout = useCallback(() => {
    // Thêm logic logout của bạn ở đây
    console.log("Logging out...")
    router.push("/")
  }, [router])

  const handleFileChange = (key: string, file: File | null) => {
    setImages({ ...images, [key]: file })
    setPreviews({ ...previews, [key]: file ? URL.createObjectURL(file) : "" })
  }

  const uploadImagesToCloudinary = async (): Promise<string[]> => {
    const formData = new FormData()
    Object.values(images).forEach((file) => {
      if (file) formData.append("file", file); // key phải trùng với server
    });

    const res = await fetch("/api/upload", { method: "POST", body: formData })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || "Upload failed")
    }

    const data = await res.json()
    console.log("Upload thành công, nhận URLs từ Cloudinary:", data.urls)
    return data.urls
  }

  const resetForm = () => {
    setInputs({ homestayId: "", roomName: "", roomType: "", pricePerNight: "", description: "", amenities: defaultAmenities })
    setImages({ img1: null, img2: null, img3: null, img4: null })
    setPreviews({ img1: "", img2: "", img3: "", img4: "" })
  }

  // Load homestays khi component mount
  useEffect(() => {
    const loadHomestays = async () => {
      if (user) {
        try {
          const homestaysData = await HostService.getHostHomestays(user.id)
          setHomestays(homestaysData)
        } catch (error) {
          console.error("Lỗi khi tải danh sách homestay:", error)
        }
      }
    }
    loadHomestays()
  }, [user])

  if (!user || user.role !== "host") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Truy cập bị từ chối</h1>
          <p className="text-gray-600">Bạn cần đăng nhập với vai trò chủ homestay để truy cập trang này.</p>
        </div>
      </div>
    )
  }

  const onSubmitHandle = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || user.role !== "host") {
      toast.error("Bạn cần đăng nhập với vai trò chủ homestay để thêm phòng")
      return
    }

    setLoading(true)

    try {
      const imageUrls = await uploadImagesToCloudinary()
      
      // Tự động tạo mã số phòng
      const roomCode = await HostService.getNextRoomNumber(inputs.roomType, user.id, inputs.homestayId)

      await addDoc(collection(db, "rooms"), {
        ...inputs,
        hostId: user.id, // Lưu hostId của user đang đăng nhập
        homestayId: inputs.homestayId, // Lưu homestayId
        roomCode: roomCode,
        roomName: inputs.roomName,
        pricePerNight: Number(inputs.pricePerNight),
        images: imageUrls,
        isActive: true, // Mặc định phòng mới sẽ hoạt động
        rules: ["Không được sử dụng chất kích thích, rượu, bia"], // Add default rule
        createdAt: new Date(),
      })

      toast.success(`Thêm phòng thành công! Mã phòng: ${roomCode}`)
      resetForm() // reset form khi thành công
    } catch (err) {
      console.error(err)
      toast.error("Không thể thêm phòng, vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-8">
          <form onSubmit={onSubmitHandle} className="max-w-2xl">
            <h1 className="text-2xl font-bold">Add Room</h1>
            <p className="text-gray-600">Fill in the details carefully.</p>

            {/* Homestay Selection */}
            <div className="mt-6">
              <p className="text-gray-800 mb-2">Chọn Homestay</p>
              <select 
                value={inputs.homestayId} 
                onChange={(e) => setInputs({ ...inputs, homestayId: e.target.value })} 
                className="border border-gray-300 rounded p-2 w-full"
                required
              >
                <option value="">Chọn homestay để thêm phòng</option>
                {homestays.map((homestay) => (
                  <option key={homestay.id} value={homestay.id}>
                    {homestay.name} - {homestay.city}
                  </option>
                ))}
              </select>
              {homestays.length === 0 && (
                <p className="text-sm text-red-500 mt-1">
                  Bạn cần tạo homestay trước khi thêm phòng. 
                  <button 
                    type="button" 
                    onClick={() => handleNavigation("/host")}
                    className="text-blue-500 underline ml-1"
                  >
                    Tạo homestay ngay
                  </button>
                </p>
              )}
            </div>

            {/* 4 Image Slots */}
            <p className="text-gray-800 mt-6">Images</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-2">
              {["img1", "img2", "img3", "img4"].map((key) => (
                <label key={key} className="cursor-pointer border rounded overflow-hidden w-full h-32 flex items-center justify-center bg-gray-100">
                  {previews[key] ? (
                    <img src={previews[key]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400">Upload</span>
                  )}
                  <input type="file" accept="image/*" hidden onChange={(e) => handleFileChange(key, e.target.files?.[0] || null)} />
                </label>
              ))}
            </div>

            {/* Room Name */}
            <p className="text-gray-800 mt-4">Room Name</p>
            <input type="text" placeholder="Enter room name" className="border border-gray-300 mt-1 rounded p-2 w-full" value={inputs.roomName} onChange={(e) => setInputs({ ...inputs, roomName: e.target.value })} />

            {/* Room Type & Price */}
            <div className="w-full flex max-sm:flex-col sm:gap-4 mt-4">
              <div className="flex-1 max-w-48">
                <p className="text-gray-800 mt-4">Room Type</p>
                <select value={inputs.roomType} onChange={(e) => setInputs({ ...inputs, roomType: e.target.value })} className="border border-gray-300 mt-1 rounded p-2 w-full">
                  <option value="">Select Room Type</option>
                  <option value="Single Bed">Single Bed</option>
                  <option value="Double Bed">Double Bed</option>
                  <option value="Deluxe Room">Deluxe Room</option>
                  <option value="Family Suite">Family Suite</option>
                </select>
              </div>
              <div>
                <p className="mt-4 text-gray-800">Price <span className="text-xs">/night</span></p>
                <input type="number" placeholder="0" className="border border-gray-300 mt-1 rounded p-2 w-24" value={inputs.pricePerNight} onChange={(e) => setInputs({ ...inputs, pricePerNight: e.target.value })} />
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-800 mt-4">Description</p>
            <textarea placeholder="Enter room description" className="border border-gray-300 mt-1 rounded p-2 w-full min-h-[100px]" value={inputs.description} onChange={(e) => setInputs({ ...inputs, description: e.target.value })} />

            {/* Amenities */}
            <p className="text-gray-800 mt-4">Amenities</p>
            <div className="flex flex-col flex-wrap mt-1 text-gray-600 max-w-sm">
              {Object.keys(inputs.amenities).map((amenity, index) => (
                <div key={index}>
                  <input type="checkbox" id={`amenities${index + 1}`} checked={inputs.amenities[amenity as keyof typeof defaultAmenities]} onChange={() => setInputs({ ...inputs, amenities: { ...inputs.amenities, [amenity]: !inputs.amenities[amenity as keyof typeof defaultAmenities] } })} />
                  <label htmlFor={`amenities${index + 1}`} className="ml-2 cursor-pointer">{amenity}</label>
                </div>
              ))}
            </div>

            <button className="bg-primary text-white px-8 py-2 rounded mt-8 cursor-pointer" disabled={loading}>{loading ? "Adding..." : "Add Room"}</button>
          </form>
        </div>
      </div>
    </div>
  )
}
