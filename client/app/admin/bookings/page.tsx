"use client"

import { useEffect, useState } from "react"
import { getBookings } from "@/lib/admin-service"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ListBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const bookingsData = await getBookings()
      setBookings(bookingsData)
    }
    fetchData()
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Bookings</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Room</TableHead>
            <TableHead>Check-in</TableHead>
            <TableHead>Check-out</TableHead>
            <TableHead>Total Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell>{booking.userName}</TableCell>
              <TableCell>{booking.roomName}</TableCell>
              <TableCell>
                {booking.checkIn?.seconds
                  ? new Date(booking.checkIn.seconds * 1000).toLocaleDateString()
                  : "N/A"}
              </TableCell>
              <TableCell>
                {booking.checkOut?.seconds
                  ? new Date(booking.checkOut.seconds * 1000).toLocaleDateString()
                  : "N/A"}
              </TableCell>
              <TableCell>{booking.totalPrice}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
