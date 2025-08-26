"use client"

import { useState, useEffect } from "react"
import { AdminDashboardLayout } from "@/components/admin/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminSettingsService, type LocalizationSettings } from "@/lib/admin-settings-service"
import { BeautifulLoader } from "@/components/ui/beautiful-loader"
import { toast } from "sonner"
import { 
  Globe, 
  Calendar, 
  Clock, 
  DollarSign, 
  Save, 
  RefreshCw,
  AlertTriangle,
  MapPin,
  Languages
} from "lucide-react"

export default function LocalizationSettingsPage() {
  const [settings, setSettings] = useState<LocalizationSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const localizationSettings = await AdminSettingsService.getLocalizationSettings()
        if (localizationSettings) {
          setSettings(localizationSettings)
        } else {
          setSettings(AdminSettingsService.getDefaultLocalizationSettings())
        }
      } catch (error) {
        console.error("Error loading localization settings:", error)
        setSettings(AdminSettingsService.getDefaultLocalizationSettings())
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
      await AdminSettingsService.saveLocalizationSettings(settings)
      toast.success("Localization settings saved successfully!")
    } catch (error) {
      console.error("Error saving localization settings:", error)
      toast.error("Failed to save localization settings")
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setSettings(AdminSettingsService.getDefaultLocalizationSettings())
    toast.info("Settings reset to defaults")
  }

  const updateLanguage = (index: number, field: string, value: any) => {
    if (!settings) return
    const newLanguages = [...settings.supportedLanguages]
    newLanguages[index] = { ...newLanguages[index], [field]: value }
    setSettings({
      ...settings,
      supportedLanguages: newLanguages
    })
  }

  const updateCurrency = (field: keyof LocalizationSettings['currency'], value: string) => {
    if (!settings) return
    setSettings({
      ...settings,
      currency: {
        ...settings.currency,
        [field]: value
      }
    })
  }

  const timezones = [
    "Asia/Ho_Chi_Minh",
    "Asia/Bangkok",
    "Asia/Singapore",
    "Asia/Tokyo",
    "Asia/Seoul",
    "UTC",
    "America/New_York",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris"
  ]

  const currencies = [
    { code: "VND", symbol: "₫", name: "Vietnamese Dong" },
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "British Pound" },
    { code: "JPY", symbol: "¥", name: "Japanese Yen" },
    { code: "KRW", symbol: "₩", name: "Korean Won" },
    { code: "THB", symbol: "฿", name: "Thai Baht" },
    { code: "SGD", symbol: "S$", name: "Singapore Dollar" }
  ]

  if (loading) {
    return (
      <AdminDashboardLayout title="Localization Settings">
        <BeautifulLoader variant="dots" size="lg" text="Loading localization settings..." />
      </AdminDashboardLayout>
    )
  }

  if (!settings) {
    return (
      <AdminDashboardLayout title="Localization Settings">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">Failed to load settings</h3>
          <p className="text-neutral-600">Please try refreshing the page.</p>
        </div>
      </AdminDashboardLayout>
    )
  }

  return (
    <AdminDashboardLayout title="Localization Settings">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Localization Settings</h2>
            <p className="text-neutral-600 mt-1">Configure language and regional settings</p>
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

        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5 text-blue-600" />
              Language Settings
            </CardTitle>
            <CardDescription>
              Configure supported languages and default language
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="defaultLanguage">Default Language</Label>
              <Select 
                value={settings.defaultLanguage} 
                onValueChange={(value) => setSettings({ ...settings, defaultLanguage: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {settings.supportedLanguages
                    .filter(lang => lang.enabled)
                    .map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label>Supported Languages</Label>
              <div className="space-y-3">
                {settings.supportedLanguages.map((language, index) => (
                  <div key={language.code} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl">{language.flag}</span>
                      <div>
                        <div className="font-medium">{language.name}</div>
                        <div className="text-sm text-neutral-500">{language.code.toUpperCase()}</div>
                      </div>
                    </div>
                    <Switch
                      checked={language.enabled}
                      onCheckedChange={(checked) => updateLanguage(index, 'enabled', checked)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date & Time Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Date & Time Settings
            </CardTitle>
            <CardDescription>
              Configure date format, time format, and timezone
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="dateFormat">Date Format</Label>
                <Select 
                  value={settings.dateFormat} 
                  onValueChange={(value) => setSettings({ ...settings, dateFormat: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (25/12/2024)</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12/25/2024)</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2024-12-25)</SelectItem>
                    <SelectItem value="DD-MM-YYYY">DD-MM-YYYY (25-12-2024)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeFormat">Time Format</Label>
                <Select 
                  value={settings.timeFormat} 
                  onValueChange={(value: any) => setSettings({ ...settings, timeFormat: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">24 Hour (14:30)</SelectItem>
                    <SelectItem value="12h">12 Hour (2:30 PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select 
                value={settings.timezone} 
                onValueChange={(value) => setSettings({ ...settings, timezone: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Preview</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>Date: {new Date().toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit', 
                  year: 'numeric'
                }).split('/').join(settings.dateFormat.includes('-') ? '-' : '/')}</p>
                <p>Time: {new Date().toLocaleTimeString('en-US', {
                  hour12: settings.timeFormat === '12h',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
                <p>Timezone: {settings.timezone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Currency Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              Currency Settings
            </CardTitle>
            <CardDescription>
              Configure currency display and formatting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select 
                  value={settings.currency.code} 
                  onValueChange={(value) => {
                    const selectedCurrency = currencies.find(c => c.code === value)
                    if (selectedCurrency) {
                      updateCurrency('code', selectedCurrency.code)
                      updateCurrency('symbol', selectedCurrency.symbol)
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currencyPosition">Symbol Position</Label>
                <Select 
                  value={settings.currency.position} 
                  onValueChange={(value: any) => updateCurrency('position', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="before">Before amount ({settings.currency.symbol}100)</SelectItem>
                    <SelectItem value="after">After amount (100{settings.currency.symbol})</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currencySymbol">Currency Symbol</Label>
              <Input
                id="currencySymbol"
                value={settings.currency.symbol}
                onChange={(e) => updateCurrency('symbol', e.target.value)}
                placeholder="₫"
                className="w-24"
              />
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Currency Preview</h4>
              <div className="text-sm text-purple-800 space-y-1">
                <p>Currency: {settings.currency.code}</p>
                <p>Symbol: {settings.currency.symbol}</p>
                <p>Format: {settings.currency.position === 'before' 
                  ? `${settings.currency.symbol}1,500,000` 
                  : `1,500,000${settings.currency.symbol}`
                }</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Regional Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-orange-600" />
              Regional Information
            </CardTitle>
            <CardDescription>
              Current regional settings summary
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Globe className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-sm text-blue-700">Default Language</div>
                <div className="font-semibold text-blue-900">
                  {settings.supportedLanguages.find(l => l.code === settings.defaultLanguage)?.name}
                </div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-sm text-green-700">Date Format</div>
                <div className="font-semibold text-green-900">{settings.dateFormat}</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-sm text-purple-700">Currency</div>
                <div className="font-semibold text-purple-900">
                  {settings.currency.code} ({settings.currency.symbol})
                </div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-sm text-orange-700">Timezone</div>
                <div className="font-semibold text-orange-900">
                  {settings.timezone.split('/')[1]?.replace('_', ' ')}
                </div>
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
