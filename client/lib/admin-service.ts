import type { User } from "@/types/auth"
import type { Property } from "@/types/property"
import type { Booking } from "@/types/booking"
import { mockProperties } from "@/data/mock-properties"
import { BookingService } from "@/lib/booking-service"

export interface AdminStats {
  totalUsers: number
  totalHosts: number
  totalCustomers: number
  totalProperties: number
  activeProperties: number
  pendingProperties: number
  totalBookings: number
  confirmedBookings: number
  totalRevenue: number
  monthlyRevenue: number
  platformFee: number
  monthlyGrowth: number
}

export interface UserManagement extends User {
  totalBookings: number
  totalSpent: number
  joinDate: string
  lastActive: string
  status: "active" | "suspended" | "banned"
}

export interface PropertyManagement extends Property {
  status: "active" | "pending" | "rejected" | "suspended"
  moderationNotes?: string
  approvedAt?: string
  approvedBy?: string
}

export class AdminService {
  // Mock admin user storage
  private static ADMIN_USERS_KEY = "vietstay_admin_users"
  private static USERS_KEY = "vietstay_mock_users"

  static initializeAdminUser() {
    const adminUsers = localStorage.getItem(this.ADMIN_USERS_KEY)
    if (!adminUsers) {
      const defaultAdmin = {
        id: "admin1",
        email: "admin@vietstay.com",
        name: "Admin VietStay",
        role: "admin",
        password: "admin123",
        createdAt: new Date().toISOString(),
      }
      localStorage.setItem(this.ADMIN_USERS_KEY, JSON.stringify([defaultAdmin]))
    }
  }

  static getAdminStats(): AdminStats {
    const users = this.getAllUsers()
    const properties = mockProperties
    const bookings = BookingService.getBookings()

    const totalHosts = users.filter((u) => u.role === "host").length
    const totalCustomers = users.filter((u) => u.role === "customer").length
    const activeProperties = properties.filter((p) => p.isActive).length
    const confirmedBookings = bookings.filter((b) => b.status === "confirmed" || b.status === "completed")

    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.total, 0)
    const platformFee = totalRevenue * 0.1 // 10% platform fee

    // Calculate monthly revenue (current month)
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const monthlyBookings = confirmedBookings.filter((b) => {
      const bookingDate = new Date(b.createdAt)
      return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear
    })
    const monthlyRevenue = monthlyBookings.reduce((sum, b) => sum + b.total, 0)

    return {
      totalUsers: users.length,
      totalHosts,
      totalCustomers,
      totalProperties: properties.length,
      activeProperties,
      pendingProperties: properties.length - activeProperties,
      totalBookings: bookings.length,
      confirmedBookings: confirmedBookings.length,
      totalRevenue,
      monthlyRevenue,
      platformFee,
      monthlyGrowth: 15.2, // Mock growth percentage
    }
  }

  static getAllUsers(): UserManagement[] {
    const users = JSON.parse(localStorage.getItem(this.USERS_KEY) || "[]")
    const bookings = BookingService.getBookings()

    return users.map((user: any) => {
      const userBookings = bookings.filter((b) => b.userId === user.id)
      const totalSpent = userBookings
        .filter((b) => b.status === "confirmed" || b.status === "completed")
        .reduce((sum, b) => sum + b.total, 0)

      return {
        ...user,
        totalBookings: userBookings.length,
        totalSpent,
        joinDate: user.createdAt,
        lastActive: user.updatedAt || user.createdAt,
        status: user.status || "active",
      }
    })
  }

  static getAllProperties(): PropertyManagement[] {
    return mockProperties.map((property) => ({
      ...property,
      status: property.isActive ? "active" : "pending",
      approvedAt: property.createdAt,
      approvedBy: "admin1",
    }))
  }

  static getAllBookings(): Booking[] {
    return BookingService.getBookings().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  }

  static async updateUserStatus(
    userId: string,
    status: "active" | "suspended" | "banned",
    reason?: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const users = JSON.parse(localStorage.getItem(this.USERS_KEY) || "[]")
      const userIndex = users.findIndex((u: any) => u.id === userId)

      if (userIndex === -1) {
        return { success: false, error: "Không tìm thấy người dùng" }
      }

      users[userIndex].status = status
      users[userIndex].statusReason = reason
      users[userIndex].updatedAt = new Date().toISOString()

      localStorage.setItem(this.USERS_KEY, JSON.stringify(users))
      return { success: true }
    } catch (error) {
      return { success: false, error: "Có lỗi xảy ra" }
    }
  }

  static async updatePropertyStatus(
    propertyId: string,
    status: "active" | "pending" | "rejected" | "suspended",
    notes?: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // In a real app, this would update the database
      // For now, we'll just simulate the action
      console.log(`Property ${propertyId} status updated to ${status}`, notes)
      return { success: true }
    } catch (error) {
      return { success: false, error: "Có lỗi xảy ra" }
    }
  }

  static getRevenueAnalytics() {
    const bookings = BookingService.getBookings().filter((b) => b.status === "confirmed" || b.status === "completed")

    // Group by month for the last 6 months
    const monthlyData: { [key: string]: { revenue: number; bookings: number; platformFee: number } } = {}

    bookings.forEach((booking) => {
      const date = new Date(booking.createdAt)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { revenue: 0, bookings: 0, platformFee: 0 }
      }

      monthlyData[monthKey].revenue += booking.total
      monthlyData[monthKey].bookings += 1
      monthlyData[monthKey].platformFee += booking.total * 0.1 // 10% platform fee
    })

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        revenue: data.revenue,
        bookings: data.bookings,
        platformFee: data.platformFee,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6)
  }
}

// Initialize admin user on service load
if (typeof window !== "undefined") {
  AdminService.initializeAdminUser()
}
