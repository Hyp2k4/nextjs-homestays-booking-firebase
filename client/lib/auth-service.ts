import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
  updateProfile,
} from "firebase/auth"
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore"
import { auth, db } from "./firebase/config"
import type { User, UserRole } from "@/types/auth"

export class AuthService {
  // Convert Firebase user to our User type
  private async convertFirebaseUser(firebaseUser: FirebaseUser): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
      const userData = userDoc.data()

      return {
        id: firebaseUser.uid,
        email: firebaseUser.email || "",
        name: firebaseUser.displayName || userData?.name || "",
        role: userData?.role || "customer",
        avatar: firebaseUser.photoURL || userData?.avatar,
        phone: userData?.phone,
        createdAt: userData?.createdAt || new Date().toISOString(),
        isActive: userData?.isActive !== false,
      }
    } catch (error) {
      console.error("Error converting Firebase user:", error)
      return null
    }
  }

  // Register new user
  async register(email: string, password: string, name: string, role: UserRole = "customer"): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Update display name
      await updateProfile(firebaseUser, { displayName: name })

      // Create user document in Firestore
      const userData = {
        name,
        email,
        role,
        createdAt: new Date().toISOString(),
        isActive: true,
      }

      await setDoc(doc(db, "users", firebaseUser.uid), userData)

      return {
        id: firebaseUser.uid,
        email,
        name,
        role,
        createdAt: userData.createdAt,
        isActive: true,
      }
    } catch (error: any) {
      throw new Error(error.message || "Registration failed")
    }
  }

  // Login user
  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = await this.convertFirebaseUser(userCredential.user)

      if (!user) {
        throw new Error("User data not found")
      }

      if (!user.isActive) {
        throw new Error("Account is suspended")
      }

      return user
    } catch (error: any) {
      throw new Error(error.message || "Login failed")
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await signOut(auth)
    } catch (error: any) {
      throw new Error(error.message || "Logout failed")
    }
  }

  // Get current user
  getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const user = await this.convertFirebaseUser(firebaseUser)
          resolve(user)
        } else {
          resolve(null)
        }
        unsubscribe()
      })
    })
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user = await this.convertFirebaseUser(firebaseUser)
        callback(user)
      } else {
        callback(null)
      }
    })
  }

  // Update user profile
  async updateProfile(userId: string, updates: Partial<User>): Promise<void> {
    try {
      await updateDoc(doc(db, "users", userId), {
        ...updates,
        updatedAt: new Date().toISOString(),
      })
    } catch (error: any) {
      throw new Error(error.message || "Profile update failed")
    }
  }
}

export const authService = new AuthService()
