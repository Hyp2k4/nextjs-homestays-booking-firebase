"use client"

import { useEffect, useState } from "react"
import { AdminDashboardLayout } from "@/components/admin/dashboard-layout"
import { updateUserStatus } from "@/lib/admin-service"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { StatusSelect } from "@/components/admin/status-select"
import { onSnapshot, collection, orderBy, query, where } from "firebase/firestore"
import { adminDb } from "@/lib/firebase/admin-config"
import type { User } from "@/types/auth"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Download, Eye, Mail, UserCheck, UserX, Users } from "lucide-react"

export default function AdminHostsPage() {
    const [hosts, setHosts] = useState<User[]>([])
    const [filteredHosts, setFilteredHosts] = useState<User[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const q = query(
            collection(adminDb, "users"),
            where("role", "==", "host"),
            orderBy("createdAt", "desc")
        )
        const unsub = onSnapshot(q, (snap) => {
            const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as User))
            setHosts(items)
            setFilteredHosts(items)
            setLoading(false)
        })
        return () => unsub()
    }, [])

    useEffect(() => {
        const results = hosts.filter((host) =>
            host.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            host.email?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        setFilteredHosts(results)
    }, [searchTerm, hosts])

    const handleUserStatusUpdate = async (userId: string, isBanned: boolean) => {
        await updateUserStatus(userId, isBanned)
        // No need to refresh - onSnapshot will auto-update
    }

    if (loading) {
        return (
            <AdminDashboardLayout title="Hosts">
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
        <AdminDashboardLayout title="Hosts Management">
            <div className="space-y-8">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-neutral-900">All Hosts</h2>
                        <p className="text-neutral-600 mt-1">Manage host accounts and permissions</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Search hosts..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
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
                                <p className="text-sm text-neutral-600">Total Hosts</p>
                                <p className="text-2xl font-bold text-neutral-900">{hosts.length}</p>
                            </div>
                            <Users className="h-8 w-8 text-primary-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-neutral-600">Active Hosts</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {hosts.filter(h => !h.isBanned).length}
                                </p>
                            </div>
                            <UserCheck className="h-8 w-8 text-green-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-neutral-600">Banned Hosts</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {hosts.filter(h => h.isBanned).length}
                                </p>
                            </div>
                            <UserX className="h-8 w-8 text-red-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-neutral-600">New This Month</p>
                                <p className="text-2xl font-bold text-neutral-900">
                                    {hosts.filter(h => {
                                        const createdAt = h.createdAt ? new Date(h.createdAt) : null
                                        const thisMonth = new Date()
                                        thisMonth.setDate(1)
                                        return createdAt && createdAt >= thisMonth
                                    }).length}
                                </p>
                            </div>
                            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-bold text-sm">+</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hosts Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Hosts ({filteredHosts.length})</CardTitle>
                        <CardDescription>Manage host accounts and their status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Host Details</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Join Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredHosts.map((host) => (
                                        <TableRow key={host.id} className="hover:bg-neutral-50">
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    {host.avatar ? (
                                                        <img
                                                            src={host.avatar}
                                                            alt={host.name}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                                                            <span className="text-white font-semibold text-sm">
                                                                {host.name?.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-medium text-neutral-900">{host.name}</div>
                                                        <div className="text-sm text-neutral-500">ID: {host.id}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center text-sm text-neutral-900">
                                                    <Mail className="h-4 w-4 mr-2 text-neutral-400" />
                                                    {host.email}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm text-neutral-900">
                                                    {host.createdAt ? new Date(host.createdAt).toLocaleDateString() : 'N/A'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={host.isBanned ? "destructive" : "default"}>
                                                    {host.isBanned ? "Banned" : "Active"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <StatusSelect
                                                        defaultValue={host.isBanned ? "banned" : "active"}
                                                        onValueChange={(value) =>
                                                            handleUserStatusUpdate(host.id, value === "banned")
                                                        }
                                                        options={[
                                                            { value: "active", label: "Active" },
                                                            { value: "banned", label: "Banned" },
                                                        ]}
                                                    />
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
