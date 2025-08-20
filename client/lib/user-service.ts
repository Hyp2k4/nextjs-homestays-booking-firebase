import { doc, getDoc } from "firebase/firestore"
import { db } from "./firebase/config"
import type { User } from "@/types/auth"

export class UserService {
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const userRef = doc(db, "users", userId)
      const userSnap = await getDoc(userRef)
      if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() } as User
      }
      return null
    } catch (error) {
      console.error("Error fetching user:", error)
      return null
    }
  }
}
