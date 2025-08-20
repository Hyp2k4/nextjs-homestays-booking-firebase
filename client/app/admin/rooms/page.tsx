"use client"

import { useEffect, useState } from "react"
import { getRooms } from "@/lib/admin-service"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ListRoomsPage() {
  const [rooms, setRooms] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const roomsData = await getRooms()
      setRooms(roomsData)
    }
    fetchData()
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Rooms</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Homestay</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rooms.map((room) => (
            <TableRow key={room.id}>
              <TableCell>{room.name}</TableCell>
              <TableCell>{room.price}</TableCell>
              <TableCell>{room.homestayName}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
