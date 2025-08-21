// @ts-nocheck
// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { getHosts, updateUserStatus } from "@/lib/admin-service"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { StatusSelect } from "@/components/admin/status-select"
import { DollarSign, Users, CreditCard, Activity, Settings } from "lucide-react"

const App = () => {
    const [hosts, setHosts] = useState<any[]>([])
    const [filteredHosts, setFilteredHosts] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        const fetchData = async () => {
            const hostsData = await getHosts()
            setHosts(hostsData)
            setFilteredHosts(hostsData)
        }
        fetchData()
    }, [])

    useEffect(() => {
        const results = hosts.filter((host) =>
            host.name.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        setFilteredHosts(results)
    }, [searchTerm, hosts])

    const handleUserStatusUpdate = async (userId: string, isBanned: boolean) => {
        await updateUserStatus(userId, isBanned)
        const hostsData = await getHosts()
        setHosts(hostsData)
        setFilteredHosts(hostsData)
    }

    const sidebarLinks = [
        { name: "Dashboard", path: "/admin", icon: <DollarSign className="w-6 h-6" /> },
        { name: "Homestay", path: "/admin/homestays", icon: <Users className="w-6 h-6" /> },
        { name: "Bookings", path: "/admin/bookings", icon: <CreditCard className="w-6 h-6" /> },
        { name: "Host", path: "/admin/hosts", icon: <Activity className="w-6 h-6" /> },
        { name: "Settings", path: "/admin/settings", icon: <Settings className="w-6 h-6" /> },
    ];

    return (
        <>
            <div className="flex">
                <div className="md:w-64 w-16 border-r h-screen text-base border-gray-300 pt-4 flex flex-col transition-all duration-300">
                    {sidebarLinks.map((item, index) => (
                        <a href={item.path} key={index}
                            className={`flex items-center py-3 px-4 gap-3 
                                ${index === 3 ? "border-r-4 md:border-r-[6px] bg-indigo-500/10 border-indigo-500 text-indigo-500"
                                    : "hover:bg-gray-100/90 border-white text-gray-700"
                                }`
                            }
                        >
                            {item.icon}
                            <p className="md:block hidden text-center">{item.name}</p>
                        </a>
                    ))}
                </div>
                <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
                    <h1 className="text-3xl font-bold mb-6">Hosts</h1>
                    <Input
                        type="text"
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mb-4"
                    />
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredHosts.map((host) => (
                                <TableRow key={host.id}>
                                    <TableCell>{host.name}</TableCell>
                                    <TableCell>{host.email}</TableCell>
                                    <TableCell>{host.isBanned ? "Banned" : "Active"}</TableCell>
                                    <TableCell>
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
                </main>
            </div>
        </>
    );
};

export default App;
