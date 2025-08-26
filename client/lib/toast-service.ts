import { toast } from "sonner"
import { CheckCircle, XCircle, AlertCircle, Info, Gift, Calendar, MessageSquare, CreditCard } from "lucide-react"

export class ToastService {
  // Success toasts
  static success(message: string, description?: string) {
    toast.success(message, {
      description,
      icon: <CheckCircle className="h-4 w-4" />,
      duration: 4000,
    })
  }

  static error(message: string, description?: string) {
    toast.error(message, {
      description,
      icon: <XCircle className="h-4 w-4" />,
      duration: 6000,
    })
  }

  static warning(message: string, description?: string) {
    toast.warning(message, {
      description,
      icon: <AlertCircle className="h-4 w-4" />,
      duration: 5000,
    })
  }

  static info(message: string, description?: string) {
    toast.info(message, {
      description,
      icon: <Info className="h-4 w-4" />,
      duration: 4000,
    })
  }

  // Specialized toasts for different actions
  static bookingSuccess(homestayName: string, checkIn: string) {
    toast.success("Booking Confirmed!", {
      description: `Your booking for ${homestayName} on ${checkIn} has been confirmed.`,
      icon: <Calendar className="h-4 w-4" />,
      duration: 6000,
      action: {
        label: "View Booking",
        onClick: () => window.location.href = "/profile/bookings"
      }
    })
  }

  static bookingCancelled(homestayName: string) {
    toast.info("Booking Cancelled", {
      description: `Your booking for ${homestayName} has been cancelled.`,
      icon: <XCircle className="h-4 w-4" />,
      duration: 5000,
    })
  }

  static paymentSuccess(amount: number) {
    toast.success("Payment Successful!", {
      description: `Payment of ${amount.toLocaleString()}₫ has been processed.`,
      icon: <CreditCard className="h-4 w-4" />,
      duration: 5000,
    })
  }

  static paymentFailed(reason?: string) {
    toast.error("Payment Failed", {
      description: reason || "Please try again or use a different payment method.",
      icon: <XCircle className="h-4 w-4" />,
      duration: 6000,
    })
  }

  static reviewSubmitted(homestayName: string) {
    toast.success("Review Submitted!", {
      description: `Thank you for reviewing ${homestayName}.`,
      icon: <CheckCircle className="h-4 w-4" />,
      duration: 4000,
    })
  }

  static reviewReplyReceived(homestayName: string) {
    toast.info("New Reply to Your Review", {
      description: `The host replied to your review of ${homestayName}.`,
      icon: <MessageSquare className="h-4 w-4" />,
      duration: 5000,
      action: {
        label: "View Reply",
        onClick: () => window.location.href = "/profile/reviews"
      }
    })
  }

  static voucherReceived(code: string, discount: number) {
    toast.success("New Voucher Received!", {
      description: `You received voucher ${code} for ${discount}% off!`,
      icon: <Gift className="h-4 w-4" />,
      duration: 6000,
      action: {
        label: "View Vouchers",
        onClick: () => window.location.href = "/profile/vouchers"
      }
    })
  }

  static voucherApplied(discount: number, finalPrice: number) {
    toast.success("Voucher Applied!", {
      description: `You saved ${discount.toLocaleString()}₫! New total: ${finalPrice.toLocaleString()}₫`,
      icon: <Gift className="h-4 w-4" />,
      duration: 5000,
    })
  }

  static voucherExpiring(code: string, daysLeft: number) {
    toast.warning("Voucher Expiring Soon", {
      description: `Your voucher ${code} expires in ${daysLeft} days.`,
      icon: <AlertCircle className="h-4 w-4" />,
      duration: 6000,
      action: {
        label: "Use Now",
        onClick: () => window.location.href = "/homestays"
      }
    })
  }

