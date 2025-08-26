import { Timestamp } from "firebase/firestore"

export type VoucherScope =
  | "all_homestays"
  | "all_rooms"
  | "specific_homestay"
  | "specific_room"
  | "category"
  | "new_users"
  | "returning_users";

export interface Voucher {
  id: string;
  code: string;
  title: string;
  description: string;

  discountType: "percentage" | "fixed_amount";
  discountValue: number;
  minOrderAmount?: number; // minimum order amount to use voucher
  maxDiscountAmount?: number; // maximum discount amount for percentage vouchers

  scope: VoucherScope;
  hostId?: string; // ID of the host this voucher is for
  applicableHomestayId?: string;
  applicableRoomId?: string;
  applicableCategories?: string[]; // room types this voucher applies to
  targetUserSegment?: "all" | "new_users" | "returning_users" | "vip_users";

  validFrom: Timestamp | Date;
  expiryDate: Timestamp | Date;

  usageLimit: number; // How many times a single user can use this. 1 for single use, 0 for unlimited.
  totalQuantity?: number; // Total available vouchers for limited campaigns. null for unlimited.
  redeemedCount: number; // How many times this voucher has been used in total.
  redeemedBy: string[]; // Array of user IDs who have used this voucher.
  claimedBy?: string; // ID of the user who has claimed this specific voucher code
  status: "unused" | "used" | "expired";

  isActive: boolean;
  createdAt: Timestamp | Date;
  createdBy: string; // admin user ID
  updatedAt: Timestamp | Date;
}

export interface UserVoucher {
  id: string
  userId: string
  voucherId: string
  voucher?: Voucher // populated voucher data
  usageCount: number // how many times this user has used this voucher
  receivedAt: Timestamp | Date
  lastUsedAt?: Timestamp | Date
  isUsed: boolean // for single-use vouchers
}

export interface VoucherUsage {
  id: string
  voucherId: string
  userId: string
  bookingId: string
  discountAmount: number
  originalAmount: number
  finalAmount: number
  usedAt: Timestamp | Date
}

export interface VoucherSuggestion {
  roomId: string
  roomName: string
  homestayName: string
  currentPrice: number
  suggestedVouchers: {
    voucher: Voucher
    finalPrice: number
    savings: number
  }[]
}
