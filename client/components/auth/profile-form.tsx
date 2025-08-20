"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
import { toast } from "react-toastify"
import { Loader2, User, Mail, Phone, Shield, Camera, Edit, Trash2, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import type { User as UserType } from "@/types/auth"

export function ProfileForm() {
  const { user, updateUserProfile, resendEmailVerification, checkEmailVerification, resetPassword } = useAuth()
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    avatar: ''
  })
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        avatar: user.avatar || ''
      })
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveProfile = async () => {
    if (!user) return

    setUpdating(true)
    try {
      const result = await updateUserProfile(formData)
      if (result.success) {
        toast.success("Cập nhật thông tin thành công!")
        setIsEditing(false)
      } else {
        toast.error(result.error || "Có lỗi xảy ra khi cập nhật thông tin")
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật thông tin")
    } finally {
      setUpdating(false)
    }
  }

  const handleResendVerification = async () => {
    setLoading(true)
    try {
      const result = await resendEmailVerification()
      if (result.success) {
        toast.success("Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư của bạn.")
      } else {
        toast.error(result.error || "Không thể gửi lại email xác thực")
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi gửi lại email xác thực")
    } finally {
      setLoading(false)
    }
  }

  const handleCheckVerification = async () => {
    setLoading(true)
    try {
      const result = await checkEmailVerification()
      if (result.success) {
        toast.success("Email đã được xác thực thành công!")
      } else {
        toast.error(result.error || "Email chưa được xác thực")
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi kiểm tra xác thực email")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!user?.email) return

    setLoading(true)
    try {
      const result = await resetPassword(user.email)
      if (result.success) {
        toast.success("Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.")
      } else {
        toast.error(result.error || "Không thể gửi email đặt lại mật khẩu")
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi gửi email đặt lại mật khẩu")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    // TODO: Implement account deletion
    toast.info("Tính năng xóa tài khoản sẽ được triển khai sớm")
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Đang tải thông tin...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Thông tin tài khoản</h1>
        <p className="text-gray-600 mt-2">Quản lý thông tin cá nhân và bảo mật tài khoản</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Thông tin cá nhân
                </CardTitle>
                <CardDescription>
                  Cập nhật thông tin cá nhân của bạn
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                disabled={updating}
              >
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? 'Hủy' : 'Chỉnh sửa'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-lg">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <div className="space-y-2">
                  <Label htmlFor="avatar" className="text-sm font-medium">
                    URL ảnh đại diện
                  </Label>
                  <Input
                    id="avatar"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleInputChange}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-64"
                  />
                </div>
              )}
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Họ và tên
              </Label>
              {isEditing ? (
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nhập họ và tên"
                />
              ) : (
                <p className="text-gray-900 font-medium">{user.name || 'Chưa cập nhật'}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <div className="flex items-center gap-2">
                <p className="text-gray-900">{user.email}</p>
                <Badge variant={user.emailVerified ? "default" : "secondary"}>
                  {user.emailVerified ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Đã xác thực
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" />
                      Chưa xác thực
                    </>
                  )}
                </Badge>
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Số điện thoại
              </Label>
              {isEditing ? (
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="0123456789"
                />
              ) : (
                <p className="text-gray-900">{user.phone || 'Chưa cập nhật'}</p>
              )}
              <p className="text-xs text-gray-500">Số điện thoại để liên hệ và nhận thông báo</p>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Vai trò
              </Label>
              <Badge variant={user.role === 'host' ? 'default' : 'secondary'}>
                {user.role === 'host' ? 'Chủ homestay' : 'Khách hàng'}
              </Badge>
            </div>

            {/* Save Button */}
            {isEditing && (
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSaveProfile}
                  disabled={updating}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {updating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    'Lưu thay đổi'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false)
                    setFormData({
                      name: user.name || '',
                      phone: user.phone || '',
                      avatar: user.avatar || ''
                    })
                  }}
                  disabled={updating}
                >
                  Hủy
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Bảo mật
            </CardTitle>
            <CardDescription>
              Quản lý bảo mật tài khoản
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email Verification */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Xác thực email</Label>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResendVerification}
                  disabled={loading || user.emailVerified}
                  className="w-full"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Gửi lại email xác thực
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCheckVerification}
                  disabled={loading}
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Kiểm tra xác thực
                </Button>
              </div>
            </div>

            <Separator />

            {/* Password Reset */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Mật khẩu</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                Đặt lại mật khẩu
              </Button>
            </div>

            <Separator />

            {/* Delete Account */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-red-600">Xóa tài khoản</Label>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xóa tài khoản
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Bạn có chắc chắn muốn xóa tài khoản?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Hành động này không thể hoàn tác. Tài khoản và tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Xóa tài khoản
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
