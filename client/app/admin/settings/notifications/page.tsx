"use client"

import { useState, useEffect } from "react"
import { AdminDashboardLayout } from "@/components/admin/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { AdminSettingsService, type NotificationSettings } from "@/lib/admin-settings-service"
import { BeautifulLoader } from "@/components/ui/beautiful-loader"
import { toast } from "sonner"
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Save, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Users,
  Calendar,
  Star,
  CreditCard,
  Settings
} from "lucide-react"

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const unsubscribe = AdminSettingsService.subscribeToNotificationSettings((notificationSettings) => {
      if (notificationSettings) {
        setSettings(notificationSettings)
      } else {
        // Use default settings if none exist
        setSettings(AdminSettingsService.getDefaultNotificationSettings())
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleSave = async () => {
    if (!settings) return

    setSaving(true)
    try {
      await AdminSettingsService.saveNotificationSettings(settings)
      toast.success("Notification settings saved successfully!")
    } catch (error) {
      console.error("Error saving notification settings:", error)
      toast.error("Failed to save notification settings")
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setSettings(AdminSettingsService.getDefaultNotificationSettings())
    toast.info("Settings reset to defaults")
  }

  const updateEmailNotification = (key: keyof NotificationSettings['emailNotifications'], value: boolean) => {
    if (!settings) return
    setSettings({
      ...settings,
      emailNotifications: {
        ...settings.emailNotifications,
        [key]: value
      }
    })
  }

  const updatePushNotification = (key: keyof NotificationSettings['pushNotifications'], value: boolean) => {
    if (!settings) return
    setSettings({
      ...settings,
      pushNotifications: {
        ...settings.pushNotifications,
        [key]: value
      }
    })
  }

  const updateEmailTemplate = (key: keyof NotificationSettings['emailTemplates'], value: boolean) => {
    if (!settings) return
    setSettings({
      ...settings,
      emailTemplates: {
        ...settings.emailTemplates,
        [key]: value
      }
    })
  }

  if (loading) {
    return (
      <AdminDashboardLayout title="Notification Settings">
        <BeautifulLoader variant="dots" size="lg" text="Loading notification settings..." />
      </AdminDashboardLayout>
    )
  }

  if (!settings) {
    return (
      <AdminDashboardLayout title="Notification Settings">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">Failed to load settings</h3>
          <p className="text-neutral-600">Please try refreshing the page.</p>
        </div>
      </AdminDashboardLayout>
    )
  }

  return (
    <AdminDashboardLayout title="Notification Settings">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Notification Settings</h2>
            <p className="text-neutral-600 mt-1">Configure email and push notification preferences</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <BeautifulLoader size="sm" variant="spin" />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Email Notifications
            </CardTitle>
            <CardDescription>
              Configure which events trigger email notifications to administrators
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <div>
                    <Label htmlFor="newBookings" className="text-sm font-medium">New Bookings</Label>
                    <p className="text-xs text-neutral-500">Get notified when users make new bookings</p>
                  </div>
                </div>
                <Switch
                  id="newBookings"
                  checked={settings.emailNotifications.newBookings}
                  onCheckedChange={(checked) => updateEmailNotification('newBookings', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Star className="h-5 w-5 text-yellow-600" />
                  <div>
                    <Label htmlFor="newReviews" className="text-sm font-medium">New Reviews</Label>
                    <p className="text-xs text-neutral-500">Get notified when users submit reviews</p>
                  </div>
                </div>
                <Switch
                  id="newReviews"
                  checked={settings.emailNotifications.newReviews}
                  onCheckedChange={(checked) => updateEmailNotification('newReviews', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-purple-600" />
                  <div>
                    <Label htmlFor="newUsers" className="text-sm font-medium">New Users</Label>
                    <p className="text-xs text-neutral-500">Get notified when new users register</p>
                  </div>
                </div>
                <Switch
                  id="newUsers"
                  checked={settings.emailNotifications.newUsers}
                  onCheckedChange={(checked) => updateEmailNotification('newUsers', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  <div>
                    <Label htmlFor="paymentAlerts" className="text-sm font-medium">Payment Alerts</Label>
                    <p className="text-xs text-neutral-500">Get notified about payment issues</p>
                  </div>
                </div>
                <Switch
                  id="paymentAlerts"
                  checked={settings.emailNotifications.paymentAlerts}
                  onCheckedChange={(checked) => updateEmailNotification('paymentAlerts', checked)}
                />
              </div>

              <div className="flex items-center justify-between md:col-span-2">
                <div className="flex items-center space-x-3">
                  <Settings className="h-5 w-5 text-red-600" />
                  <div>
                    <Label htmlFor="systemAlerts" className="text-sm font-medium">System Alerts</Label>
                    <p className="text-xs text-neutral-500">Get notified about system issues and maintenance</p>
                  </div>
                </div>
                <Switch
                  id="systemAlerts"
                  checked={settings.emailNotifications.systemAlerts}
                  onCheckedChange={(checked) => updateEmailNotification('systemAlerts', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Push Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-green-600" />
              Push Notifications
            </CardTitle>
            <CardDescription>
              Configure browser push notifications for real-time alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-blue-600" />
                <div>
                  <Label htmlFor="pushEnabled" className="text-sm font-medium">Enable Push Notifications</Label>
                  <p className="text-xs text-neutral-500">Master switch for all push notifications</p>
                </div>
              </div>
              <Switch
                id="pushEnabled"
                checked={settings.pushNotifications.enabled}
                onCheckedChange={(checked) => updatePushNotification('enabled', checked)}
              />
            </div>

            {settings.pushNotifications.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <div>
                      <Label htmlFor="pushBookings" className="text-sm font-medium">New Bookings</Label>
                      <p className="text-xs text-neutral-500">Instant notifications for new bookings</p>
                    </div>
                  </div>
                  <Switch
                    id="pushBookings"
                    checked={settings.pushNotifications.newBookings}
                    onCheckedChange={(checked) => updatePushNotification('newBookings', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <Label htmlFor="urgentAlerts" className="text-sm font-medium">Urgent Alerts</Label>
                      <p className="text-xs text-neutral-500">Critical system and security alerts</p>
                    </div>
                  </div>
                  <Switch
                    id="urgentAlerts"
                    checked={settings.pushNotifications.urgentAlerts}
                    onCheckedChange={(checked) => updatePushNotification('urgentAlerts', checked)}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Email Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-orange-600" />
              Email Templates
            </CardTitle>
            <CardDescription>
              Enable or disable automated email templates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <Label htmlFor="welcomeEmail" className="text-sm font-medium">Welcome Email</Label>
                    <p className="text-xs text-neutral-500">Send welcome email to new users</p>
                  </div>
                </div>
                <Switch
                  id="welcomeEmail"
                  checked={settings.emailTemplates.welcomeEmail}
                  onCheckedChange={(checked) => updateEmailTemplate('welcomeEmail', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <Label htmlFor="bookingConfirmation" className="text-sm font-medium">Booking Confirmation</Label>
                    <p className="text-xs text-neutral-500">Send booking confirmation emails</p>
                  </div>
                </div>
                <Switch
                  id="bookingConfirmation"
                  checked={settings.emailTemplates.bookingConfirmation}
                  onCheckedChange={(checked) => updateEmailTemplate('bookingConfirmation', checked)}
                />
              </div>

              <div className="flex items-center justify-between md:col-span-2">
                <div className="flex items-center space-x-3">
                  <Star className="h-5 w-5 text-yellow-600" />
                  <div>
                    <Label htmlFor="reviewReminder" className="text-sm font-medium">Review Reminder</Label>
                    <p className="text-xs text-neutral-500">Send review reminders after checkout</p>
                  </div>
                </div>
                <Switch
                  id="reviewReminder"
                  checked={settings.emailTemplates.reviewReminder}
                  onCheckedChange={(checked) => updateEmailTemplate('reviewReminder', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? (
              <BeautifulLoader size="sm" variant="spin" />
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save All Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </AdminDashboardLayout>
  )
}
