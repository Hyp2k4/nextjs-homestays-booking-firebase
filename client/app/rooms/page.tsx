"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { PropertyService } from "@/lib/property-service"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroSlider } from "@/components/hero-slider"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, MapPin, Home, CheckCircle, XCircle } from "lucide-react"

export default function RoomsPage() {
  const { user, toggleWishlist } = useAuth()
  const [rooms, setRooms] = useState<any[]>([])
  const [homestayById, setHomestayById] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState("")
  const [roomType, setRoomType] = useState<string>("all")
  const [homestayFilter, setHomestayFilter] = useState<string>("all")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000])

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      const { rooms: allRooms, homestayById: map } = await PropertyService.getAllPublicRooms()
      setRooms(allRooms)
      setHomestayById(map)
      setLoading(false)
    }
    run()
  }, [])

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0 }).format(
      price || 0
    )

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      const matchesSearch = [r.roomName, r.roomCode, r.roomType, r.description]
        .filter(Boolean)
        .some((v: string) => v.toLowerCase().includes(search.toLowerCase()))
      const matchesType = roomType === "all" || r.roomType === roomType
      const matchesHomestay = homestayFilter === "all" || r.homestayId === homestayFilter
      const price = r.pricePerNight || 0
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1]
      return matchesSearch && matchesType && matchesHomestay && matchesPrice
    })
  }, [rooms, search, roomType, homestayFilter, priceRange])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSlider />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Tất cả phòng</h1>
          <p className="text-muted-foreground">Khám phá các phòng từ nhiều homestay</p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-white p-4 rounded-lg border">
          <div className="col-span-1 md:col-span-2">
            <Input
              placeholder="Tìm theo tên phòng, mã phòng, loại phòng, mô tả..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={roomType} onValueChange={(v) => setRoomType(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Loại phòng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại phòng</SelectItem>
              <SelectItem value="Single Bed">Single Bed</SelectItem>
              <SelectItem value="Double Bed">Double Bed</SelectItem>
              <SelectItem value="Deluxe Room">Deluxe Room</SelectItem>
              <SelectItem value="Family Suite">Family Suite</SelectItem>
            </SelectContent>
          </Select>
          <Select value={homestayFilter} onValueChange={(v) => setHomestayFilter(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Homestay" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả Homestay</SelectItem>
              {Object.values(homestayById).map((h) => (
                <SelectItem key={h.id} value={h.id}>
                  {h.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Khoảng giá (VND/đêm)</div>
            <Slider
              value={[priceRange[0], priceRange[1]]}
              onValueChange={([min, max]) => setPriceRange([min, max])}
              min={0}
              max={10000000}
              step={50000}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatPrice(priceRange[0])}</span>
              <span>{formatPrice(priceRange[1])}</span>
            </div>
          </div>
        </div>

        {/* Results */}
        {filteredRooms.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-white">
            Không có phòng nào phù hợp.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => {
              const homestay = homestayById[room.homestayId]
              return (
                <Card key={room.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={room.images?.[0] || "/placeholder.jpg"}
                      alt={room.roomName || room.roomCode || room.roomType || "Room"}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary">{room.roomType || "Phòng"}</Badge>
                    </div>
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="rounded-full h-9 w-9"
                        onClick={async (e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          if (!toggleWishlist || !homestay) return
                          await toggleWishlist(homestay.id)
                        }}
                      >
                        <Heart
                          className={`h-5 w-5 ${user?.wishlist?.includes(homestay?.id) ? "fill-red-500 text-red-500" : ""}`}
                        />
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Home className="h-3 w-3" />
                        <span>{homestay?.name || "Không rõ Homestay"}</span>
                      </div>
                      <Badge variant={room.isActive !== false ? "default" : "secondary"}>
                        {room.isActive !== false ? "Đang hoạt động" : "Không hoạt động"}
                      </Badge>
                    </div>

                    <h3 className="font-serif font-semibold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {room.roomName || room.roomCode || "Phòng"}
                    </h3>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">Giá</div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-foreground">{formatPrice(room.pricePerNight || 0)}</div>
                        <div className="text-xs text-muted-foreground">/ đêm</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/room/${room.id}`} className="flex-1">
                        <Button className="w-full" variant="outline">View details</Button>
                      </Link>
                      <Link href={`/bookings?roomId=${room.id}`} className="flex-1">
                        <Button className="w-full">Book now</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
