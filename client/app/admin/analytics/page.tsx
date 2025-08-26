"use client"

import { useState, useEffect } from "react"
import { AdminDashboardLayout } from "@/components/admin/dashboard-layout"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  Calendar,
  DollarSign,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react"
import { cn } from "@/lib/utils"
import { subscribeToAdminAnalytics, type AdminAnalyticsSnapshot } from "@/lib/admin-service"

interface AnalyticsData extends AdminAnalyticsSnapshot {}

const chartData = [
  { month: "Jan", revenue: 1200000, bookings: 45, users: 120 },
  { month: "Feb", revenue: 1800000, bookings: 62, users: 180 },
  { month: "Mar", revenue: 2100000, bookings: 78, users: 220 },
  { month: "Apr", revenue: 1900000, bookings: 71, users: 195 },
  { month: "May", revenue: 2400000, bookings: 89, users: 280 },
  { month: "Jun", revenue: 2800000, bookings: 95, users: 320 },
]

const topLocations = [
  { city: "Ho Chi Minh City", bookings: 45, revenue: 1200000 },
  { city: "Hanoi", bookings: 38, revenue: 980000 },
  { city: "Da Nang", bookings: 32, revenue: 850000 },
  { city: "Hoi An", bookings: 28, revenue: 720000 },
  { city: "Nha Trang", bookings: 25, revenue: 650000 },
]

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d")
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    revenue: { current: 0, previous: 0, change: 0 },
    bookings: { current: 0, previous: 0, change: 0 },
    users: { current: 0, previous: 0, change: 0 },
    properties: { current: 0, previous: 0, change: 0 }
  })
  useEffect(() => {
    const unsub = subscribeToAdminAnalytics(timeRange as any, (data) => {
      setAnalytics(data)
    })
    return () => unsub()
  }, [timeRange])


  const StatCard = ({
    title,
    current,
    previous,
    change,
    icon: Icon,
    color
  }: {
    title: string
    current: number | string
    previous: number
    change: number
    icon: React.ElementType
    color: string
  }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white", color)}>
          <Icon className="h-6 w-6" />



        </div>
        <div className={cn(
          "flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium",
          change >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        )}>
          {change >= 0 ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          <span>{Math.abs(change)}%</span>
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-2xl font-bold text-neutral-900">{current}</h3>
        <p className="text-sm text-neutral-600">{title}</p>
        <p className="text-xs text-neutral-500">
          vs {previous} last period
        </p>
      </div>
    </div>
  )

  return (
    <AdminDashboardLayout title="Analytics">
      <div className="space-y-8">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Analytics Dashboard</h2>
            <p className="text-neutral-600 mt-1">Track your business performance and insights</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 3 months</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            current={`${analytics.revenue.current.toLocaleString('vi-VN')}₫`}
            previous={analytics.revenue.previous}
            change={analytics.revenue.change}
            icon={DollarSign}
            color="bg-gradient-to-br from-green-500 to-green-600"
          />
          <StatCard
            title="Total Bookings"
            current={analytics.bookings.current}
            previous={analytics.bookings.previous}
            change={analytics.bookings.change}
            icon={Calendar}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatCard
            title="Active Users"
            current={analytics.users.current}
            previous={analytics.users.previous}
            change={analytics.users.change}
            icon={Users}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
          />
          <StatCard
            title="Properties"
            current={analytics.properties.current}
            previous={analytics.properties.previous}
            change={analytics.properties.change}
            icon={Building2}
            color="bg-gradient-to-br from-orange-500 to-orange-600"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-neutral-900">Revenue Trend</h3>
              <BarChart3 className="h-5 w-5 text-neutral-400" />
            </div>

            <div className="h-64 bg-gradient-to-t from-primary-50 to-transparent rounded-lg flex items-end justify-between p-4">
              {chartData.map((data, index) => (
                <div key={data.month} className="flex flex-col items-center space-y-2">
                  <div
                    className="w-8 bg-gradient-to-t from-primary-600 to-primary-500 rounded-t transition-all duration-500 hover:from-primary-700 hover:to-primary-600"
                    style={{ height: `${(data.revenue / 3000000) * 200}px` }}
                  ></div>
                  <span className="text-xs text-neutral-600">{data.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bookings Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-neutral-900">Bookings Overview</h3>
              <Activity className="h-5 w-5 text-neutral-400" />
            </div>

            <div className="h-64 bg-gradient-to-t from-secondary-50 to-transparent rounded-lg flex items-end justify-between p-4">
              {chartData.map((data, index) => (
                <div key={data.month} className="flex flex-col items-center space-y-2">
                  <div
                    className="w-8 bg-gradient-to-t from-secondary-600 to-secondary-500 rounded-t transition-all duration-500 hover:from-secondary-700 hover:to-secondary-600"
                    style={{ height: `${(data.bookings / 100) * 200}px` }}
                  ></div>
                  <span className="text-xs text-neutral-600">{data.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Locations & Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Locations */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-neutral-900">Top Locations</h3>
              <PieChart className="h-5 w-5 text-neutral-400" />
            </div>

            <div className="space-y-4">
              {topLocations.map((location, index) => (
                <div key={location.city} className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{location.city}</p>
                      <p className="text-xs text-neutral-500">{location.bookings} bookings</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-neutral-900">
                      {location.revenue.toLocaleString('vi-VN')}₫
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
            <h3 className="text-lg font-semibold text-neutral-900 mb-6">Performance Metrics</h3>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-neutral-600">Conversion Rate</span>
                  <span className="font-medium">3.2%</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{ width: '32%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-neutral-600">Average Booking Value</span>
                  <span className="font-medium">1,250,000₫</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-neutral-600">Customer Satisfaction</span>
                  <span className="font-medium">4.8/5</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 rounded-full" style={{ width: '96%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-neutral-600">Repeat Customers</span>
                  <span className="font-medium">45%</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  )
}
