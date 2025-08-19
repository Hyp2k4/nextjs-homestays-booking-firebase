"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import Image from "next/image"
import Link from "next/link"

import {
    LayoutDashboard,
    PlusSquare,
    List,
    Settings,
    LogOut
} from "lucide-react"
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function HostDashboardPage() {
    const { user, getHomestay, logout } = useAuth()
    const router = useRouter()
    const [homestays, setHomestays] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const checkAccess = useCallback(async () => {
        if (!user || user.role !== "host") {
            toast({
                title: "Truy cập bị từ chối",
                description: "Bạn cần đăng nhập với vai trò chủ homestay",
                variant: "destructive"
            })
            router.push("/")
            return
        }

        try {
            const homestayData = await getHomestay()
            // Bỏ phần redirect này - cho phép host vào dashboard ngay cả khi chưa có homestay
            setHomestays(homestayData || [])
        } catch (error) {
            console.error("Lỗi khi tải dashboard:", error)
            toast({
                title: "Lỗi",
                description: "Có lỗi xảy ra khi tải trang dashboard",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }, [user, getHomestay, router])

    useEffect(() => {
        checkAccess()
    }, [checkAccess])

    // Thêm handler cho navigation với fallback
    const handleNavigation = useCallback((path: string) => {
        console.log(`Attempting navigation to: ${path}`)
        
        // Dùng timeout để tránh router conflicts
        setTimeout(() => {
            try {
                console.log(`Router push to: ${path}`)
                router.push(path)
            } catch (error) {
                console.error("Router push failed:", error)
                console.log(`Fallback to window.location: ${path}`)
                window.location.href = path
            }
        }, 0)
    }, [router])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="hidden md:flex flex-col w-64 bg-white border-r">
                <div className="flex items-center justify-center h-16 border-b">
                    <Link href="/" className="flex items-center space-x-2">
                        <Image
                            src="/Logo.svg"
                            alt="Logo"
                            width={80}
                            height={80}
                        />
                    </Link>
                </div>
                <div className="flex flex-col flex-grow p-4 overflow-auto">
                    <nav className="flex-1 space-y-2">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-2"
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
                            className="w-full justify-start gap-2"
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleNavigation("/host/add-room")
                            }}
                        >
                            <PlusSquare className="h-4 w-4" />
                            Add Room
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-2"
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
                            onClick={logout}
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
                    <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Tổng số homestays</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">{homestays.length}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">25,000,000 VND</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Phòng trống</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">5</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Đặt phòng hôm nay</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">3</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* List Homestays */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Danh sách Homestays</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {homestays.length > 0 ? (
                                <ul className="space-y-4">
                                    {homestays.map((hs: any) => (
                                        <li key={hs._id} className="p-4 border rounded-lg bg-white shadow-sm flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-lg">{hs.name}</p>
                                                <p className="text-sm text-gray-600">{hs.address}</p>
                                            </div>
                                            <Link href={`/host/homestay/${hs._id}`}>
                                                <Button size="sm">Chi tiết</Button>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>Bạn chưa có homestay nào.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}