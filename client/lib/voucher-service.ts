import { db } from "./firebase/config";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  addDoc,
  doc,
  runTransaction,
  updateDoc,
  onSnapshot,
  deleteDoc,
  getDoc,
  arrayUnion,
  increment,
  type Unsubscribe
} from "firebase/firestore";
import type { Voucher, UserVoucher, VoucherSuggestion } from "@/types/voucher";
import { NotificationService } from "@/lib/notification-service";

export const VoucherService = {
  async getAvailableVouchers(): Promise<Voucher[]> {
    try {
      const vouchersRef = collection(db, "vouchers");
      const now = Timestamp.now();

      const q = query(
        vouchersRef,
        where("isActive", "==", true),
        where("expiryDate", ">", now),
        where("claimedBy", "==", null) // Only get unclaimed vouchers
      );

      const querySnapshot = await getDocs(q);

      const vouchers = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          expiryDate: data.expiryDate.toDate(), // Convert Firestore Timestamp to JS Date
          createdAt: data.createdAt.toDate(),
        } as Voucher;
      });

      return vouchers;
    } catch (error) {
      console.error("Error fetching available vouchers:", error);
      return [];
    }
  },

  async getMyVouchers(userId: string): Promise<Voucher[]> {
    try {
      const vouchersRef = collection(db, "vouchers");

      // Simplified query to avoid needing a composite index.
      // Filtering for active/expired will be handled client-side.
      const q = query(vouchersRef, where("claimedBy", "==", userId));

      const querySnapshot = await getDocs(q);

      const vouchers = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          expiryDate: data.expiryDate.toDate(),
          createdAt: data.createdAt.toDate(),
        } as Voucher;
      });

      return vouchers;
    } catch (error) {
      console.error("Error fetching user's vouchers:", error);
      return [];
    }
  },

  async createVoucher(
    voucherData: Omit<Voucher, "id" | "createdAt">
  ): Promise<string | null> {
    try {
      const vouchersRef = collection(db, "vouchers");
      const docRef = await addDoc(vouchersRef, {
        ...voucherData,
        createdAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating voucher:", error);
      return null;
    }
  },
  generateVoucherCode(length = 6): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },
  // 1. Generate voucher cho tất cả user
  async generateVoucherForAllUsers(
    voucherData: Omit<Voucher, "id" | "createdAt" | "claimedBy" | "status">,
    userIds: string[]
  ) {
    const vouchersRef = collection(db, "vouchers");

    const batchPromises = userIds.map(async (userId) => {
      const voucherDoc = {
        ...voucherData,
        claimedBy: userId,
        status: "unused",
        createdAt: Timestamp.now(),
      };
      return addDoc(vouchersRef, voucherDoc);
    });

    await Promise.all(batchPromises);
  },

  // 2. Claim voucher thủ công (promo)
  async claimVoucher(voucherId: string, userId: string) {
    const voucherRef = doc(db, "vouchers", voucherId);

    await runTransaction(db, async (transaction) => {
      const voucherDoc = await transaction.get(voucherRef);
      if (!voucherDoc.exists()) throw new Error("Voucher does not exist");

      const voucherData = voucherDoc.data() as Voucher;
      if (voucherData.claimedBy) throw new Error("Voucher has been claimed");

      transaction.update(voucherRef, { claimedBy: userId });
    });
  },

  async getVouchersForHost(hostId: string): Promise<Voucher[]> {
    try {
      const vouchersRef = collection(db, "vouchers");

      // Simplified query to avoid composite index
      const q = query(
        vouchersRef,
        where("hostId", "==", hostId),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);

      const vouchers = querySnapshot.docs.map((doc) => {
        const data = doc.data() as Omit<Voucher, "id" | "status">;

        const expiryDate = data.expiryDate.toDate();
        const createdAt = data.createdAt.toDate();

        // Tính status
        let status: "unused" | "used" | "expired" = "unused";
        if (data.claimedBy) status = "used";
        else if (expiryDate < new Date()) status = "expired";

        return {
          id: doc.id,
          ...data,
          expiryDate,
          createdAt,
          status, // ✅ gán status
        } as Voucher;
      });

      return vouchers;
    } catch (error) {
      console.error("Error fetching vouchers for host:", error);
      return [];
    }
  },

  async getAllVouchers(): Promise<Voucher[]> {
    try {
      const vouchersRef = collection(db, "vouchers");
      const q = query(vouchersRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          expiryDate: data.expiryDate.toDate(),
          createdAt: data.createdAt.toDate(),
        } as Voucher;
      });
    } catch (error) {
      console.error("Error fetching all vouchers:", error);
      return [];
    }
  },

  async updateVoucherStatus(
    voucherId: string,
    isActive: boolean
  ): Promise<boolean> {
    try {
      const voucherRef = doc(db, "vouchers", voucherId);
      await updateDoc(voucherRef, { isActive });
      return true;
    } catch (error) {
      console.error("Error updating voucher status:", error);
      return false;
    }
  },

  // Subscribe to all vouchers (admin)
  subscribeToVouchers(callback: (vouchers: Voucher[]) => void): Unsubscribe {
    const q = query(collection(db, "vouchers"), orderBy("createdAt", "desc"))
    return onSnapshot(q, (snapshot) => {
      const vouchers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        expiryDate: doc.data().expiryDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
      } as Voucher))
      callback(vouchers)
    })
  },

  // Give voucher to user
  async giveVoucherToUser(userId: string, voucherId: string): Promise<void> {
    try {
      await addDoc(collection(db, "userVouchers"), {
        userId,
        voucherId,
        usageCount: 0,
        receivedAt: Timestamp.now(),
        isUsed: false
      })

      // Get voucher details for notification
      const voucherDoc = await getDoc(doc(db, "vouchers", voucherId))
      if (voucherDoc.exists()) {
        const voucher = voucherDoc.data() as Voucher
        await NotificationService.notifyVoucherReceived(
          userId,
          voucher.code,
          voucher.discountValue,
          voucher.expiryDate?.toDate?.()?.toLocaleDateString() || "N/A"
        )
      }
    } catch (error) {
      console.error("Error giving voucher to user:", error)
      throw error
    }
  },

  // Get voucher suggestions for a room
  async getVoucherSuggestionsForRoom(
    roomId: string,
    homestayId: string,
    userId: string,
    currentPrice: number
  ): Promise<VoucherSuggestion | null> {
    try {
      const availableVouchers = await this.getAvailableVouchers()

      // Filter vouchers applicable to this room/homestay
      const applicableVouchers = availableVouchers.filter(voucher => {
        switch (voucher.scope) {
          case "all_rooms":
          case "all_homestays":
            return true
          case "specific_room":
            return voucher.applicableRoomId === roomId
          case "specific_homestay":
            return voucher.applicableHomestayId === homestayId
          default:
            return false
        }
      })

      if (applicableVouchers.length === 0) return null

      // Calculate savings for each voucher
      const suggestedVouchers = applicableVouchers.map(voucher => {
        let discountAmount = 0
        if (voucher.discountType === "percentage") {
          discountAmount = (currentPrice * voucher.discountValue) / 100
          if (voucher.maxDiscountAmount) {
            discountAmount = Math.min(discountAmount, voucher.maxDiscountAmount)
          }
        } else {
          discountAmount = voucher.discountValue
        }

        const finalPrice = Math.max(0, currentPrice - discountAmount)

        return {
          voucher,
          finalPrice,
          savings: discountAmount
        }
      }).filter(item => item.savings > 0) // Only show vouchers that provide savings
        .sort((a, b) => b.savings - a.savings) // Sort by highest savings first

      if (suggestedVouchers.length === 0) return null

      return {
        roomId,
        roomName: "", // To be populated by caller
        homestayName: "", // To be populated by caller
        currentPrice,
        suggestedVouchers
      }
    } catch (error) {
      console.error("Error getting voucher suggestions:", error)
      return null
    }
  },

  // Check if voucher code exists
  async isVoucherCodeUnique(code: string): Promise<boolean> {
    try {
      const q = query(collection(db, "vouchers"), where("code", "==", code))
      const snapshot = await getDocs(q)
      return snapshot.empty
    } catch (error) {
      console.error("Error checking voucher code uniqueness:", error)
      return false
    }
  },

  // Delete voucher
  async deleteVoucher(voucherId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, "vouchers", voucherId))
    } catch (error) {
      console.error("Error deleting voucher:", error)
      throw error
    }
  },
};
