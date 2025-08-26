"use client"

import { AdminDashboardLayout } from "@/components/admin/dashboard-layout"
import { DashboardStats, RecentActivity } from "@/components/admin/dashboard-stats"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  TrendingUp,
  Users,
  Building2,
  ArrowRight,
  Download,
  Filter,
  MoreHorizontal
} from "lucide-react"
import { useState, useEffect } from "react"

// Mock data for charts
const revenueData = [
  { month: "Jan", revenue: 1200000, bookings: 45 },
  { month: "Feb", revenue: 1800000, bookings: 62 },
  { month: "Mar", revenue: 2100000, bookings: 78 },
  { month: "Apr", revenue: 1900000, bookings: 71 },
  { month: "May", revenue: 2400000, bookings: 89 },
  { month: "Jun", revenue: 2800000, bookings: 95 },
]

const topProperties = [
  {
    id: "1",
    name: "Mountain Villa Sapa",
    location: "Sapa, Lào Cai",
    bookings: 24,
    revenue: 480000,
    rating: 4.9,
    image: "/sapa-mountain-villa.png"
  },
  {
    id: "2",
    name: "Beach House Da Nang",
    location: "Đà Nẵng",
    bookings: 18,
    revenue: 360000,
    rating: 4.8,
    image: "/danang-beach-apartment.png"
  },
  {
    id: "3",
    name: "Traditional House Hoi An",
    location: "Hội An, Quảng Nam",
    bookings: 15,
    revenue: 300000,
    rating: 4.7,
    image: "/hoi-an-traditional-house.png"
  }
]

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState("7d")

  return (
    <AdminDashboardLayout title="Dashboard">
      <div className="space-y-8">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900">Welcome back!</h2>
            <p className="text-neutral-600 mt-1">Here's what's happening with your business today.</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
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
        <DashboardStats />

        {/* Charts & Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-neutral-900">Revenue Overview</h3>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                    <span className="text-neutral-600">Revenue</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-3 h-3 bg-secondary-500 rounded-full"></div>
                    <span className="text-neutral-600">Bookings</span>
                  </div>
                </div>
              </div>

              {/* Simple Chart Placeholder */}
              <div className="h-64 bg-gradient-to-t from-primary-50 to-transparent rounded-lg flex items-end justify-between p-4">
                {revenueData.map((data, index) => (
                  <div key={data.month} className="flex flex-col items-center space-y-2">
                    <div
                      className="w-8 bg-gradient-to-t from-primary-600 to-primary-500 rounded-t"
                      style={{ height: `${(data.revenue / 3000000) * 200}px` }}
                    ></div>
                    <span className="text-xs text-neutral-600">{data.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <RecentActivity />
          </div>
        </div>

        {/* Top Properties & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Properties */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-neutral-900">Top Properties</h3>
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            <div className="space-y-4">
              {topProperties.map((property, index) => (
                <div key={property.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-neutral-200 rounded-lg"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">
                      {property.name}
                    </p>
                    <p className="text-xs text-neutral-600 truncate">
                      {property.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-neutral-900">
                      {property.bookings} bookings
                    </p>
                    <p className="text-xs text-neutral-600">
                      ⭐ {property.rating}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
            <h3 className="text-lg font-semibold text-neutral-900 mb-6">Quick Actions</h3>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Building2 className="h-6 w-6" />
                <span className="text-sm">Add Property</span>
              </Button>

              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Users className="h-6 w-6" />
                <span className="text-sm">Manage Users</span>
              </Button>

              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Calendar className="h-6 w-6" />
                <span className="text-sm">View Bookings</span>
              </Button>

              <Button variant="outline" className="h-20 flex-col space-y-2">
                <TrendingUp className="h-6 w-6" />
                <span className="text-sm">Analytics</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Recent Bookings Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900">Recent Bookings</h3>
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Amount
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
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-neutral-200 rounded-full mr-3"></div>
                        <div>
                          <div className="text-sm font-medium text-neutral-900">John Doe</div>
                          <div className="text-sm text-neutral-500">john@example.com</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-900">Mountain Villa Sapa</div>
                      <div className="text-sm text-neutral-500">Sapa, Lào Cai</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      Dec 15 - Dec 18
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      1,200,000₫
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Confirmed
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  )
}
