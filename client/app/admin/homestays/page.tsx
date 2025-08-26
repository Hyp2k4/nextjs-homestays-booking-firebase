"use client"

import { useEffect, useState } from "react"
import { AdminDashboardLayout } from "@/components/admin/dashboard-layout"
import { updateHomestayStatus, getHomestayDetails } from "@/lib/admin-service"
import { StatusSelect } from "@/components/admin/status-select"
import { HomestayDetailModal } from "@/components/admin/homestay-detail-modal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { onSnapshot, collection, orderBy, query } from "firebase/firestore"
import { adminDb } from "@/lib/firebase/admin-config"
import {
  Building2,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Star
} from "lucide-react"
import type { Property } from "@/types/property"

export default function AdminHomestaysPage() {
    const [homestays, setHomestays] = useState<Property[]>([])
    const [selectedHomestay, setSelectedHomestay] = useState<any>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const q = query(collection(adminDb, "homestays"), orderBy("createdAt", "desc"))
        const unsub = onSnapshot(q, (snap) => {
            const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Property))
            setHomestays(items)
            setLoading(false)
        })
        return () => unsub()
    }, [])

    const handleStatusUpdate = async (homestayId: string, status: "approved" | "denied") => {
        await updateHomestayStatus(homestayId, status)
        // No need to refresh - onSnapshot will auto-update
    }

    const handleRowClick = async (homestay: Property) => {
        const details = await getHomestayDetails(homestay.id)
        setSelectedHomestay({ ...homestay, ...details })
        setIsModalOpen(true)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'denied':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="h-4 w-4" />
            case 'pending':
                return <Clock className="h-4 w-4" />
            case 'denied':
                return <XCircle className="h-4 w-4" />
            default:
                return <Clock className="h-4 w-4" />
        }
    }

    if (loading) {
        return (
            <AdminDashboardLayout title="Homestays">
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
        <AdminDashboardLayout title="Homestays Management">
            <div className="space-y-8">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-neutral-900">All Homestays</h2>
                        <p className="text-neutral-600 mt-1">Manage and approve homestay listings</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Search homestays..."
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
                                <p className="text-sm text-neutral-600">Total Homestays</p>
                                <p className="text-2xl font-bold text-neutral-900">{homestays.length}</p>
                            </div>
                            <Building2 className="h-8 w-8 text-primary-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-neutral-600">Approved</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {homestays.filter(h => h.status === 'approved').length}
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
                                    {homestays.filter(h => h.status === 'pending').length}
                                </p>
                            </div>
                            <Clock className="h-8 w-8 text-yellow-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-neutral-600">Average Rating</p>
                                <p className="text-2xl font-bold text-neutral-900">
                                    {(homestays.reduce((sum, h) => sum + (h.rating?.average || 0), 0) / homestays.length || 0).toFixed(1)}
                                </p>
                            </div>
                            <Star className="h-8 w-8 text-yellow-500" />
                        </div>
                    </div>
                </div>

                {/* Homestays Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-neutral-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Homestay
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Host
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Location
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Rating
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-neutral-200">
                                {homestays.map((homestay) => (
                                    <tr key={homestay.id} className="hover:bg-neutral-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {homestay.images?.[0] ? (
                                                    <img
                                                        src={homestay.images[0]}
                                                        alt={homestay.name}
                                                        className="w-12 h-12 rounded-lg mr-4 object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 bg-neutral-200 rounded-lg mr-4 flex items-center justify-center">
                                                        <Building2 className="h-6 w-6 text-neutral-400" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div
                                                        className="text-sm font-medium text-neutral-900 hover:text-primary-600 cursor-pointer"
                                                        onClick={() => handleRowClick(homestay)}
                                                    >
                                                        {homestay.name}
                                                    </div>
                                                    <div className="text-sm text-neutral-500">
                                                        {homestay.maxGuests} guests • {homestay.rooms?.length || 0} rooms
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-neutral-900">{homestay.hostName || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-neutral-900">
                                                <MapPin className="h-4 w-4 mr-1 text-neutral-400" />
                                                {homestay.city}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                                                <span className="text-sm text-neutral-900">
                                                    {homestay.rating?.average?.toFixed(1) || 'N/A'}
                                                </span>
                                                {homestay.rating?.count && (
                                                    <span className="text-xs text-neutral-500 ml-1">
                                                        ({homestay.rating.count})
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(homestay.status)}`}>
                                                {getStatusIcon(homestay.status)}
                                                <span className="ml-1 capitalize">{homestay.status}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <Button variant="ghost" size="sm" onClick={() => handleRowClick(homestay)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <StatusSelect
                                                    defaultValue={homestay.status}
                                                    onValueChange={(value) => handleStatusUpdate(homestay.id, value as "approved" | "denied")}
                                                    options={[
                                                        { value: "pending", label: "Pending" },
                                                        { value: "approved", label: "Approved" },
                                                        { value: "denied", label: "Denied" },
                                                    ]}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                {selectedHomestay && (
                    <HomestayDetailModal
                        homestay={selectedHomestay}
                        host={selectedHomestay?.host}
                        rooms={selectedHomestay?.rooms}
                        bookings={selectedHomestay?.bookings}
                        revenue={selectedHomestay?.revenue}
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                    />
                )}
            </div>
        </AdminDashboardLayout>
    )
}
