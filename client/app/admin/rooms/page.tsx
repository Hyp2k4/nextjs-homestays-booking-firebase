"use client"

import { useEffect, useState } from "react"
import { getRooms } from "@/lib/admin-service"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import type { Room } from "@/types/property"

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const roomsData = await getRooms()
      setRooms(roomsData as Room[])
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return <div>Loading rooms...</div>
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Manage Rooms</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Rooms</CardTitle>
          <CardDescription>A list of all rooms in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room Name</TableHead>
                <TableHead>Room Type</TableHead>
                <TableHead>Homestay ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Price / Night</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell className="font-medium">{room.roomName}</TableCell>
                  <TableCell>{room.roomType}</TableCell>
                  <TableCell>{room.homestayId}</TableCell>
                  <TableCell>
                    <Badge variant={room.isActive ? "default" : "outline"}>
                      {room.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatPrice(room.pricePerNight)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
