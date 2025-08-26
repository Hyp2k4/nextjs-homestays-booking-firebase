import { db } from "@/lib/firebase/config"
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
} from "firebase/firestore"

export interface WishlistItem {
  roomId: string
  addedAt: Date
  roomName: string
  homestayName: string
  pricePerNight: number
  images: string[]
}

export class WishlistService {
  /**
   * Add room to user's wishlist
   */
  static async addToWishlist(userId: string, roomId: string): Promise<boolean> {
    try {
      // Get room details first
      const roomDoc = await getDoc(doc(db, "rooms", roomId))
      if (!roomDoc.exists()) {
        throw new Error("Room not found")
      }

      const roomData = roomDoc.data()
      
      // Get homestay details
      const homestayDoc = await getDoc(doc(db, "homestays", roomData.homestayId))
      const homestayData = homestayDoc.exists() ? homestayDoc.data() : null

      const wishlistItem: WishlistItem = {
        roomId,
        addedAt: new Date(),
        roomName: roomData.roomName,
        homestayName: homestayData?.name || "Unknown Homestay",
        pricePerNight: roomData.pricePerNight,
        images: roomData.images || []
      }

      // Update user document
      const userRef = doc(db, "users", userId)
      await updateDoc(userRef, {
        roomWishlist: arrayUnion(wishlistItem)
      })

      return true
    } catch (error) {
      console.error("Error adding to wishlist:", error)
      return false
    }
  }

  /**
   * Remove room from user's wishlist
   */
  static async removeFromWishlist(userId: string, roomId: string): Promise<boolean> {
    try {
      // Get current user data to find the exact wishlist item
      const userDoc = await getDoc(doc(db, "users", userId))
      if (!userDoc.exists()) {
        throw new Error("User not found")
      }

      const userData = userDoc.data()
      const currentWishlist = userData.roomWishlist || []
      
      // Find the item to remove
      const itemToRemove = currentWishlist.find((item: WishlistItem) => item.roomId === roomId)
      
      if (!itemToRemove) {
        return false // Item not in wishlist
      }

      // Update user document
      const userRef = doc(db, "users", userId)
      await updateDoc(userRef, {
        roomWishlist: arrayRemove(itemToRemove)
      })

      return true
    } catch (error) {
      console.error("Error removing from wishlist:", error)
      return false
    }
  }

  /**
   * Check if room is in user's wishlist
   */
  static async isInWishlist(userId: string, roomId: string): Promise<boolean> {
    try {
      const userDoc = await getDoc(doc(db, "users", userId))
      if (!userDoc.exists()) {
        return false
      }

      const userData = userDoc.data()
      const wishlist = userData.roomWishlist || []
      
      return wishlist.some((item: WishlistItem) => item.roomId === roomId)
    } catch (error) {
      console.error("Error checking wishlist:", error)
      return false
    }
  }

  /**
   * Get user's complete wishlist
   */
  static async getUserWishlist(userId: string): Promise<WishlistItem[]> {
    try {
      const userDoc = await getDoc(doc(db, "users", userId))
      if (!userDoc.exists()) {
        return []
      }

      const userData = userDoc.data()
      const wishlist = userData.roomWishlist || []
      
      // Sort by addedAt date (newest first)
      return wishlist.sort((a: WishlistItem, b: WishlistItem) => 
        new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
      )
    } catch (error) {
      console.error("Error getting wishlist:", error)
      return []
    }
  }

  /**
   * Clear entire wishlist
   */
  static async clearWishlist(userId: string): Promise<boolean> {
    try {
      const userRef = doc(db, "users", userId)
      await updateDoc(userRef, {
        roomWishlist: []
      })

      return true
    } catch (error) {
      console.error("Error clearing wishlist:", error)
      return false
    }
  }

  /**
   * Get wishlist count
   */
  static async getWishlistCount(userId: string): Promise<number> {
    try {
      const userDoc = await getDoc(doc(db, "users", userId))
      if (!userDoc.exists()) {
        return 0
      }

      const userData = userDoc.data()
      const wishlist = userData.roomWishlist || []
      
      return wishlist.length
    } catch (error) {
      console.error("Error getting wishlist count:", error)
      return 0
    }
  }

  /**
   * Toggle wishlist status (add if not in wishlist, remove if in wishlist)
   */
  static async toggleWishlist(userId: string, roomId: string): Promise<boolean> {
    try {
      const isInWishlist = await this.isInWishlist(userId, roomId)
      
      if (isInWishlist) {
        return await this.removeFromWishlist(userId, roomId)
      } else {
        return await this.addToWishlist(userId, roomId)
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error)
      return false
    }
  }
}
