import { db } from "./firebase/config";
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  QueryConstraint,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import type { Property } from "@/types/property";

export const HostService = {
  // === HOMESTAY MANAGEMENT ===
  async getHostHomestays(hostId: string): Promise<any[]> {
    try {
      const homestaysRef = collection(db, "homestays");
      const q = query(homestaysRef, where("hostId", "==", hostId));

      const querySnapshot = await getDocs(q);
      const homestays = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return homestays.sort((a: any, b: any) => {
        const dateA = a.createdAt?.toDate
          ? a.createdAt.toDate()
          : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate
          ? b.createdAt.toDate()
          : new Date(b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error("Error fetching host homestays:", error);
      return [];
    }
  },

  async addHomestay(homestayData: any, hostId: string): Promise<string | null> {
    try {
      const homestaysRef = collection(db, "homestays");
      const docRef = await addDoc(homestaysRef, {
        ...homestayData,
        hostId,
        isActive: true,
        createdAt: new Date(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding homestay:", error);
      return null;
    }
  },

  async updateHomestayStatus(
    homestayId: string,
    isActive: boolean,
    hostId: string
  ): Promise<boolean> {
    try {
      const homestayRef = doc(db, "homestays", homestayId);
      const homestayDoc = await getDoc(homestayRef);

      if (!homestayDoc.exists()) {
        console.error("Homestay not found");
        return false;
      }

      const homestayData = homestayDoc.data();
      if (homestayData.hostId !== hostId) {
        console.error("Unauthorized: Homestay does not belong to this host");
        return false;
      }

      await updateDoc(homestayRef, {
        isActive,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error("Error updating homestay status:", error);
      return false;
    }
  },

  async deleteHomestay(homestayId: string, hostId: string): Promise<boolean> {
    try {
      const homestayRef = doc(db, "homestays", homestayId);
      const homestayDoc = await getDoc(homestayRef);

      if (!homestayDoc.exists()) {
        console.error("Homestay not found");
        return false;
      }

      const homestayData = homestayDoc.data();
      if (homestayData.hostId !== hostId) {
        console.error("Unauthorized: Homestay does not belong to this host");
        return false;
      }

      await deleteDoc(homestayRef);
      return true;
    } catch (error) {
      console.error("Error deleting homestay:", error);
      return false;
    }
  },

  // === ROOM MANAGEMENT ===
  async getHostRooms(hostId: string, homestayId?: string): Promise<any[]> {
    try {
      const roomsRef = collection(db, "rooms");
      let q;

      if (homestayId) {
        // Lấy phòng của homestay cụ thể
        q = query(
          roomsRef,
          where("hostId", "==", hostId),
          where("homestayId", "==", homestayId)
        );
      } else {
        // Lấy tất cả phòng của host
        q = query(roomsRef, where("hostId", "==", hostId));
      }

      const querySnapshot = await getDocs(q);
      const rooms = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sắp xếp ở client side thay vì database
      return rooms.sort((a: any, b: any) => {
        const dateA = a.createdAt?.toDate
          ? a.createdAt.toDate()
          : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate
          ? b.createdAt.toDate()
          : new Date(b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error("Error fetching host rooms:", error);
      return [];
    }
  },

  generateRoomCode(roomType: string): string {
    const typeMap: { [key: string]: string } = {
      "Single Bed": "MSB",
      "Double Bed": "MDB",
      "Deluxe Room": "MDR",
      "Family Suite": "MFS",
    };

    const prefix = typeMap[roomType] || "MRO";
    const randomNum = Math.floor(Math.random() * 900) + 100; // 100-999
    return `${prefix}${randomNum}`;
  },

  async getNextRoomNumber(
    roomType: string,
    hostId: string,
    homestayId: string
  ): Promise<string> {
    try {
      const roomsRef = collection(db, "rooms");
      const q = query(
        roomsRef,
        where("roomType", "==", roomType),
        where("hostId", "==", hostId),
        where("homestayId", "==", homestayId)
      );

      const querySnapshot = await getDocs(q);
      const existingRooms = querySnapshot.docs.map((doc) => doc.data());

      // Tìm số lớn nhất hiện tại
      let maxNumber = 0;
      existingRooms.forEach((room) => {
        if (room.roomCode) {
          const match = room.roomCode.match(/\d+$/);
          if (match) {
            const num = parseInt(match[0]);
            if (num > maxNumber) maxNumber = num;
          }
        }
      });

      const typeMap: { [key: string]: string } = {
        "Single Bed": "MSB",
        "Double Bed": "MDB",
        "Deluxe Room": "MDR",
        "Family Suite": "MFS",
      };

      const prefix = typeMap[roomType] || "MRO";
      const nextNumber = maxNumber + 1;
      return `${prefix}${String(nextNumber).padStart(3, "0")}`;
    } catch (error) {
      console.error("Error getting next room number:", error);
      return this.generateRoomCode(roomType);
    }
  },

  async updateRoomStatus(
    roomId: string,
    isActive: boolean,
    hostId: string
  ): Promise<boolean> {
    try {
      // Kiểm tra xem phòng có thuộc về host này không
      const roomRef = doc(db, "rooms", roomId);
      const roomDoc = await getDoc(roomRef);

      if (!roomDoc.exists()) {
        console.error("Room not found");
        return false;
      }

      const roomData = roomDoc.data();
      if (roomData.hostId !== hostId) {
        console.error("Unauthorized: Room does not belong to this host");
        return false;
      }

      await updateDoc(roomRef, {
        isActive,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error("Error updating room status:", error);
      return false;
    }
  },

  async deleteRoom(roomId: string, hostId: string): Promise<boolean> {
    try {
      // Kiểm tra xem phòng có thuộc về host này không
      const roomRef = doc(db, "rooms", roomId);
      const roomDoc = await getDoc(roomRef);

      if (!roomDoc.exists()) {
        console.error("Room not found");
        return false;
      }

      const roomData = roomDoc.data();
      if (roomData.hostId !== hostId) {
        console.error("Unauthorized: Room does not belong to this host");
        return false;
      }

      await deleteDoc(roomRef);
      return true;
    } catch (error) {
      console.error("Error deleting room:", error);
      return false;
    }
  },

  async getAllRooms(hostId: string): Promise<any[]> {
    try {
      const roomsRef = collection(db, "rooms");
      const q = query(
        roomsRef,
        where("hostId", "==", hostId)
        // Tạm thời bỏ orderBy để tránh lỗi index
        // orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const rooms = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sắp xếp ở client side thay vì database
      return rooms.sort((a: any, b: any) => {
        const dateA = a.createdAt?.toDate
          ? a.createdAt.toDate()
          : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate
          ? b.createdAt.toDate()
          : new Date(b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error("Error fetching all rooms:", error);
      return [];
    }
  },

  async checkRoomOwnership(roomId: string, hostId: string): Promise<boolean> {
    try {
      const roomRef = doc(db, "rooms", roomId);
      const roomDoc = await getDoc(roomRef);

      if (!roomDoc.exists()) {
        return false;
      }

      const roomData = roomDoc.data();
      return roomData.hostId === hostId;
    } catch (error) {
      console.error("Error checking room ownership:", error);
      return false;
    }
  },

  async getAllHomestays() {
    try {
      const snapshot = await getDocs(collection(db, "homestays"));
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching all homestays:", error);
      return [];
    }
  },
};
