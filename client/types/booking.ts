export interface Booking {
  id: string
  propertyId: string
  propertyTitle: string
  propertyImage: string
  userId: string
  userName: string
  userEmail: string
  checkIn: string
  checkOut: string
  guests: number
  totalNights: number
  pricePerNight: number
  subtotal: number
  serviceFee: number
  total: number
  status: "pending" | "confirmed" | "cancelled" | "completed"
  paymentStatus: "pending" | "paid" | "failed" | "refunded"
  paymentMethod: "vnpay" | "momo" | "bank_transfer"
  guestInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    specialRequests?: string
  }
  hostId: string
  createdAt: string
  updatedAt: string
  cancellationReason?: string
  vnpayTransactionId?: string
}

export interface BookingRequest {
  propertyId: string
  checkIn: string
  checkOut: string
  guests: number
  guestInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    specialRequests?: string
  }
  paymentMethod: "vnpay" | "momo" | "bank_transfer"
}

export interface PaymentResult {
  success: boolean
  transactionId?: string
  error?: string
  redirectUrl?: string
}
