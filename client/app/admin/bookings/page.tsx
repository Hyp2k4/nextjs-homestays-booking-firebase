"use client"

import { useEffect, useState } from "react"
import { AdminDashboardLayout } from "@/components/admin/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { onSnapshot, collection, orderBy, query } from "firebase/firestore"
import { adminDb } from "@/lib/firebase/admin-config"
import {
  Calendar,
  Users,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react"
import type { Booking } from "@/types/booking"

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const q = query(collection(adminDb, "bookings"), orderBy("createdAt", "desc"))
        const unsub = onSnapshot(q, (snap) => {
            const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking))
            setBookings(items)
            setLoading(false)
        })
        return () => unsub()
    }, [])

    const formatDate = (timestamp: any) => {
        if (timestamp && timestamp.seconds) {
            return new Date(timestamp.seconds * 1000).toLocaleDateString()
        }
        return "N/A"
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'cancelled':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed':
                return <CheckCircle className="h-4 w-4" />
            case 'pending':
                return <Clock className="h-4 w-4" />
            case 'cancelled':
                return <XCircle className="h-4 w-4" />
            default:
                return <Clock className="h-4 w-4" />
        }
    }

    if (loading) {
        return (
            <AdminDashboardLayout title="Bookings">
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
                                <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </AdminDashboardLayout>
        )
    }

    return (
        <AdminDashboardLayout title="Bookings Management">
            <div className="space-y-8">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-neutral-900">All Bookings</h2>
                        <p className="text-neutral-600 mt-1">Manage and track all booking requests</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Search bookings..."
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
                                <p className="text-sm text-neutral-600">Total Bookings</p>
                                <p className="text-2xl font-bold text-neutral-900">{bookings.length}</p>
                            </div>
                            <Calendar className="h-8 w-8 text-primary-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-neutral-600">Confirmed</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {bookings.filter(b => b.status === 'confirmed').length}
                                </p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-neutral-600">Pending</p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {bookings.filter(b => b.status === 'pending').length}
                                </p>
                            </div>
                            <Clock className="h-8 w-8 text-yellow-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-neutral-600">Total Revenue</p>
                                <p className="text-2xl font-bold text-neutral-900">
                                    {formatPrice(bookings.reduce((sum, b) => sum + b.totalPrice, 0))}
                                </p>
                            </div>
                            <Users className="h-8 w-8 text-primary-600" />
                        </div>
                    </div>
                </div>

                {/* Bookings Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-neutral-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Homestay
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Check-in
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Check-out
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Total Price
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-neutral-200">
                                {bookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-neutral-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mr-3">
                                                    <span className="text-white font-semibold text-xs">
                                                        {booking.userName?.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-neutral-900">{booking.userName}</div>
                                                    <div className="text-sm text-neutral-500">{booking.userEmail}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-neutral-900">{booking.homestayName || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                                            {formatDate(booking.checkInDate)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                                            {formatDate(booking.checkOutDate)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                                {getStatusIcon(booking.status)}
                                                <span className="ml-1 capitalize">{booking.status}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                                            {formatPrice(booking.totalPrice)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminDashboardLayout>
    )
}