  static messageReceived(fromName: string, preview: string) {
    toast.info(`New message from ${fromName}`, {
      description: preview.length > 50 ? `${preview.substring(0, 50)}...` : preview,
      icon: <MessageSquare className="h-4 w-4" />,
      duration: 5000,
      action: {
        label: "Reply",
        onClick: () => window.location.href = "/messages"
      }
    })
  }

  // Host-specific toasts
  static hostBookingReceived(guestName: string, homestayName: string) {
    toast.success("New Booking Received!", {
      description: `${guestName} booked ${homestayName}.`,
      icon: <Calendar className="h-4 w-4" />,
      duration: 6000,
      action: {
        label: "View Booking",
        onClick: () => window.location.href = "/host/bookings"
      }
    })
  }

  static hostReviewReceived(guestName: string, rating: number, homestayName: string) {
    const emoji = rating >= 4 ? "⭐" : rating >= 3 ? "👍" : "📝"
    toast.info("New Review Received", {
      description: `${guestName} left a ${rating}-star review for ${homestayName} ${emoji}`,
      icon: <MessageSquare className="h-4 w-4" />,
      duration: 5000,
      action: {
        label: "View Review",
        onClick: () => window.location.href = "/host/reviews"
      }
    })
  }

  static hostPaymentReceived(amount: number, homestayName: string) {
    toast.success("Payment Received!", {
      description: `You received ${amount.toLocaleString()}₫ for ${homestayName}.`,
      icon: <CreditCard className="h-4 w-4" />,
      duration: 6000,
      action: {
        label: "View Earnings",
        onClick: () => window.location.href = "/host/earnings"
      }
    })
  }

  // Admin-specific toasts
  static adminNewUser(userName: string, role: string) {
    toast.info("New User Registration", {
      description: `${userName} registered as ${role}.`,
      duration: 4000,
    })
  }

  static adminNewHomestay(hostName: string, homestayName: string) {
    toast.info("New Homestay Submission", {
      description: `${hostName} submitted "${homestayName}" for approval.`,
      duration: 5000,
      action: {
        label: "Review",
        onClick: () => window.location.href = "/admin/homestays"
      }
    })
  }

  static adminUnrepliedReview(homestayName: string, days: number, rating: number) {
    const priority = rating <= 3 ? "urgent" : "normal"
    const toastFn = priority === "urgent" ? toast.error : toast.warning
    
    toastFn("Review Needs Attention", {
      description: `${rating}-star review for ${homestayName} unreplied for ${days} days.`,
      duration: 6000,
      action: {
        label: "Reply Now",
        onClick: () => window.location.href = "/admin/reviews"
      }
    })
  }

  // System toasts
  static systemMaintenance(message: string, scheduledTime: string) {
    toast.warning("Scheduled Maintenance", {
      description: `${message} Scheduled: ${scheduledTime}`,
      duration: 8000,
    })
  }

  static connectionLost() {
    toast.error("Connection Lost", {
      description: "Please check your internet connection.",
      duration: 0, // Persistent until dismissed
    })
  }

  static connectionRestored() {
    toast.success("Connection Restored", {
      description: "You're back online!",
      duration: 3000,
    })
  }

  // Loading toasts
  static loading(message: string, id?: string) {
    return toast.loading(message, {
      id,
      duration: 0, // Persistent until dismissed
    })
  }

  static dismiss(id?: string) {
    toast.dismiss(id)
  }

  static dismissAll() {
    toast.dismiss()
  }

  // Custom toast with action
  static custom(
    message: string, 
    description: string, 
    actionLabel: string, 
    actionFn: () => void,
    type: "success" | "error" | "warning" | "info" = "info"
  ) {
    const toastFn = type === "success" ? toast.success :
                   type === "error" ? toast.error :
                   type === "warning" ? toast.warning :
                   toast.info

    toastFn(message, {
      description,
      duration: 6000,
      action: {
        label: actionLabel,
        onClick: actionFn
      }
    })
  }
}
