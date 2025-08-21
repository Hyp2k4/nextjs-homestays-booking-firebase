"use client"

import { useEffect, useState } from "react"
import { getBookings } from "@/lib/admin-service"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import type { Booking } from "@/types/booking"

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            const bookingsData = await getBookings()
            setBookings(bookingsData as Booking[])
            setLoading(false)
        }
        fetchData()
    }, [])

    const formatDate = (timestamp: any) => {
        if (timestamp && timestamp.seconds) {
            return new Date(timestamp.seconds * 1000).toLocaleDateString()
        }
        return "N/A"
    }

    if (loading) {
        return <div>Loading bookings...</div>
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Bookings</h1>
            <Card>
                <CardHeader>
                    <CardTitle>All Bookings</CardTitle>
                    <CardDescription>A list of all bookings in the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Homestay</TableHead>
                                <TableHead>Check-in</TableHead>
                                <TableHead>Check-out</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total Price</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bookings.map((booking) => (
                                <TableRow key={booking.id}>
                                    <TableCell>
                                        <div className="font-medium">{booking.userName}</div>
                                        <div className="text-sm text-muted-foreground">{booking.userEmail}</div>
                                    </TableCell>
                                    <TableCell>{booking.homestayName || 'N/A'}</TableCell>
                                    <TableCell>{formatDate(booking.checkInDate)}</TableCell>
                                    <TableCell>{formatDate(booking.checkOutDate)}</TableCell>
                                    <TableCell>
                                        <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                                            {booking.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">{formatPrice(booking.totalPrice)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};
