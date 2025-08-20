"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/contexts/admin-auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function AnimatedLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login, signInWithGoogle } = useAdminAuth()
  const router = useRouter()

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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Admin Login</h1>
          <p className="text-gray-400">Enter your credentials to sign in</p>
        </div>
        <div className="space-y-6">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="bg-gray-700 border-gray-600"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="bg-gray-700 border-gray-600"
            />
          </div>
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <div className="space-y-4">
          <Button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-700">
            SIGN IN
          </Button>
          <Button onClick={handleGoogleSignIn} className="w-full bg-red-600 hover:bg-red-700">
            Sign In with Google
          </Button>
        </div>
      </div>
    </div>
  )
}
