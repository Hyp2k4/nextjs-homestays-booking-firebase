"use client"

import { useEffect, useState } from "react"
import { AdminDashboardLayout } from "@/components/admin/dashboard-layout"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import { onSnapshot, collection, orderBy, query } from "firebase/firestore"
import { adminDb } from "@/lib/firebase/admin-config"
import type { Room } from "@/types/property"
import { Search, Filter, Download, Eye, Edit, Bed, Home } from "lucide-react"

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(adminDb, "rooms"), orderBy("createdAt", "desc"))
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Room))
      setRooms(items)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  if (loading) {
    return (
      <AdminDashboardLayout title="Rooms">
        <div className="space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 bg-neutral-200 rounded w-32"></div>
                <div className="h-6 bg-neutral-200 rounded w-20"></div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-neutral-200 rounded w-full"></div>
                <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </AdminDashboardLayout>
    )
  }

  return (
    <AdminDashboardLayout title="Rooms Management">
      <div className="space-y-8">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">All Rooms</h2>
            <p className="text-neutral-600 mt-1">Manage room listings and availability</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search rooms..."
                className="pl-10 pr-4 py-2 w-64 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total Rooms</p>
                <p className="text-2xl font-bold text-neutral-900">{rooms.length}</p>
              </div>
              <Bed className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Active Rooms</p>
                <p className="text-2xl font-bold text-green-600">
                  {rooms.filter(r => r.isActive).length}
                </p>
              </div>
              <Home className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Average Price</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {formatPrice(rooms.reduce((sum, r) => sum + r.pricePerNight, 0) / rooms.length || 0)}
                </p>
              </div>
              <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-bold text-sm">₫</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Occupancy Rate</p>
                <p className="text-2xl font-bold text-neutral-900">85%</p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-bold text-sm">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rooms Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Rooms</CardTitle>
            <CardDescription>A comprehensive list of all rooms in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room Details</TableHead>
                    <TableHead>Homestay</TableHead>
                    <TableHead>Type & Capacity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Price / Night</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms.map((room) => (
                    <TableRow key={room.id} className="hover:bg-neutral-50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {room.images?.[0] ? (
                            <img
                              src={room.images[0]}
                              alt={room.roomName}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-neutral-200 rounded-lg flex items-center justify-center">
                              <Bed className="h-6 w-6 text-neutral-400" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-neutral-900">{room.roomName}</div>
                            <div className="text-sm text-neutral-500">ID: {room.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-neutral-900">{room.homestayId}</div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm font-medium text-neutral-900">{room.roomType}</div>
                          <div className="text-sm text-neutral-500">{room.maxGuests} guests</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={room.isActive ? "default" : "outline"}>
                          {room.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPrice(room.pricePerNight)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  )
}
