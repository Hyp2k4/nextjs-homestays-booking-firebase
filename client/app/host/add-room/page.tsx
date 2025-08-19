"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { LayoutDashboard, PlusSquare, List, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/firebase/config"
import { addDoc, collection } from "firebase/firestore"
import { toast, ToastContainer } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css'

const defaultAmenities = {
  Wifi: false,
  "Air Conditioner": false,
  TV: false,
  Parking: false,
  "Room Service": false,
}

export default function AddRoomPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [navigating, setNavigating] = useState(false)
  const [images, setImages] = useState<{ [key: string]: File | null }>({
    img1: null, img2: null, img3: null, img4: null,
  })
  const [previews, setPreviews] = useState<{ [key: string]: string }>({
    img1: "", img2: "", img3: "", img4: "",
  })
  const [inputs, setInputs] = useState({
    roomType: "",
    pricePerNight: "",
    description: "",
    amenities: defaultAmenities,
  })

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
    setInputs({ roomType: "", pricePerNight: "", description: "", amenities: defaultAmenities })
    setImages({ img1: null, img2: null, img3: null, img4: null })
    setPreviews({ img1: "", img2: "", img3: "", img4: "" })
  }

  const onSubmitHandle = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const imageUrls = await uploadImagesToCloudinary()

      await addDoc(collection(db, "rooms"), {
        ...inputs,
        pricePerNight: Number(inputs.pricePerNight),
        images: imageUrls,
        createdAt: new Date(),
      })

      toast.success("Thêm phòng thành công!")
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
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-white border-r">
        <div className="flex items-center justify-center h-16 border-b">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/Logo.svg" alt="Logo" width={80} height={80} />
          </Link>
        </div>
        <div className="flex flex-col flex-grow p-4 overflow-auto">
          <nav className="flex-1 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              disabled={navigating}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleNavigation("/host/dashboard")
              }}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 bg-gray-100"
              disabled={navigating}
            >
              <PlusSquare className="h-4 w-4" />
              Add Room
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              disabled={navigating}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleNavigation("/host/list-rooms")
              }}
            >
              <List className="h-4 w-4" />
              List Rooms
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              disabled={navigating}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleNavigation("/host/settings")
              }}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </nav>
          <div className="mt-auto">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-red-500 hover:text-red-700"
              disabled={navigating}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleLogout()
              }}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-8">
          <form onSubmit={onSubmitHandle} className="max-w-2xl">
            <h1 className="text-2xl font-bold">Add Room</h1>
            <p className="text-gray-600">Fill in the details carefully.</p>

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