"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { BookingService } from "@/lib/booking-service"
import type { Booking } from "@/types/booking"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle, Calendar, Moon, Users, Mail, User, Hash, CreditCard } from "lucide-react"
import { formatPrice } from "@/lib/utils"

export default function BookingDetailsPage() {
  const params = useParams()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const bookingId = params?.id as string
    if (bookingId) {
      const fetchBooking = async () => {
        setLoading(true)
        try {
          const fetchedBooking = await BookingService.getBookingById(bookingId)
          setBooking(fetchedBooking)
        } catch (error) {
          console.error("Failed to fetch booking details:", error)
        } finally {
          setLoading(false)
        }
      }
      fetchBooking()
    }
  }, [params?.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!booking) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="mt-4 text-2xl font-bold">Booking Not Found</h1>
          <p className="mt-2 text-muted-foreground">
            The booking details could not be found. Please check the ID and try again.
          </p>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Booking Confirmation</CardTitle>
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Booking ID: {booking.id}</p>
              <Badge className="capitalize">{booking.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <User className="h-5 w-5 mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Booked by</p>
                <p className="font-semibold">{booking.userName}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Mail className="h-5 w-5 mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-semibold">{booking.userEmail}</p>
              </div>
            </div>
            <div className="border-t my-4" />
            <h3 className="font-semibold">{booking.roomName || booking.propertyTitle}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Check-in</p>
                  <p className="font-semibold">{new Date(booking.checkInDate.seconds * 1000).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Check-out</p>
                  <p className="font-semibold">{new Date(booking.checkOutDate.seconds * 1000).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Moon className="h-5 w-5 mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Nights</p>
                  <p className="font-semibold">{booking.totalNights}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Guests</p>
                  <p className="font-semibold">{booking.guests}</p>
                </div>
              </div>
            </div>
            <div className="border-t my-4" />
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Payment Status</p>
                <p className="font-semibold capitalize">{booking.paymentStatus}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Total Price</p>
              <p className="text-2xl font-bold">{formatPrice(booking.totalPrice)}</p>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
