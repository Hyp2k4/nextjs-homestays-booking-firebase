import { db } from "@/lib/firebase/config"
import {
  collection,
  query,
  where,
  getDocs,
  DocumentData,
} from "firebase/firestore"
import { Room } from "@/types/property"

export const RoomService = {
  async getRoomsByIds(roomIds: string[]): Promise<Room[]> {
    if (roomIds.length === 0) {
      return []
    }

    const roomCollection = collection(db, "rooms")
    // Firestore 'in' queries are limited to 10 items.
    // If the wishlist can be larger, this needs chunking.
    // For now, assuming wishlist size <= 10.
    const q = query(roomCollection, where("__name__", "in", roomIds))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Room),
    )
  },
}
