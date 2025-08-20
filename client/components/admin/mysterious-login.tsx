"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth"
import { adminAuth, adminDb } from "@/lib/firebase/admin-config"
import { doc, getDoc } from "firebase/firestore"
import { useAdminAuth } from "@/contexts/admin-auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleIcon } from "@/public/svg"
import { Eye, EyeOff } from "lucide-react"
import Image from "next/image"

export function MysteriousLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const { login, signInWithGoogle, sendSignInLink } = useAdminAuth()
  const router = useRouter()
  const [emailSent, setEmailSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const handleEmailLinkSignIn = async () => {
      if (isSignInWithEmailLink(adminAuth, window.location.href)) {
        setIsLoading(true)
        let email = window.localStorage.getItem("emailForSignIn")
        if (!email) {
          email = window.prompt("Please provide your email for confirmation")
        }
        if (email) {
          try {
            const result = await signInWithEmailLink(adminAuth, email, window.location.href)
            const userDoc = await getDoc(doc(adminDb, "users", result.user.uid))
            if (userDoc.exists() && userDoc.data().role === "admin") {
              window.localStorage.removeItem("emailForSignIn")
              router.push("/admin")
            } else {
              setError("You are not authorized to access this page.")
            }
          } catch (error: any) {
            setError(error.message || "Failed to sign in with email link.")
          }
        }
        setIsLoading(false)
      }
    }
    handleEmailLinkSignIn()
  }, [router])

  const handleLogin = async () => {
    setError("")
    const result = await login({ email, password })
    if (result.success) {
      router.push("/admin")
    } else {
      setError(result.error || "Login failed")
    }
  }

  const handleGoogleSignIn = async () => {
    setError("")
    const result = await signInWithGoogle()
    if (result.success) {
      router.push("/admin")
    } else {
      setError(result.error || "Google sign-in failed")
    }
  }

  const handleSendSignInLink = async () => {
    setError("")
    if (!email) {
      setError("Please enter your email address.")
      return
    }
    setIsLoading(true)
    const result = await sendSignInLink(email)
    if (result.success) {
      setEmailSent(true)
    } else {
      setError(result.error || "Failed to send sign-in link.")
    }
    setIsLoading(false)
  }

  return (
    <>
      <style jsx global>{`
        .mysterious-login-body {
          background: #0f0c29;
          background: -webkit-linear-gradient(to right, #24243e, #302b63, #0f0c29);
          background: linear-gradient(to right, #24243e, #302b63, #0f0c29);
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }
        .glow-card {
          position: relative;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 2rem;
          width: 100%;
          max-width: 400px;
        }
        .glow-card::before {
          content: "";
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, #ff00ff, #00ffff, #ff00ff);
          background-size: 400%;
          border-radius: 22px;
          z-index: -1;
          filter: blur(5px);
          animation: glowing 20s linear infinite;
        }
        @keyframes glowing {
          0% {
            background-position: 0 0;
          }
          50% {
            background-position: 400% 0;
          }
          100% {
            background-position: 0 0;
          }
        }
      `}</style>
      <div className="mysterious-login-body">
        <div className="glow-card">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white ">Admin Portal</h1>
            <Image
              src="/Logo.svg"
              alt="Logo"
              width={80}
              height={80}
              className="text-center mx-auto"
            />          </div>
          <div className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="bg-gray-900/50 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-gray-300">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="bg-gray-900/50 border-gray-700 text-white"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          {error && <p className="text-red-400 text-sm text-center mt-4">{error}</p>}
          {emailSent && (
            <p className="text-green-400 text-sm text-center mt-4">
              A sign-in link has been sent to your email address.
            </p>
          )}
          <div className="space-y-4 mt-8">
            <Button onClick={handleLogin} className="w-full bg-purple-600 hover:bg-purple-700">
              Enter the Void
            </Button>
            <Button onClick={handleGoogleSignIn} className="w-full" variant="outline">
              <GoogleIcon />
              Sign In with Google
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
