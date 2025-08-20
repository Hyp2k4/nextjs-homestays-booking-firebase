"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { adminAuth, adminDb } from "@/lib/firebase/admin-config"
import type { LoginCredentials } from "@/types/auth"
import { toast } from "sonner"

interface AdminUser {
  id: string
  email: string
  name: string
  role: "admin"
}

interface AdminAuthState {
  user: AdminUser | null
  isAuthenticated: boolean
  loading: boolean
}

interface AdminAuthContextType extends AdminAuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>
  sendSignInLink: (email: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(adminAuth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(adminDb, "users", firebaseUser.uid))
        if (userDoc.exists() && userDoc.data().role === "admin") {
          const userData = userDoc.data()
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            name: userData.name || "",
            role: "admin",
          })
        } else {
          setUser(null)
          signOut(adminAuth)
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
      const userCredential = await signInWithEmailAndPassword(
        adminAuth,
        credentials.email,
        credentials.password,
      )
      const firebaseUser = userCredential.user

      const userDoc = await getDoc(doc(adminDb, "users", firebaseUser.uid))
      if (userDoc.exists() && userDoc.data().role === "admin") {
        return { success: true }
      } else {
        await signOut(adminAuth)
        toast.error("You are not authorized to access this page.")
        return { success: false, error: "You are not authorized to access this page." }
      }
    } catch (error: any) {
      toast.error("Invalid credentials")
      return { success: false, error: "Invalid credentials" }
    }
  }

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(adminAuth, provider)
      const firebaseUser = result.user

      const userDoc = await getDoc(doc(adminDb, "users", firebaseUser.uid))
      if (userDoc.exists() && userDoc.data().role === "admin") {
        return { success: true }
      } else {
        await signOut(adminAuth)
        toast.error("You are not authorized to access this page.")
        return { success: false, error: "You are not authorized to access this page." }
      }
    } catch (error: any) {
      toast.error("Google sign-in failed.")
      return { success: false, error: "Google sign-in failed." }
    }
  }

  const sendSignInLink = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const actionCodeSettings = {
      url: `${window.location.origin}/admin/login`,
      handleCodeInApp: true,
    }
    try {
      await sendSignInLinkToEmail(adminAuth, email, actionCodeSettings)
      window.localStorage.setItem("emailForSignIn", email)
      return { success: true }
    } catch (error: any) {
      console.error("Firebase send sign-in link error:", error)
      return { success: false, error: error.message || "Failed to send sign-in link." }
    }
  }

  const logout = async () => {
    await signOut(adminAuth)
  }

  const value: AdminAuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    signInWithGoogle,
    sendSignInLink,
    logout,
  }

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider")
  }
  return context
}
