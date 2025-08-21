"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getAdminDashboardStats } from "@/lib/admin-service"
import { formatPrice } from "@/lib/utils"
import { DollarSign, Users, Home, Calendar, Activity } from "lucide-react"
import type { Booking } from "@/types/booking"

interface DashboardStats {
  totalRevenue: number;
  totalBookings: number;
  totalHosts: number;
  totalHomestays: number;
  recentBookings: Booking[];
}

const StatCard = ({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="w-4 h-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
)

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAdminDashboardStats()
        setStats(data)
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <div>Loading dashboard...</div>
  }

  if (!stats) {
    return <div>Failed to load dashboard data.</div>
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Revenue" value={formatPrice(stats.totalRevenue)} icon={DollarSign} />
        <StatCard title="Total Bookings" value={stats.totalBookings} icon={Calendar} />
        <StatCard title="Total Hosts" value={stats.totalHosts} icon={Users} />
        <StatCard title="Total Homestays" value={stats.totalHomestays} icon={Home} />
      </div>

      {/* Recent Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Room</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recentBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div className="font-medium">{booking.userName}</div>
                    <div className="text-sm text-muted-foreground">{booking.userEmail}</div>
                  </TableCell>
                  <TableCell>{booking.roomName || 'N/A'}</TableCell>
                  <TableCell className="text-right">{formatPrice(booking.totalPrice)}</TableCell>
                  <TableCell>
                    <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                      {booking.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
