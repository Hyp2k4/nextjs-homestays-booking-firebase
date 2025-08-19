"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useAuth } from "@/contexts/auth-context"
import { Eye, EyeOff, Loader2 } from "lucide-react"

interface RegisterModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToLogin: () => void
}

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
)

export function RegisterModal({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState<"customer" | "host">("customer")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const { register, signInWithGoogle, isLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự")
      return
    }

    if (!phone.trim()) {
      setError("Vui lòng nhập số điện thoại")
      return
    }

    const phoneRegex = /^[0-9]{10,11}$/
    if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
      setError("Số điện thoại không hợp lệ")
      return
    }

    const result = await register({ name, email, password, phone, role })
    if (result.success) {
      if (result.needsVerification) {
        setSuccessMessage("Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản trước khi đăng nhập.")
        setName("")
        setEmail("")
        setPassword("")
        setPhone("")
        setRole("customer")
      } else {
        onClose()
      }
    } else {
      setError(result.error || "Đã có lỗi xảy ra")
    }
  }

  const handleGoogleSignIn = async () => {
    setError("")
    const result = await signInWithGoogle()
    if (result.success) {
      onClose()
    } else {
      setError(result.error || "Không thể đăng nhập với Google")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-center">Đăng ký</DialogTitle>
        </DialogHeader>

        <Button
          type="button"
          variant="outline"
          className="w-full bg-transparent"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <GoogleIcon />
          Đăng ký với Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Hoặc</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Họ và tên</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0123456789"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Loại tài khoản</Label>
            <RadioGroup value={role} onValueChange={(value) => setRole(value as "customer" | "host")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="customer" id="customer" />
                <Label htmlFor="customer">Khách hàng - Tìm và đặt homestay</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="host" id="host" />
                <Label htmlFor="host">Chủ nhà - Cho thuê homestay</Label>
              </div>
            </RadioGroup>
          </div>

          {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}
          {successMessage && <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">{successMessage}</div>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang đăng ký...
              </>
            ) : (
              "Đăng ký"
            )}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Đã có tài khoản?{" "}
          <Button variant="link" className="p-0 h-auto" onClick={onSwitchToLogin}>
            Đăng nhập ngay
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
