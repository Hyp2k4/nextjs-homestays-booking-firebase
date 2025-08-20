"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/contexts/admin-auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function EyeballLogin() {
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div className="space-y-2">
            <Button onClick={handleLogin} className="w-full">
              Sign In
            </Button>
            <Button onClick={handleGoogleSignIn} className="w-full" variant="outline">
              Sign In with Google
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
