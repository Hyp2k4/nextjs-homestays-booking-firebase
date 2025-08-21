"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
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

export function HomestayDetailModal({ homestay, host, rooms, bookings, revenue, isOpen, onClose }: any) {
  if (!homestay) return null

  const amenityIcons: { [key: string]: React.ReactNode } = {
    wifi: <Wifi className="w-4 h-4" />,
    parking: <Car className="w-4 h-4" />,
    kitchen: <Utensils className="w-4 h-4" />,
    tv: <Tv className="w-4 h-4" />,
    ac: <Snowflake className="w-4 h-4" />,
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>{homestay.name}</DialogTitle>
          <DialogDescription>
            {homestay.address}, {homestay.city}
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="homestay">
          <TabsList>
            <TabsTrigger value="homestay">Homestay</TabsTrigger>
            <TabsTrigger value="host">Host</TabsTrigger>
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
          </TabsList>
          <TabsContent value="homestay">
            <div className="mt-4">
              <Carousel>
                <CarouselContent>
                  {homestay.images.map((image: string, index: number) => (
                    <CarouselItem key={index}>
                      <Image src={image} alt={homestay.name} width={1200} height={800} className="rounded-lg object-cover" />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">{homestay.description}</p>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <Home className="w-4 h-4 mr-2" />
                        <span>{homestay.propertyType}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        <span>{homestay.maxGuests} guests</span>
                      </div>
                      <div className="flex items-center">
                        <Bed className="w-4 h-4 mr-2" />
                        <span>{homestay.bedrooms} bedrooms</span>
                      </div>
                      <div className="flex items-center">
                        <Bath className="w-4 h-4 mr-2" />
                        <span>{homestay.bathrooms} bathrooms</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Amenities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(homestay.amenities).map(([key, value]) => (
                        <div key={key} className="flex items-center">
                          {amenityIcons[key]}
                          <span className="ml-2">{key}</span>
                        </div>
                      ))}
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
                <div className="flex items-center space-x-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={host?.avatar} />
                    <AvatarFallback>{host?.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-xl">{host?.name}</p>
                    <p className="text-sm text-gray-500">{host?.email}</p>
                    <p className="text-sm text-gray-500">{host?.phone ? formatPhoneNumber(host.phone) : "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="rooms">
            <Card>
              <CardHeader>
                <CardTitle>Rooms</CardTitle>
              </CardHeader>
              <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Capacity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms?.map((room: any) => (
                    <TableRow key={room.id}>
                      <TableCell>
                        <Image src={room.images[0]} alt={room.roomName} width={100} height={100} className="rounded-lg object-cover" />
                      </TableCell>
                      <TableCell>{room.roomName}</TableCell>
                      <TableCell>{formatPrice(room.pricePerNight)}</TableCell>
                      <TableCell>{room.capacity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Check-out</TableHead>
                      <TableHead>Total Price</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings?.map((booking: any) => (
                      <TableRow key={booking.id}>
                        <TableCell>{booking.userName}</TableCell>
                        <TableCell>{format(new Date(booking.checkInDate.seconds * 1000), "dd/MM/yyyy")}</TableCell>
                        <TableCell>{format(new Date(booking.checkOutDate.seconds * 1000), "dd/MM/yyyy")}</TableCell>
                        <TableCell>{formatPrice(booking.totalPrice)}</TableCell>
                        <TableCell>
                          <Badge>{booking.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Financials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Wallet className="w-4 h-4 mr-2" />
                  <span className="font-semibold">Total Revenue: {formatPrice(revenue)}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
