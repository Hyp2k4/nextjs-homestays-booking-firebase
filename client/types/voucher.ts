export type VoucherScope = 'all_homestays' | 'all_rooms' | 'specific_homestay' | 'specific_room';

export interface Voucher {
  id: string;
  code: string;
  description: string;
  
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  
  scope: VoucherScope;
  hostId?: string; // ID of the host this voucher is for
  applicableHomestayId?: string;
  applicableRoomId?: string;
  
  validFrom: any; // Firestore Timestamp
  expiryDate: any; // Firestore Timestamp
  
  usageLimit: number; // How many times a single user can use this. 1 for single use, 0 for unlimited.
  totalQuantity?: number; // Total available vouchers for limited campaigns. null for unlimited.
  redeemedCount: number; // How many times this voucher has been used in total.
  redeemedBy: string[]; // Array of user IDs who have used this voucher.
  claimedBy?: string; // ID of the user who has claimed this specific voucher code

  isActive: boolean;
  createdAt: any; // Firestore Timestamp
}
