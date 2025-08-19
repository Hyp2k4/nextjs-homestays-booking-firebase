"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
} from "firebase/auth"
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp
} from "firebase/firestore"
import { auth, db } from "@/lib/firebase/config"
import type { User, AuthState, LoginCredentials, RegisterCredentials } from "@/types/auth"

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>
  register: (
    credentials: RegisterCredentials,
  ) => Promise<{ success: boolean; error?: string; needsVerification?: boolean }>
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateProfile: (updates: Partial<User>) => Promise<void>
  registerHomestay: (homestayData: {
    name: string;
    address: string;
    contact: string;
    city: string;
  }) => Promise<{ success: boolean; error?: string }>
  getHomestay: () => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            name: userData.name || firebaseUser.displayName || "",
            avatar: userData.avatar || firebaseUser.photoURL || undefined,
            role: userData.role || "customer",
            phone: userData.phone || "",
            createdAt: userData.createdAt || new Date().toISOString(),
            emailVerified: firebaseUser.emailVerified,
            homestayId: userData.homestayId || undefined
          })
        }
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true)
      const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password)

      if (!userCredential.user.emailVerified) {
        await signOut(auth)
        return { success: false, error: "Vui lòng xác thực email trước khi đăng nhập. Kiểm tra hộp thư của bạn." }
      }

      return { success: true }
    } catch (error: any) {
      let errorMessage = "Đã có lỗi xảy ra"

      switch (error.code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
          errorMessage = "Email hoặc mật khẩu không đúng"
          break
        case "auth/too-many-requests":
          errorMessage = "Quá nhiều lần thử. Vui lòng thử lại sau"
          break
        case "auth/user-disabled":
          errorMessage = "Tài khoản đã bị vô hiệu hóa"
          break
      }

      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true)
      console.log("[v0] Starting Google sign-in process")

      const provider = new GoogleAuthProvider()
      provider.addScope("email")
      provider.addScope("profile")

      console.log("[v0] Firebase config check:", {
        apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      })

      const result = await signInWithPopup(auth, provider)
      console.log("[v0] Google sign-in successful:", result.user.email)

      const firebaseUser = result.user

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
      console.log("[v0] User exists in Firestore:", userDoc.exists())

      if (!userDoc.exists()) {
        // Create new user profile for Google sign-in users
        const userData = {
          name: firebaseUser.displayName || "",
          email: firebaseUser.email || "",
          phone: "", // Google doesn't provide phone by default
          role: "customer", // Default role for Google users
          avatar: firebaseUser.photoURL || undefined,
          createdAt: new Date().toISOString(),
          emailVerified: firebaseUser.emailVerified,
        }

        await setDoc(doc(db, "users", firebaseUser.uid), userData)
        console.log("[v0] Created new user profile in Firestore")
      }

      return { success: true }
    } catch (error: any) {
      console.error("[v0] Google sign-in error:", error)
      console.error("[v0] Error code:", error.code)
      console.error("[v0] Error message:", error.message)

      let errorMessage = "Không thể đăng nhập với Google"

      switch (error.code) {
        case "auth/popup-closed-by-user":
          errorMessage = "Đăng nhập bị hủy"
          break
        case "auth/popup-blocked":
          errorMessage = "Popup bị chặn. Vui lòng cho phép popup"
          break
        case "auth/cancelled-popup-request":
          errorMessage = "Yêu cầu đăng nhập bị hủy"
          break
        case "auth/unauthorized-domain":
          const currentDomain = typeof window !== "undefined" ? window.location.origin : "localhost"
          errorMessage = `Domain hiện tại (${currentDomain}) chưa được authorize. Vui lòng thêm domain này vào Firebase Console > Authentication > Settings > Authorized domains`
          break
        case "auth/operation-not-allowed":
          errorMessage =
            "Google sign-in chưa được enable trong Firebase Console. Vui lòng enable Google provider trong Authentication > Sign-in method"
          break
        case "auth/invalid-api-key":
          errorMessage = "API key không hợp lệ. Vui lòng kiểm tra NEXT_PUBLIC_FIREBASE_API_KEY trong .env.local"
          break
        default:
          errorMessage = `Lỗi Google sign-in: ${error.message}`
      }

      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (
    credentials: RegisterCredentials,
  ): Promise<{ success: boolean; error?: string; needsVerification?: boolean }> => {
    try {
      setIsLoading(true)

      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, credentials.email, credentials.password)
      const firebaseUser = userCredential.user

      await sendEmailVerification(firebaseUser)

      // Update Firebase profile
      await updateFirebaseProfile(firebaseUser, {
        displayName: credentials.name,
      })

      const userData = {
        name: credentials.name,
        email: credentials.email,
        phone: credentials.phone,
        role: credentials.role, // This ensures host role is saved correctly
        createdAt: new Date().toISOString(),
        emailVerified: false, // Track verification status
      }

      await setDoc(doc(db, "users", firebaseUser.uid), userData)

      await signOut(auth)

      return { success: true, needsVerification: true }
    } catch (error: any) {
      let errorMessage = "Đã có lỗi xảy ra"

      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "Email này đã được sử dụng"
          break
        case "auth/weak-password":
          errorMessage = "Mật khẩu quá yếu"
          break
        case "auth/invalid-email":
          errorMessage = "Email không hợp lệ"
          break
      }

      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return

    try {
      // Update Firestore document
      await updateDoc(doc(db, "users", user.id), updates)

      // Update Firebase profile if name or avatar changed
      if (updates.name || updates.avatar) {
        await updateFirebaseProfile(auth.currentUser!, {
          displayName: updates.name || user.name,
          photoURL: updates.avatar || user.avatar || null,
        })
      }
    } catch (error) {
      console.error("Profile update error:", error)
      throw error
    }
  }
  const registerHomestay = async (homestayData: {
    name: string;
    address: string;
    contact: string;
    city: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: "Bạn cần đăng nhập để đăng ký homestay" }
    }

    try {
      setIsLoading(true)

      // Tạo homestay mới trong collection 'homestays'
      const homestayRef = await addDoc(collection(db, "homestays"), {
        ...homestayData,
        hostId: user.id,
        status: "pending",
        isActive: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      // Cập nhật thông tin người dùng để thêm homestayId
      await updateDoc(doc(db, "users", user.id), {
        homestayId: homestayRef.id,
        role: "host" // Cập nhật role thành host
      })

      // Cập nhật state người dùng
      setUser(prev => prev ? {
        ...prev,
        homestayId: homestayRef.id,
        role: "host"
      } : null)

      return { success: true }
    } catch (error: any) {
      console.error("Lỗi đăng ký homestay:", error)
      return {
        success: false,
        error: error.message || "Có lỗi xảy ra khi đăng ký homestay"
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getHomestay = async () => {
    if (!user?.homestayId) return null

    try {
      const homestayDoc = await getDoc(doc(db, "homestays", user.homestayId))
      return homestayDoc.exists() ? homestayDoc.data() : null
    } catch (error) {
      console.error("Lỗi khi lấy thông tin homestay:", error)
      return null
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    signInWithGoogle,
    logout,
    updateProfile,
    registerHomestay,
    getHomestay
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}