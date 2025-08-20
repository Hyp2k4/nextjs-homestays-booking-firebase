export interface Booking {
  id: string
  propertyId?: string
  roomId?: string
  propertyTitle: string
  propertyImage: string
  roomName?: string
  homestayName?: string
  userId: string
  userName: string
  userEmail: string
  checkInDate: any
  checkOutDate: any
  guests: number
  totalNights: number
  pricePerNight: number
  subtotal: number
  serviceFee: number
  totalPrice: number
  status: "pending" | "confirmed" | "cancelled" | "completed" | "unpaid" | "paid"
  paymentStatus: "pending" | "paid" | "failed" | "refunded"
  paymentMethod: "vnpay" | "momo" | "bank_transfer" | "pay_at_homestay"
  guestInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    specialRequests?: string
  }
  hostId: string
  createdAt: any
  updatedAt: any
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
