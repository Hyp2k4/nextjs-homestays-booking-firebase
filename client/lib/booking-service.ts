import { collection, doc, getDocs, getDoc, addDoc, updateDoc, query, where, orderBy } from "firebase/firestore"
import { db } from "./firebase/config"
import type { Booking, BookingRequest, PaymentResult } from "@/types/booking"

export class BookingService {
  private static collectionName = "bookings"

  static async getBookings(): Promise<Booking[]> {
    try {
      const q = query(collection(db, this.collectionName), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)
      const bookings: Booking[] = []

      querySnapshot.forEach((doc) => {
        bookings.push({ id: doc.id, ...doc.data() } as Booking)
      })

      return bookings
    } catch (error) {
      console.error("Error getting bookings:", error)
      return []
    }
  }

  static async createBooking(
    request: BookingRequest,
    userId: string,
    userName: string,
    userEmail: string,
  ): Promise<{ success: boolean; booking?: Booking; error?: string }> {
    try {
      // Get property details from Firestore
      const propertyDoc = await getDoc(doc(db, "properties", request.propertyId))
      if (!propertyDoc.exists()) {
        return { success: false, error: "Không tìm thấy homestay" }
      }

      const property = { id: propertyDoc.id, ...propertyDoc.data() } as any

      // Calculate pricing
      const checkInDate = new Date(request.checkIn)
      const checkOutDate = new Date(request.checkOut)
      const totalNights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
      const subtotal = property.pricing.basePrice * totalNights
      const serviceFee = 50000
      const total = subtotal + serviceFee

      // Create booking data
      const bookingData = {
        propertyId: request.propertyId,
        propertyTitle: property.title,
        propertyImage: property.images[0],
        userId,
        userName,
        userEmail,
        checkIn: request.checkIn,
        checkOut: request.checkOut,
        guests: request.guests,
        totalNights,
        pricePerNight: property.pricing.basePrice,
        subtotal,
        serviceFee,
        total,
        status: "pending",
        paymentStatus: "pending",
        paymentMethod: request.paymentMethod,
        guestInfo: request.guestInfo,
        hostId: property.hostId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Save to Firestore
      const docRef = await addDoc(collection(db, this.collectionName), bookingData)
      const booking: Booking = { id: docRef.id, ...bookingData } as Booking

      return { success: true, booking }
    } catch (error) {
      console.error("Error creating booking:", error)
      return { success: false, error: "Có lỗi xảy ra khi tạo đặt phòng" }
    }
  }

  static async processPayment(bookingId: string, paymentMethod: string): Promise<PaymentResult> {
    try {
      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock payment success (90% success rate)
      const success = Math.random() > 0.1

      if (success) {
        // Update booking status in Firestore
        const bookingRef = doc(db, this.collectionName, bookingId)
        await updateDoc(bookingRef, {
          paymentStatus: "paid",
          status: "confirmed",
          vnpayTransactionId: `VNP${Date.now()}`,
          updatedAt: new Date().toISOString(),
        })

        return {
          success: true,
          transactionId: `VNP${Date.now()}`,
        }
      } else {
        return {
          success: false,
          error: "Thanh toán thất bại. Vui lòng thử lại.",
        }
      }
    } catch (error) {
      console.error("Error processing payment:", error)
      return {
        success: false,
        error: "Có lỗi xảy ra khi xử lý thanh toán",
      }
    }
  }

  static async getUserBookings(userId: string): Promise<Booking[]> {
    try {
      const q = query(collection(db, this.collectionName), where("userId", "==", userId), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)
      const bookings: Booking[] = []

      querySnapshot.forEach((doc) => {
        bookings.push({ id: doc.id, ...doc.data() } as Booking)
      })

      return bookings
    } catch (error) {
      console.error("Error getting user bookings:", error)
      return []
    }
  }

  static async getBookingById(bookingId: string): Promise<Booking | null> {
    try {
      const docRef = doc(db, this.collectionName, bookingId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Booking
      }

      return null
    } catch (error) {
      console.error("Error getting booking:", error)
      return null
    }
  }

  static async cancelBooking(bookingId: string, reason: string): Promise<{ success: boolean; error?: string }> {
    try {
      const bookingRef = doc(db, this.collectionName, bookingId)
      const bookingSnap = await getDoc(bookingRef)

      if (!bookingSnap.exists()) {
        return { success: false, error: "Không tìm thấy đặt phòng" }
      }

      const booking = bookingSnap.data() as Booking
      const updateData: any = {
        status: "cancelled",
        cancellationReason: reason,
        updatedAt: new Date().toISOString(),
      }

      // If paid, mark for refund
      if (booking.paymentStatus === "paid") {
        updateData.paymentStatus = "refunded"
      }

      await updateDoc(bookingRef, updateData)
      return { success: true }
    } catch (error) {
      console.error("Error cancelling booking:", error)
      return { success: false, error: "Có lỗi xảy ra khi hủy đặt phòng" }
    }
  }
}
