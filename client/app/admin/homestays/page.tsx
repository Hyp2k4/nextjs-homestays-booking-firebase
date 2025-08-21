// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { getHomestays, updateHomestayStatus, getHomestayDetails } from "@/lib/admin-service"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusSelect } from "@/components/admin/status-select"
import { HomestayDetailModal } from "@/components/admin/homestay-detail-modal"
import { DollarSign, Users, CreditCard, Activity, Settings } from "lucide-react"

const App = () => {
    const [homestays, setHomestays] = useState<any[]>([])
    const [selectedHomestay, setSelectedHomestay] = useState<any>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        const homestaysData = await getHomestays()
        setHomestays(homestaysData)
    }

    const handleStatusUpdate = async (homestayId: string, status: "approved" | "denied") => {
        await updateHomestayStatus(homestayId, status)
        fetchData()
    }

    const handleRowClick = async (homestay: any) => {
        const details = await getHomestayDetails(homestay.id)
        setSelectedHomestay({ ...homestay, ...details })
        setIsModalOpen(true)
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
                                ${index === 1 ? "border-r-4 md:border-r-[6px] bg-indigo-500/10 border-indigo-500 text-indigo-500"
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
                    <h1 className="text-3xl font-bold mb-6">Manage Homestays</h1>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Host</TableHead>
                                <TableHead>City</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {homestays.map((homestay) => (
                                <TableRow key={homestay.id} onClick={() => handleRowClick(homestay)} className="cursor-pointer">
                                    <TableCell>{homestay.name}</TableCell>
                                    <TableCell>{homestay.hostName}</TableCell>
                                    <TableCell>{homestay.city}</TableCell>
                                    <TableCell>{homestay.status}</TableCell>
                                    <TableCell>
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
                    <HomestayDetailModal
                        homestay={selectedHomestay}
                        host={selectedHomestay?.host}
                        rooms={selectedHomestay?.rooms}
                        bookings={selectedHomestay?.bookings}
                        revenue={selectedHomestay?.revenue}
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                    />
                </main>
            </div>
        </>
    );
};

export default App;
