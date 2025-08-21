"use client"

import { useEffect, useState } from "react"
import { getHomestays, updateHomestayStatus, getHomestayDetails } from "@/lib/admin-service"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatusSelect } from "@/components/admin/status-select"
import { HomestayDetailModal } from "@/components/admin/homestay-detail-modal"
import type { Property } from "@/types/property"
import { Badge } from "@/components/ui/badge"

export default function AdminHomestaysPage() {
    const [homestays, setHomestays] = useState<Property[]>([])
    const [selectedHomestay, setSelectedHomestay] = useState<any>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        setLoading(true)
        const homestaysData = await getHomestays()
        setHomestays(homestaysData as Property[])
        setLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleStatusUpdate = async (homestayId: string, status: "approved" | "denied") => {
        await updateHomestayStatus(homestayId, status)
        fetchData() // Refresh data after update
    }

    const handleRowClick = async (homestay: Property) => {
        const details = await getHomestayDetails(homestay.id)
        setSelectedHomestay({ ...homestay, ...details })
        setIsModalOpen(true)
    }

    if (loading) {
        return <div>Loading homestays...</div>
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Manage Homestays</h1>
            <Card>
                <CardHeader>
                    <CardTitle>All Homestays</CardTitle>
                    <CardDescription>A list of all homestays in the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Host</TableHead>
                                <TableHead>City</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {homestays.map((homestay) => (
                                <TableRow key={homestay.id}>
                                    <TableCell>
                                        <div className="font-medium hover:underline cursor-pointer" onClick={() => handleRowClick(homestay)}>
                                            {homestay.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>{homestay.hostName || 'N/A'}</TableCell>
                                    <TableCell>{homestay.city}</TableCell>
                                    <TableCell>
                                        <Badge variant={homestay.status === 'approved' ? 'default' : (homestay.status === 'pending' ? 'secondary' : 'destructive')}>
                                            {homestay.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <StatusSelect
                                            defaultValue={homestay.status}
                                            onValueChange={(value) => handleStatusUpdate(homestay.id, value as "approved" | "denied")}
                                            options={[
                                                { value: "pending", label: "Pending" },
                                                { value: "approved", label: "Approved" },
                                                { value: "denied", label: "Denied" },
                                            ]}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
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
    );
};
