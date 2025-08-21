// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { getBookings } from "@/lib/admin-service"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, Users, CreditCard, Activity, Settings } from "lucide-react"

const App = () => {
    const [bookings, setBookings] = useState<any[]>([])

    useEffect(() => {
        const fetchData = async () => {
            const bookingsData = await getBookings()
            setBookings(bookingsData)
        }
        fetchData()
    }, [])

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
                                ${index === 2 ? "border-r-4 md:border-r-[6px] bg-indigo-500/10 border-indigo-500 text-indigo-500"
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
                    <h1 className="text-3xl font-bold mb-6">Bookings</h1>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Room</TableHead>
                                <TableHead>Check-in</TableHead>
                                <TableHead>Check-out</TableHead>
                                <TableHead>Total Price</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bookings.map((booking) => (
                                <TableRow key={booking.id}>
                                    <TableCell>{booking.userName}</TableCell>
                                    <TableCell>{booking.roomName}</TableCell>
                                    <TableCell>
                                        {booking.checkIn?.seconds
                                            ? new Date(booking.checkIn.seconds * 1000).toLocaleDateString()
                                            : "N/A"}
                                    </TableCell>
                                    <TableCell>
                                        {booking.checkOut?.seconds
                                            ? new Date(booking.checkOut.seconds * 1000).toLocaleDateString()
                                            : "N/A"}
                                    </TableCell>
                                    <TableCell>{booking.totalPrice}</TableCell>
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
