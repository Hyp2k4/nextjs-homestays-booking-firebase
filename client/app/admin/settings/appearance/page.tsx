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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminSettingsService, type AppearanceSettings } from "@/lib/admin-settings-service"
import { BeautifulLoader } from "@/components/ui/beautiful-loader"
import { toast } from "sonner"
import { 
  Palette, 
  Image, 
  Type, 
  Layout, 
  Save, 
  RefreshCw,
  AlertTriangle,
  Upload,
  Eye,
  Monitor,
  Sun,
  Moon
} from "lucide-react"

export default function AppearanceSettingsPage() {
  const [settings, setSettings] = useState<AppearanceSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const appearanceSettings = await AdminSettingsService.getAppearanceSettings()
        if (appearanceSettings) {
          setSettings(appearanceSettings)
        } else {
          setSettings(AdminSettingsService.getDefaultAppearanceSettings())
        }
      } catch (error) {
        console.error("Error loading appearance settings:", error)
        setSettings(AdminSettingsService.getDefaultAppearanceSettings())
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
      await AdminSettingsService.saveAppearanceSettings(settings)
      toast.success("Appearance settings saved successfully!")
    } catch (error) {
      console.error("Error saving appearance settings:", error)
      toast.error("Failed to save appearance settings")
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setSettings(AdminSettingsService.getDefaultAppearanceSettings())
    toast.info("Settings reset to defaults")
  }

  const updateBranding = (key: keyof AppearanceSettings['branding'], value: string) => {
    if (!settings) return
    setSettings({
      ...settings,
      branding: {
        ...settings.branding,
        [key]: value
      }
    })
  }

  const updateTheme = (key: keyof AppearanceSettings['theme'], value: any) => {
    if (!settings) return
    setSettings({
      ...settings,
      theme: {
        ...settings.theme,
        [key]: value
      }
    })
  }

  const updateLayout = (key: keyof AppearanceSettings['layout'], value: any) => {
    if (!settings) return
    setSettings({
      ...settings,
      layout: {
        ...settings.layout,
        [key]: value
      }
    })
  }

  const handleFileUpload = (field: 'logo' | 'favicon') => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = field === 'favicon' ? '.ico,.png' : '.png,.jpg,.jpeg,.svg'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        // In a real app, you would upload to storage and get URL
        const url = URL.createObjectURL(file)
        updateBranding(field, url)
        toast.success(`${field === 'logo' ? 'Logo' : 'Favicon'} uploaded successfully!`)
      }
    }
    input.click()
  }

  if (loading) {
    return (
      <AdminDashboardLayout title="Appearance Settings">
        <BeautifulLoader variant="dots" size="lg" text="Loading appearance settings..." />
      </AdminDashboardLayout>
    )
  }

  if (!settings) {
    return (
      <AdminDashboardLayout title="Appearance Settings">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">Failed to load settings</h3>
          <p className="text-neutral-600">Please try refreshing the page.</p>
        </div>
      </AdminDashboardLayout>
    )
  }

  return (
    <AdminDashboardLayout title="Appearance Settings">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Appearance Settings</h2>
            <p className="text-neutral-600 mt-1">Customize theme and branding</p>
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

        <Tabs defaultValue="branding" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
          </TabsList>

          {/* Branding */}
          <TabsContent value="branding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5 text-blue-600" />
                  Site Branding
                </CardTitle>
                <CardDescription>
                  Configure your site name and visual identity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.branding.siteName}
                    onChange={(e) => updateBranding('siteName', e.target.value)}
                    placeholder="Enter site name..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Logo</Label>
                      <div className="mt-2 flex items-center gap-4">
                        {settings.branding.logo ? (
                          <img 
                            src={settings.branding.logo} 
                            alt="Logo" 
                            className="h-12 w-auto object-contain border rounded"
                          />
                        ) : (
                          <div className="h-12 w-24 bg-neutral-200 rounded flex items-center justify-center">
                            <Image className="h-6 w-6 text-neutral-400" />
                          </div>
                        )}
                        <Button variant="outline" onClick={() => handleFileUpload('logo')}>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Logo
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label>Favicon</Label>
                      <div className="mt-2 flex items-center gap-4">
                        {settings.branding.favicon ? (
                          <img 
                            src={settings.branding.favicon} 
                            alt="Favicon" 
                            className="h-8 w-8 object-contain border rounded"
                          />
                        ) : (
                          <div className="h-8 w-8 bg-neutral-200 rounded flex items-center justify-center">
                            <Image className="h-4 w-4 text-neutral-400" />
                          </div>
                        )}
                        <Button variant="outline" onClick={() => handleFileUpload('favicon')}>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Favicon
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-neutral-50 rounded-lg">
                      <h4 className="font-medium mb-2">Preview</h4>
                      <div className="bg-white p-4 rounded border">
                        <div className="flex items-center gap-3">
                          {settings.branding.logo ? (
                            <img 
                              src={settings.branding.logo} 
                              alt="Logo" 
                              className="h-8 w-auto object-contain"
                            />
                          ) : (
                            <div className="h-8 w-16 bg-neutral-200 rounded"></div>
                          )}
                          <span className="font-semibold text-lg">{settings.branding.siteName}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Colors */}
          <TabsContent value="colors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-purple-600" />
                  Color Scheme
                </CardTitle>
                <CardDescription>
                  Customize your site's color palette
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={settings.branding.primaryColor}
                        onChange={(e) => updateBranding('primaryColor', e.target.value)}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={settings.branding.primaryColor}
                        onChange={(e) => updateBranding('primaryColor', e.target.value)}
                        placeholder="#3B82F6"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={settings.branding.secondaryColor}
                        onChange={(e) => updateBranding('secondaryColor', e.target.value)}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={settings.branding.secondaryColor}
                        onChange={(e) => updateBranding('secondaryColor', e.target.value)}
                        placeholder="#10B981"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accentColor">Accent Color</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="accentColor"
                        type="color"
                        value={settings.branding.accentColor}
                        onChange={(e) => updateBranding('accentColor', e.target.value)}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={settings.branding.accentColor}
                        onChange={(e) => updateBranding('accentColor', e.target.value)}
                        placeholder="#F59E0B"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-neutral-50 rounded-lg">
                  <h4 className="font-medium mb-4">Color Preview</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div 
                        className="h-16 rounded-lg mb-2"
                        style={{ backgroundColor: settings.branding.primaryColor }}
                      ></div>
                      <span className="text-sm text-neutral-600">Primary</span>
                    </div>
                    <div className="text-center">
                      <div 
                        className="h-16 rounded-lg mb-2"
                        style={{ backgroundColor: settings.branding.secondaryColor }}
                      ></div>
                      <span className="text-sm text-neutral-600">Secondary</span>
                    </div>
                    <div className="text-center">
                      <div 
                        className="h-16 rounded-lg mb-2"
                        style={{ backgroundColor: settings.branding.accentColor }}
                      ></div>
                      <span className="text-sm text-neutral-600">Accent</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Theme */}
          <TabsContent value="theme" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-green-600" />
                  Theme Settings
                </CardTitle>
                <CardDescription>
                  Configure light/dark theme preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Default Theme</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { value: 'light', label: 'Light', icon: Sun },
                      { value: 'dark', label: 'Dark', icon: Moon },
                      { value: 'auto', label: 'Auto', icon: Monitor }
                    ].map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => updateTheme('defaultTheme', value as any)}
                        className={`p-4 border rounded-lg text-center transition-colors ${
                          settings.theme.defaultTheme === value
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <Icon className="h-6 w-6 mx-auto mb-2" />
                        <span className="text-sm font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowUserThemeSwitch" className="text-sm font-medium">
                      Allow User Theme Switch
                    </Label>
                    <p className="text-xs text-neutral-500">
                      Let users choose their preferred theme
                    </p>
                  </div>
                  <Switch
                    id="allowUserThemeSwitch"
                    checked={settings.theme.allowUserThemeSwitch}
                    onCheckedChange={(checked) => updateTheme('allowUserThemeSwitch', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Layout */}
          <TabsContent value="layout" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="h-5 w-5 text-orange-600" />
                  Layout Settings
                </CardTitle>
                <CardDescription>
                  Configure layout and navigation preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Header Style</Label>
                  <Select 
                    value={settings.layout.headerStyle} 
                    onValueChange={(value: any) => updateLayout('headerStyle', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="static">Static</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sidebarCollapsed" className="text-sm font-medium">
                        Sidebar Collapsed by Default
                      </Label>
                      <p className="text-xs text-neutral-500">
                        Start with collapsed sidebar
                      </p>
                    </div>
                    <Switch
                      id="sidebarCollapsed"
                      checked={settings.layout.sidebarCollapsed}
                      onCheckedChange={(checked) => updateLayout('sidebarCollapsed', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showBreadcrumbs" className="text-sm font-medium">
                        Show Breadcrumbs
                      </Label>
                      <p className="text-xs text-neutral-500">
                        Display navigation breadcrumbs
                      </p>
                    </div>
                    <Switch
                      id="showBreadcrumbs"
                      checked={settings.layout.showBreadcrumbs}
                      onCheckedChange={(checked) => updateLayout('showBreadcrumbs', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customCSS">Custom CSS</Label>
                  <Textarea
                    id="customCSS"
                    value={settings.customCSS}
                    onChange={(e) => setSettings({ ...settings, customCSS: e.target.value })}
                    rows={8}
                    placeholder="/* Add your custom CSS here */"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-neutral-500">
                    Add custom CSS to override default styles
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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
