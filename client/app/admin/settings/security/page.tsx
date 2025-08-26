"use client"

import { useState, useEffect } from "react"
import { AdminDashboardLayout } from "@/components/admin/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AdminSettingsService, type SecuritySettings } from "@/lib/admin-settings-service"
import { BeautifulLoader } from "@/components/ui/beautiful-loader"
import { toast } from "sonner"
import { 
  Shield, 
  Lock, 
  Key, 
  Globe, 
  Save, 
  RefreshCw,
  AlertTriangle,
  Clock,
  UserCheck,
  Settings
} from "lucide-react"

export default function SecuritySettingsPage() {
  const [settings, setSettings] = useState<SecuritySettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const securitySettings = await AdminSettingsService.getSecuritySettings()
        if (securitySettings) {
          setSettings(securitySettings)
        } else {
          setSettings(AdminSettingsService.getDefaultSecuritySettings())
        }
      } catch (error) {
        console.error("Error loading security settings:", error)
        setSettings(AdminSettingsService.getDefaultSecuritySettings())
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleSave = async () => {
    if (!settings) return

    setSaving(true)
    try {
      await AdminSettingsService.saveSecuritySettings(settings)
      toast.success("Security settings saved successfully!")
    } catch (error) {
      console.error("Error saving security settings:", error)
      toast.error("Failed to save security settings")
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setSettings(AdminSettingsService.getDefaultSecuritySettings())
    toast.info("Settings reset to defaults")
  }

  const updateAuthentication = (key: keyof SecuritySettings['authentication'], value: any) => {
    if (!settings) return
    setSettings({
      ...settings,
      authentication: {
        ...settings.authentication,
        [key]: value
      }
    })
  }

  const updatePasswordPolicy = (key: keyof SecuritySettings['passwordPolicy'], value: any) => {
    if (!settings) return
    setSettings({
      ...settings,
      passwordPolicy: {
        ...settings.passwordPolicy,
        [key]: value
      }
    })
  }

  const updateApiSecurity = (key: keyof SecuritySettings['apiSecurity'], value: any) => {
    if (!settings) return
    setSettings({
      ...settings,
      apiSecurity: {
        ...settings.apiSecurity,
        [key]: value
      }
    })
  }

  const addAllowedOrigin = () => {
    if (!settings) return
    const newOrigin = prompt("Enter allowed origin (e.g., https://example.com):")
    if (newOrigin && newOrigin.trim()) {
      updateApiSecurity('allowedOrigins', [...settings.apiSecurity.allowedOrigins, newOrigin.trim()])
    }
  }

  const removeAllowedOrigin = (index: number) => {
    if (!settings) return
    const newOrigins = settings.apiSecurity.allowedOrigins.filter((_, i) => i !== index)
    updateApiSecurity('allowedOrigins', newOrigins)
  }

  if (loading) {
    return (
      <AdminDashboardLayout title="Security Settings">
        <BeautifulLoader variant="dots" size="lg" text="Loading security settings..." />
      </AdminDashboardLayout>
    )
  }

  if (!settings) {
    return (
      <AdminDashboardLayout title="Security Settings">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">Failed to load settings</h3>
          <p className="text-neutral-600">Please try refreshing the page.</p>
        </div>
      </AdminDashboardLayout>
    )
  }

  return (
    <AdminDashboardLayout title="Security Settings">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Security Settings</h2>
            <p className="text-neutral-600 mt-1">Configure authentication and security policies</p>
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

        {/* Authentication Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-blue-600" />
              Authentication Settings
            </CardTitle>
            <CardDescription>
              Configure user authentication and session management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailVerification" className="text-sm font-medium">Email Verification</Label>
                  <p className="text-xs text-neutral-500">Require email verification for new accounts</p>
                </div>
                <Switch
                  id="emailVerification"
                  checked={settings.authentication.requireEmailVerification}
                  onCheckedChange={(checked) => updateAuthentication('requireEmailVerification', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="twoFactor" className="text-sm font-medium">Two-Factor Authentication</Label>
                  <p className="text-xs text-neutral-500">Enable 2FA for admin accounts</p>
                </div>
                <Switch
                  id="twoFactor"
                  checked={settings.authentication.enableTwoFactor}
                  onCheckedChange={(checked) => updateAuthentication('enableTwoFactor', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.authentication.sessionTimeout}
                  onChange={(e) => updateAuthentication('sessionTimeout', parseInt(e.target.value) || 480)}
                  min="30"
                  max="1440"
                />
                <p className="text-xs text-neutral-500">Auto-logout after inactivity</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  value={settings.authentication.maxLoginAttempts}
                  onChange={(e) => updateAuthentication('maxLoginAttempts', parseInt(e.target.value) || 5)}
                  min="3"
                  max="10"
                />
                <p className="text-xs text-neutral-500">Lock account after failed attempts</p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
                <Input
                  id="lockoutDuration"
                  type="number"
                  value={settings.authentication.lockoutDuration}
                  onChange={(e) => updateAuthentication('lockoutDuration', parseInt(e.target.value) || 30)}
                  min="5"
                  max="1440"
                />
                <p className="text-xs text-neutral-500">How long to lock account after max attempts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Password Policy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-green-600" />
              Password Policy
            </CardTitle>
            <CardDescription>
              Set password requirements for user accounts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="minLength">Minimum Length</Label>
                <Input
                  id="minLength"
                  type="number"
                  value={settings.passwordPolicy.minLength}
                  onChange={(e) => updatePasswordPolicy('minLength', parseInt(e.target.value) || 8)}
                  min="6"
                  max="32"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                <Input
                  id="passwordExpiry"
                  type="number"
                  value={settings.passwordPolicy.passwordExpiry}
                  onChange={(e) => updatePasswordPolicy('passwordExpiry', parseInt(e.target.value) || 0)}
                  min="0"
                  max="365"
                />
                <p className="text-xs text-neutral-500">0 = never expires</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="requireUppercase" className="text-sm font-medium">Require Uppercase</Label>
                  <p className="text-xs text-neutral-500">At least one uppercase letter</p>
                </div>
                <Switch
                  id="requireUppercase"
                  checked={settings.passwordPolicy.requireUppercase}
                  onCheckedChange={(checked) => updatePasswordPolicy('requireUppercase', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="requireLowercase" className="text-sm font-medium">Require Lowercase</Label>
                  <p className="text-xs text-neutral-500">At least one lowercase letter</p>
                </div>
                <Switch
                  id="requireLowercase"
                  checked={settings.passwordPolicy.requireLowercase}
                  onCheckedChange={(checked) => updatePasswordPolicy('requireLowercase', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="requireNumbers" className="text-sm font-medium">Require Numbers</Label>
                  <p className="text-xs text-neutral-500">At least one number</p>
                </div>
                <Switch
                  id="requireNumbers"
                  checked={settings.passwordPolicy.requireNumbers}
                  onCheckedChange={(checked) => updatePasswordPolicy('requireNumbers', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="requireSpecialChars" className="text-sm font-medium">Require Special Characters</Label>
                  <p className="text-xs text-neutral-500">At least one special character</p>
                </div>
                <Switch
                  id="requireSpecialChars"
                  checked={settings.passwordPolicy.requireSpecialChars}
                  onCheckedChange={(checked) => updatePasswordPolicy('requireSpecialChars', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-purple-600" />
              API Security
            </CardTitle>
            <CardDescription>
              Configure API rate limiting and CORS settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="rateLimitEnabled" className="text-sm font-medium">Rate Limiting</Label>
                  <p className="text-xs text-neutral-500">Enable API rate limiting</p>
                </div>
                <Switch
                  id="rateLimitEnabled"
                  checked={settings.apiSecurity.rateLimitEnabled}
                  onCheckedChange={(checked) => updateApiSecurity('rateLimitEnabled', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxRequestsPerMinute">Max Requests/Minute</Label>
                <Input
                  id="maxRequestsPerMinute"
                  type="number"
                  value={settings.apiSecurity.maxRequestsPerMinute}
                  onChange={(e) => updateApiSecurity('maxRequestsPerMinute', parseInt(e.target.value) || 100)}
                  min="10"
                  max="1000"
                  disabled={!settings.apiSecurity.rateLimitEnabled}
                />
              </div>

              <div className="flex items-center justify-between md:col-span-2">
                <div>
                  <Label htmlFor="enableCors" className="text-sm font-medium">Enable CORS</Label>
                  <p className="text-xs text-neutral-500">Allow cross-origin requests</p>
                </div>
                <Switch
                  id="enableCors"
                  checked={settings.apiSecurity.enableCors}
                  onCheckedChange={(checked) => updateApiSecurity('enableCors', checked)}
                />
              </div>

              {settings.apiSecurity.enableCors && (
                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Allowed Origins</Label>
                    <Button variant="outline" size="sm" onClick={addAllowedOrigin}>
                      Add Origin
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {settings.apiSecurity.allowedOrigins.map((origin, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input value={origin} readOnly className="flex-1" />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => removeAllowedOrigin(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
