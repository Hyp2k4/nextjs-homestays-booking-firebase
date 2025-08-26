"use client"

import { useState, useEffect } from "react"
import { AdminDashboardLayout } from "@/components/admin/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminSettingsService, type PaymentSettings } from "@/lib/admin-settings-service"
import { BeautifulLoader } from "@/components/ui/beautiful-loader"
import { toast } from "sonner"
import { 
  CreditCard, 
  DollarSign, 
  Percent, 
  Save, 
  RefreshCw,
  AlertTriangle,
  Eye,
  EyeOff,
  Shield,
  Globe,
  Banknote
} from "lucide-react"

export default function PaymentSettingsPage() {
  const [settings, setSettings] = useState<PaymentSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSecrets, setShowSecrets] = useState({
    stripeSecret: false,
    stripeWebhook: false,
    paypalSecret: false,
    vnpaySecret: false
  })

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const paymentSettings = await AdminSettingsService.getPaymentSettings()
        if (paymentSettings) {
          setSettings(paymentSettings)
        } else {
          setSettings(AdminSettingsService.getDefaultPaymentSettings())
        }
      } catch (error) {
        console.error("Error loading payment settings:", error)
        setSettings(AdminSettingsService.getDefaultPaymentSettings())
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
      await AdminSettingsService.savePaymentSettings(settings)
      toast.success("Payment settings saved successfully!")
    } catch (error) {
      console.error("Error saving payment settings:", error)
      toast.error("Failed to save payment settings")
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setSettings(AdminSettingsService.getDefaultPaymentSettings())
    toast.info("Settings reset to defaults")
  }

  const updateGateway = (gateway: 'stripe' | 'paypal' | 'vnpay', key: string, value: any) => {
    if (!settings) return
    setSettings({
      ...settings,
      gateways: {
        ...settings.gateways,
        [gateway]: {
          ...settings.gateways[gateway],
          [key]: value
        }
      }
    })
  }

  const updateCommissions = (key: keyof PaymentSettings['commissions'], value: number) => {
    if (!settings) return
    setSettings({
      ...settings,
      commissions: {
        ...settings.commissions,
        [key]: value
      }
    })
  }

  const updatePolicies = (key: keyof PaymentSettings['policies'], value: any) => {
    if (!settings) return
    setSettings({
      ...settings,
      policies: {
        ...settings.policies,
        [key]: value
      }
    })
  }

  const toggleSecretVisibility = (key: keyof typeof showSecrets) => {
    setShowSecrets(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  if (loading) {
    return (
      <AdminDashboardLayout title="Payment Settings">
        <BeautifulLoader variant="dots" size="lg" text="Loading payment settings..." />
      </AdminDashboardLayout>
    )
  }

  if (!settings) {
    return (
      <AdminDashboardLayout title="Payment Settings">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">Failed to load settings</h3>
          <p className="text-neutral-600">Please try refreshing the page.</p>
        </div>
      </AdminDashboardLayout>
    )
  }

  return (
    <AdminDashboardLayout title="Payment Settings">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Payment Settings</h2>
            <p className="text-neutral-600 mt-1">Configure payment gateways and commission rates</p>
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

        <Tabs defaultValue="gateways" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="gateways">Payment Gateways</TabsTrigger>
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
          </TabsList>

          {/* Payment Gateways */}
          <TabsContent value="gateways" className="space-y-6">
            {/* Stripe */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  Stripe
                </CardTitle>
                <CardDescription>
                  Configure Stripe payment gateway for credit card processing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="stripeEnabled" className="text-sm font-medium">Enable Stripe</Label>
                    <p className="text-xs text-neutral-500">Accept credit card payments via Stripe</p>
                  </div>
                  <Switch
                    id="stripeEnabled"
                    checked={settings.gateways.stripe.enabled}
                    onCheckedChange={(checked) => updateGateway('stripe', 'enabled', checked)}
                  />
                </div>

                {settings.gateways.stripe.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stripePublicKey">Publishable Key</Label>
                      <Input
                        id="stripePublicKey"
                        value={settings.gateways.stripe.publicKey}
                        onChange={(e) => updateGateway('stripe', 'publicKey', e.target.value)}
                        placeholder="pk_test_..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stripeSecretKey">Secret Key</Label>
                      <div className="relative">
                        <Input
                          id="stripeSecretKey"
                          type={showSecrets.stripeSecret ? "text" : "password"}
                          value={settings.gateways.stripe.secretKey}
                          onChange={(e) => updateGateway('stripe', 'secretKey', e.target.value)}
                          placeholder="sk_test_..."
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                          onClick={() => toggleSecretVisibility('stripeSecret')}
                        >
                          {showSecrets.stripeSecret ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="stripeWebhookSecret">Webhook Secret</Label>
                      <div className="relative">
                        <Input
                          id="stripeWebhookSecret"
                          type={showSecrets.stripeWebhook ? "text" : "password"}
                          value={settings.gateways.stripe.webhookSecret}
                          onChange={(e) => updateGateway('stripe', 'webhookSecret', e.target.value)}
                          placeholder="whsec_..."
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                          onClick={() => toggleSecretVisibility('stripeWebhook')}
                        >
                          {showSecrets.stripeWebhook ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* PayPal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-500" />
                  PayPal
                </CardTitle>
                <CardDescription>
                  Configure PayPal payment gateway
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="paypalEnabled" className="text-sm font-medium">Enable PayPal</Label>
                    <p className="text-xs text-neutral-500">Accept payments via PayPal</p>
                  </div>
                  <Switch
                    id="paypalEnabled"
                    checked={settings.gateways.paypal.enabled}
                    onCheckedChange={(checked) => updateGateway('paypal', 'enabled', checked)}
                  />
                </div>

                {settings.gateways.paypal.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="paypalClientId">Client ID</Label>
                      <Input
                        id="paypalClientId"
                        value={settings.gateways.paypal.clientId}
                        onChange={(e) => updateGateway('paypal', 'clientId', e.target.value)}
                        placeholder="AYSq3RDGsmBLJE-otTkBtM-jBRd1TCQwFf9RGfwddNXWz0uFU9ztymylOhRS"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="paypalClientSecret">Client Secret</Label>
                      <div className="relative">
                        <Input
                          id="paypalClientSecret"
                          type={showSecrets.paypalSecret ? "text" : "password"}
                          value={settings.gateways.paypal.clientSecret}
                          onChange={(e) => updateGateway('paypal', 'clientSecret', e.target.value)}
                          placeholder="EGnHDxD_qRPdaLdZz8iCr8N7_MzF-YHPTkjs6NKYQvQSBngp4PTTVWkPZRbL"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                          onClick={() => toggleSecretVisibility('paypalSecret')}
                        >
                          {showSecrets.paypalSecret ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:col-span-2">
                      <div>
                        <Label htmlFor="paypalSandbox" className="text-sm font-medium">Sandbox Mode</Label>
                        <p className="text-xs text-neutral-500">Use PayPal sandbox for testing</p>
                      </div>
                      <Switch
                        id="paypalSandbox"
                        checked={settings.gateways.paypal.sandbox}
                        onCheckedChange={(checked) => updateGateway('paypal', 'sandbox', checked)}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* VNPay */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="h-5 w-5 text-red-600" />
                  VNPay
                </CardTitle>
                <CardDescription>
                  Configure VNPay payment gateway for Vietnamese market
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="vnpayEnabled" className="text-sm font-medium">Enable VNPay</Label>
                    <p className="text-xs text-neutral-500">Accept payments via VNPay</p>
                  </div>
                  <Switch
                    id="vnpayEnabled"
                    checked={settings.gateways.vnpay.enabled}
                    onCheckedChange={(checked) => updateGateway('vnpay', 'enabled', checked)}
                  />
                </div>

                {settings.gateways.vnpay.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vnpayMerchantId">Merchant ID</Label>
                      <Input
                        id="vnpayMerchantId"
                        value={settings.gateways.vnpay.merchantId}
                        onChange={(e) => updateGateway('vnpay', 'merchantId', e.target.value)}
                        placeholder="VNPAY_MERCHANT_ID"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vnpaySecretKey">Secret Key</Label>
                      <div className="relative">
                        <Input
                          id="vnpaySecretKey"
                          type={showSecrets.vnpaySecret ? "text" : "password"}
                          value={settings.gateways.vnpay.secretKey}
                          onChange={(e) => updateGateway('vnpay', 'secretKey', e.target.value)}
                          placeholder="VNPAY_SECRET_KEY"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                          onClick={() => toggleSecretVisibility('vnpaySecret')}
                        >
                          {showSecrets.vnpaySecret ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="vnpayReturnUrl">Return URL</Label>
                      <Input
                        id="vnpayReturnUrl"
                        value={settings.gateways.vnpay.returnUrl}
                        onChange={(e) => updateGateway('vnpay', 'returnUrl', e.target.value)}
                        placeholder="https://yourdomain.com/payment/vnpay/return"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commissions */}
          <TabsContent value="commissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="h-5 w-5 text-green-600" />
                  Commission Structure
                </CardTitle>
                <CardDescription>
                  Configure commission rates and fees
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="hostCommission">Host Commission (%)</Label>
                    <Input
                      id="hostCommission"
                      type="number"
                      value={settings.commissions.hostCommission}
                      onChange={(e) => updateCommissions('hostCommission', parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <p className="text-xs text-neutral-500">Percentage host receives from bookings</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="platformFee">Platform Fee (%)</Label>
                    <Input
                      id="platformFee"
                      type="number"
                      value={settings.commissions.platformFee}
                      onChange={(e) => updateCommissions('platformFee', parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <p className="text-xs text-neutral-500">Platform commission from bookings</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentProcessingFee">Payment Processing Fee (%)</Label>
                    <Input
                      id="paymentProcessingFee"
                      type="number"
                      value={settings.commissions.paymentProcessingFee}
                      onChange={(e) => updateCommissions('paymentProcessingFee', parseFloat(e.target.value) || 0)}
                      min="0"
                      max="10"
                      step="0.1"
                    />
                    <p className="text-xs text-neutral-500">Payment gateway processing fee</p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Commission Breakdown</h4>
                  <div className="text-sm text-blue-800">
                    <p>Host receives: {settings.commissions.hostCommission}%</p>
                    <p>Platform fee: {settings.commissions.platformFee}%</p>
                    <p>Payment processing: {settings.commissions.paymentProcessingFee}%</p>
                    <p className="font-medium mt-2">
                      Total: {settings.commissions.hostCommission + settings.commissions.platformFee + settings.commissions.paymentProcessingFee}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Policies */}
          <TabsContent value="policies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  Payment Policies
                </CardTitle>
                <CardDescription>
                  Configure refund and cancellation policies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="refundPolicy">Refund Policy</Label>
                  <Textarea
                    id="refundPolicy"
                    value={settings.policies.refundPolicy}
                    onChange={(e) => updatePolicies('refundPolicy', e.target.value)}
                    rows={4}
                    placeholder="Describe your refund policy..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="cancellationFee">Cancellation Fee (%)</Label>
                    <Input
                      id="cancellationFee"
                      type="number"
                      value={settings.policies.cancellationFee}
                      onChange={(e) => updatePolicies('cancellationFee', parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <p className="text-xs text-neutral-500">Fee charged for cancellations</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lateCancellationHours">Late Cancellation (hours)</Label>
                    <Input
                      id="lateCancellationHours"
                      type="number"
                      value={settings.policies.lateCancellationHours}
                      onChange={(e) => updatePolicies('lateCancellationHours', parseInt(e.target.value) || 0)}
                      min="0"
                      max="168"
                    />
                    <p className="text-xs text-neutral-500">Hours before check-in for free cancellation</p>
                  </div>
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
