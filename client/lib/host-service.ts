import type { Property } from "@/types/property"
import type { Booking } from "@/types/booking"
import { mockProperties } from "@/data/mock-properties"
import { BookingService } from "@/lib/booking-service"

export interface HostStats {
  totalProperties: number
  activeProperties: number
  totalBookings: number
  pendingBookings: number
  totalRevenue: number
  monthlyRevenue: number
  averageRating: number
  occupancyRate: number
}

export interface RevenueData {
  month: string
  revenue: number
  bookings: number
}

export class HostService {
  static getHostProperties(hostId: string): Property[] {
    return mockProperties.filter((p) => p.hostId === hostId)
  }

  static async getHostBookings(hostId: string): Promise<Booking[]> {
    const hostProperties = this.getHostProperties(hostId)
    const propertyIds = hostProperties.map((p) => p.id)
    const allBookings = await BookingService.getBookings()
    return allBookings.filter((b) => propertyIds.includes(b.propertyId))
  }

  static async getHostStats(hostId: string): Promise<HostStats> {
    const properties = this.getHostProperties(hostId)
    const bookings = await this.getHostBookings(hostId)

    const activeProperties = properties.filter((p) => p.isActive).length
    const pendingBookings = bookings.filter((b) => b.status === "pending").length
    const confirmedBookings = bookings.filter((b) => b.status === "confirmed" || b.status === "completed")

    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.total, 0)

    // Calculate monthly revenue (current month)
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const monthlyBookings = confirmedBookings.filter((b) => {
      const bookingDate = new Date(b.createdAt)
      return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear
    })
    const monthlyRevenue = monthlyBookings.reduce((sum, b) => sum + b.total, 0)

    // Calculate average rating
    const ratingsSum = properties.reduce((sum, p) => sum + p.rating.average * p.rating.count, 0)
    const totalRatings = properties.reduce((sum, p) => sum + p.rating.count, 0)
    const averageRating = totalRatings > 0 ? ratingsSum / totalRatings : 0

    // Calculate occupancy rate (simplified)
    const occupancyRate = properties.length > 0 ? (confirmedBookings.length / (properties.length * 30)) * 100 : 0

    return {
      totalProperties: properties.length,
      activeProperties,
      totalBookings: bookings.length,
      pendingBookings,
      totalRevenue,
      monthlyRevenue,
      averageRating,
      occupancyRate: Math.min(occupancyRate, 100),
    }
  }

  static async getRevenueData(hostId: string): Promise<RevenueData[]> {
    const bookings = (await this.getHostBookings(hostId)).filter(
      (b) => b.status === "confirmed" || b.status === "completed",
    )

    // Group by month
    const monthlyData: { [key: string]: { revenue: number; bookings: number } } = {}

    bookings.forEach((booking) => {
      const date = new Date(booking.createdAt)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { revenue: 0, bookings: 0 }
      }

      monthlyData[monthKey].revenue += booking.total
      monthlyData[monthKey].bookings += 1
    })

    // Convert to array and sort
    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        revenue: data.revenue,
        bookings: data.bookings,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6) // Last 6 months
  }

  static async updateBookingStatus(
    bookingId: string,
    status: "confirmed" | "cancelled",
    hostId: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const bookings = await BookingService.getBookings()
      const bookingIndex = bookings.findIndex((b) => b.id === bookingId)

      if (bookingIndex === -1) {
        return { success: false, error: "Không tìm thấy đặt phòng" }
      }

      const booking = bookings[bookingIndex]

      // Verify host owns this property
      const property = mockProperties.find((p) => p.id === booking.propertyId)
      if (!property || property.hostId !== hostId) {
        return { success: false, error: "Không có quyền thực hiện thao tác này" }
      }

      bookings[bookingIndex].status = status
      bookings[bookingIndex].updatedAt = new Date().toISOString()

      await BookingService.saveBookings(bookings)
      return { success: true }
    } catch (error) {
      return { success: false, error: "Có lỗi xảy ra" }
    }
  }
}
