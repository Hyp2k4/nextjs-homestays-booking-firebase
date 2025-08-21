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
} from "firebase/firestore";
import type { Voucher } from "@/types/voucher";

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
      const q = query(
        vouchersRef,
        where("claimedBy", "==", userId)
      );

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

  async createVoucher(voucherData: Omit<Voucher, "id" | "createdAt">): Promise<string | null> {
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

  async claimVoucher(voucherId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const voucherRef = doc(db, "vouchers", voucherId);

      await runTransaction(db, async (transaction) => {
        const voucherDoc = await transaction.get(voucherRef);
        if (!voucherDoc.exists()) {
          throw new Error("Voucher does not exist.");
        }

        const voucherData = voucherDoc.data() as Voucher;

        if (voucherData.claimedBy) {
          throw new Error("Voucher has already been claimed by someone else.");
        }

        transaction.update(voucherRef, { claimedBy: userId });
      });

      return { success: true };
    } catch (error: any) {
      console.error("Error claiming voucher:", error);
      return { success: false, error: error.message || "Could not claim voucher." };
    }
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

  async updateVoucherStatus(voucherId: string, isActive: boolean): Promise<boolean> {
    try {
      const voucherRef = doc(db, "vouchers", voucherId);
      await updateDoc(voucherRef, { isActive });
      return true;
    } catch (error) {
      console.error("Error updating voucher status:", error);
      return false;
    }
  },
};
