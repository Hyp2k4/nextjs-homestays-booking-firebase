"use client"

import { useEffect, useState } from "react"
import { getHomestays, getBookings, getHosts, getPendingHomestays } from "@/lib/admin-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, Line, LineChart } from "recharts"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Home, Calendar, Users, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { motion } from "framer-motion"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    homestays: 0,
    bookings: 0,
    hosts: 0,
    pendingHomestays: 0,
  })
  const [homestayGrowth, setHomestayGrowth] = useState<{ month: string; count: number }[]>([])
  const chartConfig = {
    desktop: {
      label: "Desktop",
      color: "hsl(var(--chart-1))",
    },
  }

  useEffect(() => {
    const fetchData = async () => {
      const [homestays, bookings, hosts, pendingHomestays] = await Promise.all([
        getHomestays(),
        getBookings(),
        getHosts(),
        getPendingHomestays(),
      ])
      setStats({
        homestays: homestays.length,
        bookings: bookings.length,
        hosts: hosts.length,
        pendingHomestays: pendingHomestays.length,
      })
      // Process data for charts
      const processHomestayGrowth = (homestays: any[]) => {
        const monthlyCounts: { [key: string]: number } = {}
        homestays.forEach((homestay) => {
          const date = homestay.createdAt.toDate()
          const month = format(date, "yyyy-MM")
          monthlyCounts[month] = (monthlyCounts[month] || 0) + 1
        })
        return Object.keys(monthlyCounts)
          .map((month) => ({
            month: format(new Date(month), "MMM"),
            count: monthlyCounts[month],
          }))
          .sort((a, b) => new Date(a.month).getMonth() - new Date(b.month).getMonth())
      }

      setHomestayGrowth(processHomestayGrowth(homestays))
    }
    fetchData()
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      {stats.pendingHomestays > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Pending Homestays</AlertTitle>
            <AlertDescription>
              There are {stats.pendingHomestays} homestays awaiting your approval.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Homestays</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.homestays}</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.bookings}</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hosts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.hosts}</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Homestay Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <LineChart data={homestayGrowth}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Line dataKey="count" type="monotone" stroke="var(--color-desktop)" strokeWidth={2} dot={false} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
