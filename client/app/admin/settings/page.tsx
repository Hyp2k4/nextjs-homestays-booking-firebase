// @ts-nocheck
"use client"
import { useState, useEffect } from "react"
import { db } from "@/lib/firebase/config"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { toast } from "sonner"

const SettingsPage = () => {
    const [heroImages, setHeroImages] = useState([])
    const [newImage, setNewImage] = useState(null)

    useEffect(() => {
        const fetchHeroImages = async () => {
            const docRef = doc(db, "settings", "hero")
            const docSnap = await getDoc(docRef)
            if (docSnap.exists()) {
                setHeroImages(docSnap.data().images || [])
            }
        }
        fetchHeroImages()
    }, [])

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setNewImage(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleAddImage = async () => {
        if (newImage) {
            const updatedImages = [...heroImages, newImage]
            await updateDoc(doc(db, "settings", "hero"), { images: updatedImages })
            setHeroImages(updatedImages)
            setNewImage(null)
            toast.success("Hero image added successfully!")
        }
    }

    const handleRemoveImage = async (index) => {
        const updatedImages = heroImages.filter((_, i) => i !== index)
        await updateDoc(doc(db, "settings", "hero"), { images: updatedImages })
        setHeroImages(updatedImages)
        toast.success("Hero image removed successfully!")
    }

    return (
        <div className="flex">
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
                <h1 className="text-3xl font-bold mb-6">Settings</h1>
                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Hero Images</h2>
                        <div className="grid grid-cols-4 gap-4 mb-4">
                            {heroImages.map((src, index) => (
                                <div key={index} className="relative">
                                    <img src={src} alt={`Hero Image ${index + 1}`} className="w-full h-32 object-cover" />
                                    <button onClick={() => handleRemoveImage(index)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1">
                                        X
                                    </button>
                                </div>
                            ))}
                        </div>
                        <input type="file" onChange={handleImageChange} />
                        <button onClick={handleAddImage} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
                            Add Image
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default SettingsPage
