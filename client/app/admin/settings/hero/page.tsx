"use client"
import React, { useState, useEffect } from "react"
import { db } from "@/lib/firebase/config"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function HeroSettingsPage() {
    const [heroImages, setHeroImages] = useState<string[]>([])
    const [newImage, setNewImage] = useState<string | null>(null)

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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    setNewImage(reader.result)
                }
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

    const handleRemoveImage = async (index: number) => {
        const updatedImages = heroImages.filter((_, i) => i !== index)
        await updateDoc(doc(db, "settings", "hero"), { images: updatedImages })
        setHeroImages(updatedImages)
        toast.success("Hero image removed successfully!")
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Hero Images</CardTitle>
                <CardDescription>Manage the images displayed on the homepage hero section.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {heroImages.map((src, index) => (
                        <div key={index} className="relative group">
                            <img src={src} alt={`Hero Image ${index + 1}`} className="w-full h-32 object-cover rounded-md" />
                            <Button onClick={() => handleRemoveImage(index)} variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                &times;
                            </Button>
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-4">
                    <Input type="file" onChange={handleImageChange} className="flex-grow" />
                    <Button onClick={handleAddImage} disabled={!newImage}>
                        Add Image
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
