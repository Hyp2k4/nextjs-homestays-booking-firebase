"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { Bed, Bath, Users, Home, User, Wallet, Calendar, Wifi, Car, Utensils, Tv, Snowflake } from "lucide-react"
import Image from "next/image"
import { formatPrice, formatPhoneNumber } from "@/lib/utils"

interface Homestay {
  id: string
  name: string
  address: string
  city: string
  description: string
  propertyType: string
  maxGuests: number
  bedrooms: number
  bathrooms: number
  amenities: { [key: string]: boolean }
  images: string[]
}

interface Host {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
}

interface Room {
  id: string
  roomName: string
  pricePerNight: number
  capacity: number
  images: string[]
}

interface Booking {
  id: string
  userName: string
  checkInDate: { seconds: number }
  checkOutDate: { seconds: number }
  totalPrice: number
  status: "pending" | "confirmed" | "cancelled" | "completed" | "unpaid" | "paid"
}

interface HomestayDetailModalProps {
  homestay: Homestay
  host: Host | null
  rooms: Room[] | null
  bookings: Booking[] | null
  revenue: number
  isOpen: boolean
  onClose: () => void
}

export function HomestayDetailModal({ homestay, host, rooms, bookings, revenue, isOpen, onClose }: HomestayDetailModalProps) {
  if (!homestay) return null

  const amenityIcons: { [key: string]: React.ReactNode } = {
    wifi: <Wifi className="w-6 h-6 text-primary" />,
    parking: <Car className="w-6 h-6 text-primary" />,
    kitchen: <Utensils className="w-6 h-6 text-primary" />,
    tv: <Tv className="w-6 h-6 text-primary" />,
    ac: <Snowflake className="w-6 h-6 text-primary" />,
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] md:max-w-4xl lg:max-w-6xl max-h-[90vh] overflow-y-auto bg-gray-900 text-gray-200 font-montserrat">
        <DialogHeader>
          <DialogTitle className="text-2xl md:text-3xl font-bold text-white">{homestay.name}</DialogTitle>
          <DialogDescription className="text-gray-400 font-open-sans">
            {homestay.address}, {homestay.city}
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="homestay" className="mt-4">
          <TabsList className="grid grid-cols-4 gap-2 bg-gray-800">
            <TabsTrigger value="homestay" className="text-gray-200 data-[state=active]:bg-primary data-[state=active]:text-white">
              Homestay
            </TabsTrigger>
            <TabsTrigger value="host" className="text-gray-200 data-[state=active]:bg-primary data-[state=active]:text-white">
              Host
            </TabsTrigger>
            <TabsTrigger value="rooms" className="text-gray-200 data-[state=active]:bg-primary data-[state=active]:text-white">
              Rooms
            </TabsTrigger>
            <TabsTrigger value="bookings" className="text-gray-200 data-[state=active]:bg-primary data-[state=active]:text-white">
              Bookings
            </TabsTrigger>
          </TabsList>
          <TabsContent value="homestay" className="mt-6">
            <div className="space-y-6">
              <Carousel className="w-full">
                <CarouselContent>
                  {homestay.images && homestay.images.length > 0 ? (
                    homestay.images.map((image, index) => (
                      <CarouselItem key={index}>
                        <Image
                          src={image}
                          alt={`${homestay.name} image ${index + 1}`}
                          width={1200}
                          height={600}
                          className="rounded-lg object-cover w-full h-[300px] md:h-[400px]"
                          priority={index === 0}
                        />
                      </CarouselItem>
                    ))
                  ) : (
                    <CarouselItem>
                      <div className="flex items-center justify-center h-[300px] md:h-[400px] bg-gray-800 rounded-lg">
                        <p className="text-gray-400 font-open-sans">No images available</p>
                      </div>
                    </CarouselItem>
                  )}
                </CarouselContent>
                {homestay.images && homestay.images.length > 1 && (
                  <>
                    <CarouselPrevious className="left-2 bg-gray-800 text-gray-200 hover:bg-primary" />
                    <CarouselNext className="right-2 bg-gray-800 text-gray-200 hover:bg-primary" />
                  </>
                )}
              </Carousel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-400 font-open-sans">{homestay.description || "No description available"}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Home className="w-6 h-6 text-primary" />
                        <span className="text-gray-200 font-open-sans">{homestay.propertyType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-6 h-6 text-primary" />
                        <span className="text-gray-200 font-open-sans">{homestay.maxGuests} guests</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bed className="w-6 h-6 text-primary" />
                        <span className="text-gray-200 font-open-sans">{homestay.bedrooms} bedrooms</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bath className="w-6 h-6 text-primary" />
                        <span className="text-gray-200 font-open-sans">{homestay.bathrooms} bathrooms</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Amenities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {homestay.amenities && Object.entries(homestay.amenities).length > 0 ? (
                        Object.entries(homestay.amenities).map(([key, value]) => (
                          value && (
                            <div key={key} className="flex items-center gap-2">
                              {amenityIcons[key] || <Home className="w-6 h-6 text-primary" />}
                              <span className="text-gray-200 font-open-sans capitalize">{key}</span>
                            </div>
                          )
                        ))
                      ) : (
                        <p className="text-gray-400 font-open-sans">No amenities available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="host">
            <Card>
              <CardHeader>
                <CardTitle>Host Details</CardTitle>
              </CardHeader>
              <CardContent>
                {host ? (
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                    <Avatar className="w-16 h-16 md:w-20 md:h-20">
                      <AvatarImage src={host.avatar} />
                      <AvatarFallback className="bg-gray-700 text-white">{host.name?.[0] || "H"}</AvatarFallback>
                    </Avatar>
                    <div className="text-center sm:text-left">
                      <p className="text-xl font-semibold text-white font-montserrat">{host.name}</p>
                      <p className="text-gray-400 font-open-sans">{host.email}</p>
                      <p className="text-gray-400 font-open-sans">{host.phone ? formatPhoneNumber(host.phone) : "No phone provided"}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 font-open-sans">No host information available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="rooms">
            <Card>
              <CardHeader>
                <CardTitle>Rooms</CardTitle>
              </CardHeader>
              <CardContent>
                {rooms && rooms.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-200">Image</TableHead>
                        <TableHead className="text-gray-200">Name</TableHead>
                        <TableHead className="text-gray-200">Price</TableHead>
                        <TableHead className="text-gray-200">Capacity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rooms.map((room: Room) => (
                        <TableRow key={room.id} className="border-gray-700">
                          <TableCell>
                            <Image
                              src={room.images?.[0] || "/placeholder.jpg"}
                              alt={room.roomName}
                              width={80}
                              height={80}
                              className="rounded-lg object-cover"
                            />
                          </TableCell>
                          <TableCell className="text-gray-200 font-open-sans">{room.roomName}</TableCell>
                          <TableCell className="text-gray-200 font-open-sans">{formatPrice(room.pricePerNight)}</TableCell>
                          <TableCell className="text-gray-200 font-open-sans">{room.capacity}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-gray-400 font-open-sans">No rooms available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="bookings">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  {bookings && bookings.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-700">
                          <TableHead className="text-gray-200">User</TableHead>
                          <TableHead className="text-gray-200">Check-in</TableHead>
                          <TableHead className="text-gray-200">Check-out</TableHead>
                          <TableHead className="text-gray-200">Total Price</TableHead>
                          <TableHead className="text-gray-200">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookings.map((booking: Booking) => (
                          <TableRow key={booking.id} className="border-gray-700">
                            <TableCell className="text-gray-200 font-open-sans">{booking.userName}</TableCell>
                            <TableCell className="text-gray-200 font-open-sans">
                              {format(new Date(booking.checkInDate.seconds * 1000), "dd/MM/yyyy")}
                            </TableCell>
                            <TableCell className="text-gray-200 font-open-sans">
                              {format(new Date(booking.checkOutDate.seconds * 1000), "dd/MM/yyyy")}
                            </TableCell>
                            <TableCell className="text-gray-200 font-open-sans">{formatPrice(booking.totalPrice)}</TableCell>
                            <TableCell>
                              <Badge
                                className={booking.status === "confirmed" ? "bg-green-600" : booking.status === "cancelled" ? "bg-red-600" : "bg-gray-600"}
                              >
                                {booking.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-gray-400 font-open-sans">No bookings available</p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Financials</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Wallet className="w-6 h-6 text-primary" />
                    <span className="text-gray-200 font-open-sans font-semibold">Total Revenue: {formatPrice(revenue)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}