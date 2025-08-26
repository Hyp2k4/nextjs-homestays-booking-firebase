"use client"
import React, { useState, useEffect } from "react"
import { AdminDashboardLayout } from "@/components/admin/dashboard-layout"
import { db } from "@/lib/firebase/config"
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Upload, X, Save } from "lucide-react"

interface HeroSettings {
  title: string
  subtitle: string
  description: string
  ctaText: string
  ctaLink: string
  backgroundImages: string[]
  overlayOpacity: number
}

export default function HeroSettingsPage() {
    const [heroSettings, setHeroSettings] = useState<HeroSettings>({
        title: "Discover Amazing Homestays",
        subtitle: "Your Perfect Home Away From Home",
        description: "Find unique accommodations and unforgettable experiences around the world",
        ctaText: "Start Exploring",
        ctaLink: "/homestays",
        backgroundImages: [],
        overlayOpacity: 0.4
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        const fetchHeroSettings = async () => {
            try {
                const docRef = doc(db, "settings", "hero")
                const docSnap = await getDoc(docRef)
                if (docSnap.exists()) {
                    setHeroSettings({ ...heroSettings, ...docSnap.data() })
                }
            } catch (error) {
                console.error("Error fetching hero settings:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchHeroSettings()
    }, [])

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    setHeroSettings(prev => ({
                        ...prev,
                        backgroundImages: [...prev.backgroundImages, reader.result as string]
                    }))
                }
            }
            reader.readAsDataURL(file)
        }
    }

    const handleRemoveImage = (index: number) => {
        setHeroSettings(prev => ({
            ...prev,
            backgroundImages: prev.backgroundImages.filter((_, i) => i !== index)
        }))
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const docRef = doc(db, "settings", "hero")
            await setDoc(docRef, heroSettings, { merge: true })
            toast.success("Hero settings saved successfully!")
        } catch (error) {
            console.error("Error saving hero settings:", error)
            toast.error("Failed to save hero settings")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <AdminDashboardLayout title="Hero Settings">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-neutral-200 rounded w-1/3"></div>
                    <div className="h-32 bg-neutral-200 rounded"></div>
                    <div className="h-32 bg-neutral-200 rounded"></div>
                </div>
            </AdminDashboardLayout>
        )
    }

    return (
        <AdminDashboardLayout title="Hero Banner Settings">
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-neutral-900">Hero Banner Configuration</h2>
                        <p className="text-neutral-600 mt-1">Customize the homepage hero section content and appearance</p>
                    </div>
                    <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>

                {/* Content Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Content Settings</CardTitle>
                        <CardDescription>Configure the text content displayed in the hero section</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Main Title</Label>
                                <Input
                                    id="title"
                                    value={heroSettings.title}
                                    onChange={(e) => setHeroSettings(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Enter main title"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subtitle">Subtitle</Label>
                                <Input
                                    id="subtitle"
                                    value={heroSettings.subtitle}
                                    onChange={(e) => setHeroSettings(prev => ({ ...prev, subtitle: e.target.value }))}
                                    placeholder="Enter subtitle"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={heroSettings.description}
                                onChange={(e) => setHeroSettings(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Enter description"
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="ctaText">Call-to-Action Text</Label>
                                <Input
                                    id="ctaText"
                                    value={heroSettings.ctaText}
                                    onChange={(e) => setHeroSettings(prev => ({ ...prev, ctaText: e.target.value }))}
                                    placeholder="Enter CTA text"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ctaLink">Call-to-Action Link</Label>
                                <Input
                                    id="ctaLink"
                                    value={heroSettings.ctaLink}
                                    onChange={(e) => setHeroSettings(prev => ({ ...prev, ctaLink: e.target.value }))}
                                    placeholder="Enter CTA link"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Background Images */}
                <Card>
                    <CardHeader>
                        <CardTitle>Background Images</CardTitle>
                        <CardDescription>Upload and manage background images for the hero section</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {heroSettings.backgroundImages.map((src, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={src}
                                        alt={`Hero Background ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-lg border border-neutral-200"
                                    />
                                    <Button
                                        onClick={() => handleRemoveImage(index)}
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="cursor-pointer"
                                />
                            </div>
                            <Button variant="outline" className="flex items-center gap-2">
                                <Upload className="h-4 w-4" />
                                Upload Image
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Appearance Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Appearance Settings</CardTitle>
                        <CardDescription>Customize the visual appearance of the hero section</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="overlayOpacity">Overlay Opacity ({Math.round(heroSettings.overlayOpacity * 100)}%)</Label>
                            <input
                                type="range"
                                id="overlayOpacity"
                                min="0"
                                max="1"
                                step="0.1"
                                value={heroSettings.overlayOpacity}
                                onChange={(e) => setHeroSettings(prev => ({ ...prev, overlayOpacity: parseFloat(e.target.value) }))}
                                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Preview */}
                <Card>
                    <CardHeader>
                        <CardTitle>Preview</CardTitle>
                        <CardDescription>Preview how the hero section will look</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative h-64 rounded-lg overflow-hidden bg-gradient-to-r from-primary-600 to-primary-800">
                            {heroSettings.backgroundImages[0] && (
                                <img
                                    src={heroSettings.backgroundImages[0]}
                                    alt="Hero Preview"
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            )}
                            <div
                                className="absolute inset-0 bg-black"
                                style={{ opacity: heroSettings.overlayOpacity }}
                            ></div>
                            <div className="relative z-10 flex items-center justify-center h-full text-center text-white p-8">
                                <div className="space-y-4">
                                    <h1 className="text-3xl font-bold">{heroSettings.title}</h1>
                                    <h2 className="text-xl">{heroSettings.subtitle}</h2>
                                    <p className="text-sm opacity-90">{heroSettings.description}</p>
                                    <Button variant="secondary" className="mt-4">
                                        {heroSettings.ctaText}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminDashboardLayout>
    )
}
