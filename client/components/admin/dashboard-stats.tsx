"use client"

import { useState, useEffect } from "react"
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building2, 
  Calendar, 
  DollarSign,
  Star,
  MapPin,
  Clock,
  Activity
} from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  change: number
  changeType: "increase" | "decrease"
  icon: React.ReactNode
  color: "blue" | "green" | "orange" | "purple" | "red"
}

function StatCard({ title, value, change, changeType, icon, color }: StatCardProps) {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600", 
    orange: "from-orange-500 to-orange-600",
    purple: "from-purple-500 to-purple-600",
    red: "from-red-500 to-red-600"
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-neutral-100">
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white",
          colors[color]
        )}>
          {icon}
        </div>
        <div className={cn(
          "flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium",
          changeType === "increase" 
            ? "bg-green-100 text-green-700" 
            : "bg-red-100 text-red-700"
        )}>
          {changeType === "increase" ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          <span>{Math.abs(change)}%</span>
        </div>
      </div>
      
      <div className="space-y-1">
        <h3 className="text-2xl font-bold text-neutral-900">{value}</h3>
        <p className="text-sm text-neutral-600">{title}</p>
      </div>
    </div>
  )
}

export function DashboardStats() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    totalProperties: 0,
    totalUsers: 0,
    averageRating: 0,
    occupancyRate: 0
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats({
        totalRevenue: 2450000,
        totalBookings: 156,
        totalProperties: 24,
        totalUsers: 1247,
        averageRating: 4.8,
        occupancyRate: 85
      })
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-neutral-200 rounded-xl"></div>
              <div className="w-16 h-6 bg-neutral-200 rounded-full"></div>
            </div>
            <div className="space-y-2">
              <div className="h-8 bg-neutral-200 rounded w-20"></div>
              <div className="h-4 bg-neutral-200 rounded w-32"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <StatCard
        title="Total Revenue"
        value={`${stats.totalRevenue.toLocaleString('vi-VN')}₫`}
        change={12.5}
        changeType="increase"
        icon={<DollarSign className="h-6 w-6" />}
        color="green"
      />
      
      <StatCard
        title="Total Bookings"
        value={stats.totalBookings}
        change={8.2}
        changeType="increase"
        icon={<Calendar className="h-6 w-6" />}
        color="blue"
      />
      
      <StatCard
        title="Properties"
        value={stats.totalProperties}
        change={5.1}
        changeType="increase"
        icon={<Building2 className="h-6 w-6" />}
        color="purple"
      />
      
      <StatCard
        title="Total Users"
        value={stats.totalUsers}
        change={15.3}
        changeType="increase"
        icon={<Users className="h-6 w-6" />}
        color="orange"
      />
      
      <StatCard
        title="Average Rating"
        value={`${stats.averageRating}/5`}
        change={2.1}
        changeType="increase"
        icon={<Star className="h-6 w-6" />}
        color="orange"
      />
      
      <StatCard
        title="Occupancy Rate"
        value={`${stats.occupancyRate}%`}
        change={3.8}
        changeType="decrease"
        icon={<Activity className="h-6 w-6" />}
        color="blue"
      />
    </div>
  )
}

// Recent Activity Component
interface ActivityItem {
  id: string
  type: "booking" | "review" | "user" | "property"
  title: string
  description: string
  time: string
  user?: {
    name: string
    avatar?: string
  }
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setActivities([
        {
          id: "1",
          type: "booking",
          title: "New Booking",
          description: "Mountain Villa in Sapa booked for 3 nights",
          time: "2 minutes ago",
          user: { name: "John Doe" }
        },
        {
          id: "2", 
          type: "review",
          title: "New Review",
          description: "5-star review for Beach House in Da Nang",
          time: "15 minutes ago",
          user: { name: "Jane Smith" }
        },
        {
          id: "3",
          type: "user",
          title: "New User Registration",
          description: "New user signed up from Ho Chi Minh City",
          time: "1 hour ago",
          user: { name: "Mike Johnson" }
        },
        {
          id: "4",
          type: "property",
          title: "Property Listed",
          description: "Traditional House in Hoi An added to listings",
          time: "2 hours ago",
          user: { name: "Sarah Wilson" }
        }
      ])
      setLoading(false)
    }, 800)
  }, [])

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "booking":
        return <Calendar className="h-4 w-4 text-blue-600" />
      case "review":
        return <Star className="h-4 w-4 text-yellow-600" />
      case "user":
        return <Users className="h-4 w-4 text-green-600" />
      case "property":
        return <Building2 className="h-4 w-4 text-purple-600" />
      default:
        return <Activity className="h-4 w-4 text-neutral-600" />
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-neutral-900">Recent Activity</h3>
        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          View All
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 animate-pulse">
              <div className="w-8 h-8 bg-neutral-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
              </div>
              <div className="h-3 bg-neutral-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors">
              <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">
                  {activity.title}
                </p>
                <p className="text-xs text-neutral-600 truncate">
                  {activity.description}
                </p>
              </div>
              <div className="text-xs text-neutral-500 whitespace-nowrap">
                {activity.time}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
