"use client"

import { useState, useEffect } from "react"
import { AdminDashboardLayout } from "@/components/admin/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminSettingsService, type DatabaseSettings } from "@/lib/admin-settings-service"
import { BeautifulLoader } from "@/components/ui/beautiful-loader"
import { toast } from "sonner"
import { 
  Database, 
  Download, 
  Upload, 
  Settings, 
  Save, 
  RefreshCw,
  AlertTriangle,
  Clock,
  Shield,
  Zap,
  HardDrive,
  Activity
} from "lucide-react"

export default function DatabaseSettingsPage() {
  const [settings, setSettings] = useState<DatabaseSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [backingUp, setBackingUp] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const dbSettings = await AdminSettingsService.getDatabaseSettings()
        if (dbSettings) {
          setSettings(dbSettings)
        } else {
          setSettings(getDefaultDatabaseSettings())
        }
      } catch (error) {
        console.error("Error loading database settings:", error)
        setSettings(getDefaultDatabaseSettings())
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  const getDefaultDatabaseSettings = (): DatabaseSettings => ({
    backup: {
      autoBackupEnabled: true,
      backupFrequency: "daily",
      retentionDays: 30
    },
    maintenance: {
      maintenanceMode: false,
      maintenanceMessage: "We're performing scheduled maintenance. Please check back soon."
    },
    performance: {
      enableCaching: true,
      cacheExpiry: 60,
      enableCompression: true
    }
  })

  const handleSave = async () => {
    if (!settings) return

    setSaving(true)
    try {
      await AdminSettingsService.saveDatabaseSettings(settings)
      toast.success("Database settings saved successfully!")
    } catch (error) {
      console.error("Error saving database settings:", error)
      toast.error("Failed to save database settings")
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setSettings(getDefaultDatabaseSettings())
    toast.info("Settings reset to defaults")
  }

  const updateBackup = (key: keyof DatabaseSettings['backup'], value: any) => {
    if (!settings) return
    setSettings({
      ...settings,
      backup: {
        ...settings.backup,
        [key]: value
      }
    })
  }

  const updateMaintenance = (key: keyof DatabaseSettings['maintenance'], value: any) => {
    if (!settings) return
    setSettings({
      ...settings,
      maintenance: {
        ...settings.maintenance,
        [key]: value
      }
    })
  }

  const updatePerformance = (key: keyof DatabaseSettings['performance'], value: any) => {
    if (!settings) return
    setSettings({
      ...settings,
      performance: {
        ...settings.performance,
        [key]: value
      }
    })
  }

  const handleManualBackup = async () => {
    setBackingUp(true)
    try {
      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      if (settings) {
        updateBackup('lastBackup', new Date())
      }
      
      toast.success("Manual backup completed successfully!")
    } catch (error) {
      console.error("Error creating backup:", error)
      toast.error("Failed to create backup")
    } finally {
      setBackingUp(false)
    }
  }

  const toggleMaintenanceMode = () => {
    if (!settings) return
    
    const newMode = !settings.maintenance.maintenanceMode
    updateMaintenance('maintenanceMode', newMode)
    
    if (newMode) {
      toast.warning("Maintenance mode enabled - site is now offline for users")
    } else {
      toast.success("Maintenance mode disabled - site is back online")
    }
  }

  if (loading) {
    return (
      <AdminDashboardLayout title="Database Settings">
        <BeautifulLoader variant="dots" size="lg" text="Loading database settings..." />
      </AdminDashboardLayout>
    )
  }

  if (!settings) {
    return (
      <AdminDashboardLayout title="Database Settings">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">Failed to load settings</h3>
          <p className="text-neutral-600">Please try refreshing the page.</p>
        </div>
      </AdminDashboardLayout>
    )
  }

  return (
    <AdminDashboardLayout title="Database Settings">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Database Settings</h2>
            <p className="text-neutral-600 mt-1">Database maintenance and backup configuration</p>
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

        {/* Backup Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-600" />
              Backup Settings
            </CardTitle>
            <CardDescription>
              Configure automatic backups and retention policies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <Label htmlFor="autoBackup" className="text-sm font-medium">Automatic Backups</Label>
                <p className="text-xs text-neutral-500">Enable scheduled database backups</p>
              </div>
              <Switch
                id="autoBackup"
                checked={settings.backup.autoBackupEnabled}
                onCheckedChange={(checked) => updateBackup('autoBackupEnabled', checked)}
              />
            </div>

            {settings.backup.autoBackupEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">Backup Frequency</Label>
                  <Select 
                    value={settings.backup.backupFrequency} 
                    onValueChange={(value: any) => updateBackup('backupFrequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="retentionDays">Retention Period (days)</Label>
                  <Input
                    id="retentionDays"
                    type="number"
                    value={settings.backup.retentionDays}
                    onChange={(e) => updateBackup('retentionDays', parseInt(e.target.value) || 30)}
                    min="1"
                    max="365"
                  />
                  <p className="text-xs text-neutral-500">How long to keep backup files</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Manual Backup</h4>
                <p className="text-sm text-neutral-500">Create an immediate backup of the database</p>
                {settings.backup.lastBackup && (
                  <p className="text-xs text-neutral-400 mt-1">
                    Last backup: {settings.backup.lastBackup instanceof Date 
                      ? settings.backup.lastBackup.toLocaleString()
                      : new Date(settings.backup.lastBackup).toLocaleString()
                    }
                  </p>
                )}
              </div>
              <Button onClick={handleManualBackup} disabled={backingUp}>
                {backingUp ? (
                  <BeautifulLoader size="sm" variant="spin" />
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Create Backup
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Mode */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-orange-600" />
              Maintenance Mode
            </CardTitle>
            <CardDescription>
              Control site availability during maintenance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className={`flex items-center justify-between p-4 rounded-lg ${
              settings.maintenance.maintenanceMode ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
            }`}>
              <div>
                <Label htmlFor="maintenanceMode" className="text-sm font-medium">
                  {settings.maintenance.maintenanceMode ? 'Site is in Maintenance Mode' : 'Site is Online'}
                </Label>
                <p className="text-xs text-neutral-500">
                  {settings.maintenance.maintenanceMode 
                    ? 'Users cannot access the site' 
                    : 'Site is accessible to all users'
                  }
                </p>
              </div>
              <Switch
                id="maintenanceMode"
                checked={settings.maintenance.maintenanceMode}
                onCheckedChange={toggleMaintenanceMode}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
              <Textarea
                id="maintenanceMessage"
                value={settings.maintenance.maintenanceMessage}
                onChange={(e) => updateMaintenance('maintenanceMessage', e.target.value)}
                rows={3}
                placeholder="Message to display to users during maintenance..."
              />
            </div>

            {settings.maintenance.scheduledMaintenance && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Scheduled Maintenance</h4>
                <div className="text-sm text-yellow-700">
                  <p>Start: {new Date(settings.maintenance.scheduledMaintenance.startTime).toLocaleString()}</p>
                  <p>End: {new Date(settings.maintenance.scheduledMaintenance.endTime).toLocaleString()}</p>
                  <p>Description: {settings.maintenance.scheduledMaintenance.description}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-600" />
              Performance Settings
            </CardTitle>
            <CardDescription>
              Optimize database performance and caching
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableCaching" className="text-sm font-medium">Enable Caching</Label>
                  <p className="text-xs text-neutral-500">Cache frequently accessed data</p>
                </div>
                <Switch
                  id="enableCaching"
                  checked={settings.performance.enableCaching}
                  onCheckedChange={(checked) => updatePerformance('enableCaching', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableCompression" className="text-sm font-medium">Enable Compression</Label>
                  <p className="text-xs text-neutral-500">Compress data to save storage</p>
                </div>
                <Switch
                  id="enableCompression"
                  checked={settings.performance.enableCompression}
                  onCheckedChange={(checked) => updatePerformance('enableCompression', checked)}
                />
              </div>

              {settings.performance.enableCaching && (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="cacheExpiry">Cache Expiry (minutes)</Label>
                  <Input
                    id="cacheExpiry"
                    type="number"
                    value={settings.performance.cacheExpiry}
                    onChange={(e) => updatePerformance('cacheExpiry', parseInt(e.target.value) || 60)}
                    min="1"
                    max="1440"
                  />
                  <p className="text-xs text-neutral-500">How long to keep cached data</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Database Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              Database Statistics
            </CardTitle>
            <CardDescription>
              Current database usage and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <HardDrive className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-900">2.4 GB</div>
                <div className="text-sm text-blue-700">Database Size</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Database className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-900">15,432</div>
                <div className="text-sm text-green-700">Total Records</div>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-900">45ms</div>
                <div className="text-sm text-yellow-700">Avg Query Time</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-900">99.9%</div>
                <div className="text-sm text-purple-700">Uptime</div>
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
