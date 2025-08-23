export interface Booking {
  roomImage: string;
  id: string;
  homestayId?: string;
  propertyId?: string;
  roomId?: string;
  propertyTitle: string;
  propertyImage: string;
  roomName?: string;
  homestayName?: string;
  userId: string;
  userName: string;
  userEmail: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  totalNights: number;
  pricePerNight: number;
  subtotal: number;
  serviceFee: number;
  totalPrice: number;
  status:
    | "pending"
    | "confirmed"
    | "cancelled"
    | "completed"
    | "unpaid"
    | "paid";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: "vnpay" | "momo" | "bank_transfer" | "pay_at_homestay";
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    specialRequests?: string;
  };
  hostId: string;
  createdAt: any;
  updatedAt: any;
  cancellationReason?: string;
  vnpayTransactionId?: string;
}

export interface BookingRequest {
  roomId: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    specialRequests?: string;
  };
  paymentMethod: "vnpay" | "momo" | "bank_transfer";
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  redirectUrl?: string;
}

export type RoomBookingData = {
  userId: string;
  roomId: string;
  homestayId: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  totalPrice: number;
  status:
    | "pending"
    | "confirmed"
    | "cancelled"
    | "completed"
    | "unpaid"
    | "paid";
  roomName?: string;
  totalNights: number;
  pricePerNight: number;
  hostId: string;
  roomImage?: string;
};
