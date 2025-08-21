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
  sendPasswordResetEmail,
  reload,
} from "firebase/auth"
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
  arrayUnion
} from "firebase/firestore"
import { auth, db } from "@/lib/firebase/config"
import type { User, AuthState, LoginCredentials, RegisterCredentials } from "@/types/auth"

interface AuthContextType extends AuthState {
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>
  register: (
    credentials: RegisterCredentials,
  ) => Promise<{ success: boolean; error?: string; needsVerification?: boolean }>
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>
  logout: () => void
  uploadAvatar: (file: File) => Promise<{ success: boolean; url?: string; error?: string }>
  updateProfile: (updates: Partial<User>) => Promise<void>
  updateUserProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>
  resendEmailVerification: () => Promise<{ success: boolean; error?: string }>
  checkEmailVerification: () => Promise<{ success: boolean; error?: string }>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  togglePropertyWishlist?: (propertyId: string) => Promise<{ success: boolean; inWishlist: boolean; error?: string }>
  toggleRoomWishlist?: (roomId: string) => Promise<{ success: boolean; inWishlist: boolean; error?: string }>
  registerHomestay: (homestayData: {
    name: string
    address: string
    phone: string
    city: string
    status: string
  }) => Promise<{ success: boolean; error?: string }>
  getHomestay: () => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
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
            homestayId: userData.homestayId || undefined,
            propertyWishlist: userData.propertyWishlist || [],
            roomWishlist: userData.roomWishlist || []
          })
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true)
      const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password)

      // Kiểm tra xác thực email
      if (!userCredential.user.emailVerified) {
        await signOut(auth)
        return { 
          success: false, 
          error: "Vui lòng xác thực email trước khi đăng nhập. Kiểm tra hộp thư của bạn hoặc yêu cầu gửi lại email xác thực." 
        }
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
        case "auth/email-not-verified":
          errorMessage = "Email chưa được xác thực. Vui lòng kiểm tra hộp thư và xác thực email."
          break
      }

      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true)
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
      setLoading(false)
    }
  }

  const register = async (
    credentials: RegisterCredentials,
  ): Promise<{ success: boolean; error?: string; needsVerification?: boolean }> => {
    try {
      setLoading(true)

      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, credentials.email, credentials.password)
      const firebaseUser = userCredential.user

      // Gửi email xác thực
      await sendEmailVerification(firebaseUser, {
        url: `${window.location.origin}/auth/verify-email`,
        handleCodeInApp: false,
      })

      // Update Firebase profile
      await updateFirebaseProfile(firebaseUser, {
        displayName: credentials.name,
      })

      const userData = {
        name: credentials.name,
        email: credentials.email,
        phone: credentials.phone,
        role: credentials.role,
        createdAt: new Date().toISOString(),
        emailVerified: false,
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
      setLoading(false)
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

  const updateUserProfile = async (updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: "Bạn cần đăng nhập để cập nhật thông tin" }
    }

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

      // Update local state
      setUser(prev => prev ? { ...prev, ...updates } : null)

      return { success: true }
    } catch (error: any) {
      console.error("Profile update error:", error)
      return { success: false, error: error.message || "Có lỗi xảy ra khi cập nhật thông tin" }
    }
  }

  const resendEmailVerification = async (): Promise<{ success: boolean; error?: string }> => {
    if (!auth.currentUser) {
      return { success: false, error: "Không có người dùng đăng nhập" }
    }

    try {
      await sendEmailVerification(auth.currentUser, {
        url: `${window.location.origin}/auth/verify-email`,
        handleCodeInApp: false,
      })
      return { success: true }
    } catch (error: any) {
      console.error("Resend email verification error:", error)
      return { success: false, error: error.message || "Không thể gửi lại email xác thực" }
    }
  }

  const checkEmailVerification = async (): Promise<{ success: boolean; error?: string }> => {
    if (!auth.currentUser) {
      return { success: false, error: "Không có người dùng đăng nhập" }
    }

    try {
      await reload(auth.currentUser)
      
      if (auth.currentUser.emailVerified) {
        // Update Firestore
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
          emailVerified: true
        })

        // Update local state
        setUser(prev => prev ? { ...prev, emailVerified: true } : null)

        return { success: true }
      } else {
        return { success: false, error: "Email chưa được xác thực" }
      }
    } catch (error: any) {
      console.error("Check email verification error:", error)
      return { success: false, error: error.message || "Không thể kiểm tra trạng thái xác thực email" }
    }
  }

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await sendPasswordResetEmail(auth, email)
      return { success: true }
    } catch (error: any) {
      console.error("Send password reset email error:", error)
      let errorMessage = "Không thể gửi email đặt lại mật khẩu"

      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "Email không tồn tại trong hệ thống"
          break
        case "auth/invalid-email":
          errorMessage = "Email không hợp lệ"
          break
        case "auth/too-many-requests":
          errorMessage = "Quá nhiều yêu cầu. Vui lòng thử lại sau"
          break
      }

      return { success: false, error: errorMessage }
    }
  }

  const togglePropertyWishlist = async (propertyId: string): Promise<{ success: boolean; inWishlist: boolean; error?: string }> => {
    if (!user) return { success: false, inWishlist: false, error: "Bạn cần đăng nhập" }
    try {
      const currentWishlist = user.propertyWishlist || []
      const inWishlist = currentWishlist.includes(propertyId)
      const nextWishlist = inWishlist
        ? currentWishlist.filter(id => id !== propertyId)
        : [...currentWishlist, propertyId]

      await updateDoc(doc(db, "users", user.id), { propertyWishlist: nextWishlist })
      setUser(prev => prev ? { ...prev, propertyWishlist: nextWishlist } : prev)
      return { success: true, inWishlist: !inWishlist }
    } catch (error: any) {
      return { success: false, inWishlist: !!user.propertyWishlist?.includes(propertyId), error: error.message || "Không thể cập nhật wishlist" }
    }
  }

  const toggleRoomWishlist = async (roomId: string): Promise<{ success: boolean; inWishlist: boolean; error?: string }> => {
    if (!user) return { success: false, inWishlist: false, error: "Bạn cần đăng nhập" }
    try {
      const currentWishlist = user.roomWishlist || []
      const inWishlist = currentWishlist.includes(roomId)
      const nextWishlist = inWishlist
        ? currentWishlist.filter(id => id !== roomId)
        : [...currentWishlist, roomId]

      await updateDoc(doc(db, "users", user.id), { roomWishlist: nextWishlist })
      setUser(prev => prev ? { ...prev, roomWishlist: nextWishlist } : prev)
      return { success: true, inWishlist: !inWishlist }
    } catch (error: any) {
      return { success: false, inWishlist: !!user.roomWishlist?.includes(roomId), error: error.message || "Không thể cập nhật wishlist" }
    }
  }

  const registerHomestay = async (homestayData: {
    name: string;
    address: string;
    phone: string;
    city: string;
    status: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: "Bạn cần đăng nhập để đăng ký homestay" }
    }

    try {
      setLoading(true)

      // Tạo homestay mới trong collection 'homestays'
      const homestayRef = await addDoc(collection(db, "homestays"), {
        ...homestayData,
        hostId: user.id,
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
      setLoading(false)
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

  const uploadAvatar = async (file: File): Promise<{ success: boolean; url?: string; error?: string }> => {
    if (!user) return { success: false, error: "Bạn cần đăng nhập" }
    
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      
      if (result.secure_url) {
        return { success: true, url: result.secure_url }
      } else {
        return { success: false, error: 'Cloudinary did not return a secure URL' }
      }
    } catch (error: any) {
      console.error("Lỗi khi tải ảnh đại diện:", error)
      return { success: false, error: error.message || "Không thể tải ảnh lên" }
    }
  }

  const value: AuthContextType = {
    user,
    isLoading: loading,
    isAuthenticated: !!user,
    login,
    register,
    signInWithGoogle,
    logout,
    updateProfile,
    uploadAvatar,
    updateUserProfile,
    resendEmailVerification,
    checkEmailVerification,
    resetPassword,
    togglePropertyWishlist,
    toggleRoomWishlist,
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
