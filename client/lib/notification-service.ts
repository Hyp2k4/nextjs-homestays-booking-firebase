import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  type Unsubscribe 
} from "firebase/firestore"
import { db } from "@/lib/firebase/config"

export interface Notification {
  id: string
  userId?: string // For user-specific notifications
  role?: "admin" | "host" | "customer" // For role-based notifications
  type: "booking" | "review" | "payment" | "system" | "homestay" | "user" | "message" | "voucher" | "host_action"
  title: string
  message: string
  data?: Record<string, any> // Additional data (booking ID, etc.)
  read: boolean
  priority?: "low" | "medium" | "high" | "urgent"
  actionUrl?: string // URL to navigate when notification is clicked
  createdAt: Timestamp | Date
}

export class NotificationService {
  // Subscribe to notifications for a specific user
  static subscribeToUserNotifications(
    userId: string, 
    callback: (notifications: Notification[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    )
    
    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Notification))
      callback(notifications)
    })
  }

  // Subscribe to notifications for a specific role (e.g., admin)
  static subscribeToRoleNotifications(
    role: "admin" | "host" | "customer",
    callback: (notifications: Notification[]) => void
  ): Unsubscribe {
    const q = query(
      collection(db, "notifications"),
      where("role", "==", role),
      orderBy("createdAt", "desc")
    )
    
    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Notification))
      callback(notifications)
    })
  }

  // Create a new notification
  static async createNotification(notification: Omit<Notification, "id" | "createdAt" | "read">) {
    try {
      await addDoc(collection(db, "notifications"), {
        ...notification,
        read: false,
        createdAt: Timestamp.now()
      })
    } catch (error) {
      console.error("Error creating notification:", error)
      throw error
    }
  }

  // Mark a notification as read
  static async markAsRead(notificationId: string) {
    try {
      const notificationRef = doc(db, "notifications", notificationId)
      await updateDoc(notificationRef, { read: true })
    } catch (error) {
      console.error("Error marking notification as read:", error)
      throw error
    }
  }

  // Mark multiple notifications as read
  static async markMultipleAsRead(notificationIds: string[]) {
    try {
      const promises = notificationIds.map(id => 
        updateDoc(doc(db, "notifications", id), { read: true })
      )
      await Promise.all(promises)
    } catch (error) {
      console.error("Error marking notifications as read:", error)
      throw error
    }
  }

  // Helper methods to create specific types of notifications

  // Notify admin when new booking is created
  static async notifyNewBooking(bookingId: string, guestName: string, homestayName: string) {
    await this.createNotification({
      role: "admin",
      type: "booking",
      title: "New Booking Received",
      message: `${guestName} has booked ${homestayName}`,
      data: { bookingId, guestName, homestayName }
    })
  }

  // Notify admin when new review is submitted
  static async notifyNewReview(reviewId: string, userName: string, homestayName: string, rating: number) {
    await this.createNotification({
      role: "admin",
      type: "review",
      title: "New Review Submitted",
      message: `${userName} left a ${rating}-star review for ${homestayName}`,
      data: { reviewId, userName, homestayName, rating }
    })
  }

  // Notify admin when new homestay is submitted for approval
  static async notifyNewHomestay(homestayId: string, hostName: string, homestayName: string) {
    await this.createNotification({
      role: "admin",
      type: "homestay",
      title: "New Homestay Pending Approval",
      message: `${hostName} submitted "${homestayName}" for approval`,
      data: { homestayId, hostName, homestayName }
    })
  }

  // Notify admin when new user registers
  static async notifyNewUser(userId: string, userName: string, userRole: string) {
    await this.createNotification({
      role: "admin",
      type: "user",
      title: "New User Registration",
      message: `${userName} registered as ${userRole}`,
      data: { userId, userName, userRole }
    })
  }

  // Notify user when booking status changes
  static async notifyBookingStatusChange(
    userId: string, 
    bookingId: string, 
    status: string, 
    homestayName: string
  ) {
    await this.createNotification({
      userId,
      type: "booking",
      title: "Booking Status Updated",
      message: `Your booking for ${homestayName} is now ${status}`,
      data: { bookingId, status, homestayName }
    })
  }

  // Notify user when they receive a reply to their review
  static async notifyReviewReply(
    userId: string,
    reviewId: string,
    homestayName: string,
    replyFrom: string
  ) {
    await this.createNotification({
      userId,
      type: "review",
      title: "Reply to Your Review",
      message: `${replyFrom} replied to your review of ${homestayName}`,
      priority: "medium",
      actionUrl: `/reviews/${reviewId}`,
      data: { reviewId, homestayName, replyFrom }
    })
  }

  // Host notifications
  static async notifyHostNewBooking(
    hostId: string,
    bookingId: string,
    guestName: string,
    homestayName: string,
    checkIn: string
  ) {
    await this.createNotification({
      userId: hostId,
      type: "booking",
      title: "New Booking Received!",
      message: `${guestName} booked ${homestayName} for ${checkIn}`,
      priority: "high",
      actionUrl: `/host/bookings/${bookingId}`,
      data: { bookingId, guestName, homestayName, checkIn }
    })
  }

  static async notifyHostReviewReceived(
    hostId: string,
    reviewId: string,
    guestName: string,
    homestayName: string,
    rating: number
  ) {
    await this.createNotification({
      userId: hostId,
      type: "review",
      title: "New Review Received",
      message: `${guestName} left a ${rating}-star review for ${homestayName}`,
      priority: "medium",
      actionUrl: `/host/reviews/${reviewId}`,
      data: { reviewId, guestName, homestayName, rating }
    })
  }

  static async notifyHostPaymentReceived(
    hostId: string,
    bookingId: string,
    amount: number,
    homestayName: string
  ) {
    await this.createNotification({
      userId: hostId,
      type: "payment",
      title: "Payment Received",
      message: `You received ${amount.toLocaleString()}₫ for ${homestayName}`,
      priority: "high",
      actionUrl: `/host/earnings`,
      data: { bookingId, amount, homestayName }
    })
  }

  // Message notifications
  static async notifyNewMessage(
    userId: string,
    fromUserId: string,
    fromUserName: string,
    messagePreview: string,
    conversationId: string
  ) {
    await this.createNotification({
      userId,
      type: "message",
      title: `New message from ${fromUserName}`,
      message: messagePreview.length > 50 ? `${messagePreview.substring(0, 50)}...` : messagePreview,
      priority: "medium",
      actionUrl: `/messages/${conversationId}`,
      data: { fromUserId, fromUserName, conversationId }
    })
  }

  // Voucher notifications
  static async notifyVoucherReceived(
    userId: string,
    voucherCode: string,
    discountAmount: number,
    expiryDate: string
  ) {
    await this.createNotification({
      userId,
      type: "voucher",
      title: "New Voucher Received!",
      message: `You received a ${discountAmount}% discount voucher (${voucherCode})`,
      priority: "medium",
      actionUrl: `/profile/vouchers`,
      data: { voucherCode, discountAmount, expiryDate }
    })
  }

  static async notifyVoucherExpiring(
    userId: string,
    voucherCode: string,
    daysLeft: number
  ) {
    await this.createNotification({
      userId,
      type: "voucher",
      title: "Voucher Expiring Soon",
      message: `Your voucher ${voucherCode} expires in ${daysLeft} days`,
      priority: "medium",
      actionUrl: `/profile/vouchers`,
      data: { voucherCode, daysLeft }
    })
  }

  // Admin notifications for unreplied reviews
  static async notifyAdminUnrepliedReview(
    reviewId: string,
    homestayName: string,
    daysSinceReview: number,
    rating: number
  ) {
    await this.createNotification({
      role: "admin",
      type: "review",
      title: "Review Needs Reply",
      message: `${rating}-star review for ${homestayName} has been unreplied for ${daysSinceReview} days`,
      priority: rating <= 3 ? "high" : "medium",
      actionUrl: `/admin/reviews/${reviewId}`,
      data: { reviewId, homestayName, daysSinceReview, rating }
    })
  }

  // System notifications
  static async notifySystemMaintenance(
    message: string,
    scheduledTime: string,
    duration: string
  ) {
    // Notify all roles
    const roles: Array<"admin" | "host" | "customer"> = ["admin", "host", "customer"]

    for (const role of roles) {
      await this.createNotification({
        role,
        type: "system",
        title: "Scheduled Maintenance",
        message: `${message} Scheduled: ${scheduledTime} (${duration})`,
        priority: "medium",
        data: { scheduledTime, duration }
      })
    }
  }
}
