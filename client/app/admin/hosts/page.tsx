"use client"

import { useEffect, useState } from "react"
import { getHosts, updateUserStatus } from "@/lib/admin-service"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { StatusSelect } from "@/components/admin/status-select"
import type { User } from "@/types/auth"
import { Badge } from "@/components/ui/badge"

export default function AdminHostsPage() {
    const [hosts, setHosts] = useState<User[]>([])
    const [filteredHosts, setFilteredHosts] = useState<User[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        setLoading(true)
        const hostsData = await getHosts()
        setHosts(hostsData as User[])
        setFilteredHosts(hostsData as User[])
        setLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        const results = hosts.filter((host) =>
            host.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            host.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
        setFilteredHosts(results)
    }, [searchTerm, hosts])

    const handleUserStatusUpdate = async (userId: string, isBanned: boolean) => {
        await updateUserStatus(userId, isBanned)
        fetchData() // Refresh data
    }

    if (loading) {
        return <div>Loading hosts...</div>
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Manage Hosts</h1>
            <Card>
                <CardHeader>
                    <CardTitle>All Hosts</CardTitle>
                    <CardDescription>A list of all hosts in the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mb-4 max-w-sm"
                    />
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredHosts.map((host) => (
                                <TableRow key={host.id}>
                                    <TableCell>{host.name}</TableCell>
                                    <TableCell>{host.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={host.isBanned ? "destructive" : "default"}>
                                            {host.isBanned ? "Banned" : "Active"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
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
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};
