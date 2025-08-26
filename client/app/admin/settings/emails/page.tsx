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
import { Badge } from "@/components/ui/badge"
import { AdminSettingsService, type EmailTemplate } from "@/lib/admin-settings-service"
import { BeautifulLoader } from "@/components/ui/beautiful-loader"
import { toast } from "sonner"
import { 
  Mail, 
  Edit, 
  Eye, 
  Save, 
  RefreshCw,
  AlertTriangle,
  Code,
  FileText,
  Send,
  Plus
} from "lucide-react"

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState<"html" | "text">("html")

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const emailTemplates = await AdminSettingsService.getEmailTemplates()
        setTemplates(emailTemplates)
        if (emailTemplates.length > 0) {
          setSelectedTemplate(emailTemplates[0])
        }
      } catch (error) {
        console.error("Error loading email templates:", error)
        const defaultTemplates = AdminSettingsService.getDefaultEmailTemplates()
        setTemplates(defaultTemplates)
        if (defaultTemplates.length > 0) {
          setSelectedTemplate(defaultTemplates[0])
        }
      } finally {
        setLoading(false)
      }
    }

    loadTemplates()
  }, [])

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return

    setSaving(true)
    try {
      await AdminSettingsService.saveEmailTemplate(selectedTemplate)
      
      // Update local state
      setTemplates(prev => 
        prev.map(t => t.id === selectedTemplate.id ? selectedTemplate : t)
      )
      
      toast.success("Email template saved successfully!")
    } catch (error) {
      console.error("Error saving email template:", error)
      toast.error("Failed to save email template")
    } finally {
      setSaving(false)
    }
  }

  const handleTemplateChange = (field: keyof EmailTemplate, value: any) => {
    if (!selectedTemplate) return
    setSelectedTemplate({
      ...selectedTemplate,
      [field]: value
    })
  }

  const renderPreview = () => {
    if (!selectedTemplate) return null

    const content = previewMode === "html" ? selectedTemplate.htmlContent : selectedTemplate.textContent
    
    // Simple variable replacement for preview
    const previewContent = content
      .replace(/\{\{siteName\}\}/g, "Homestay Booking")
      .replace(/\{\{userName\}\}/g, "John Doe")
      .replace(/\{\{guestName\}\}/g, "John Doe")
      .replace(/\{\{homestayName\}\}/g, "Cozy Mountain Cabin")
      .replace(/\{\{checkInDate\}\}/g, "2024-03-15")
      .replace(/\{\{checkOutDate\}\}/g, "2024-03-18")
      .replace(/\{\{guestCount\}\}/g, "2")
      .replace(/\{\{totalAmount\}\}/g, "1,500,000₫")
      .replace(/\{\{reviewUrl\}\}/g, "#")

    return (
      <div className="border rounded-lg p-4 bg-white">
        {previewMode === "html" ? (
          <div dangerouslySetInnerHTML={{ __html: previewContent }} />
        ) : (
          <pre className="whitespace-pre-wrap text-sm">{previewContent}</pre>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <AdminDashboardLayout title="Email Templates">
        <BeautifulLoader variant="dots" size="lg" text="Loading email templates..." />
      </AdminDashboardLayout>
    )
  }

  return (
    <AdminDashboardLayout title="Email Templates">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Email Templates</h2>
            <p className="text-neutral-600 mt-1">Customize email templates and content</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
            <Button onClick={handleSaveTemplate} disabled={saving || !selectedTemplate}>
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Template List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Templates</CardTitle>
                <CardDescription>Select a template to edit</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`w-full text-left p-4 hover:bg-neutral-50 transition-colors border-l-4 ${
                        selectedTemplate?.id === template.id
                          ? "border-l-primary-500 bg-primary-50"
                          : "border-l-transparent"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-sm">{template.name}</h4>
                          <p className="text-xs text-neutral-500 mt-1">{template.subject}</p>
                        </div>
                        <Badge variant={template.isActive ? "default" : "secondary"}>
                          {template.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Template Editor */}
          <div className="lg:col-span-3">
            {selectedTemplate ? (
              <Tabs defaultValue="edit" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="edit">Edit Template</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>

                <TabsContent value="edit" className="space-y-6">
                  {/* Basic Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Edit className="h-5 w-5 text-blue-600" />
                        Template Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="templateName">Template Name</Label>
                          <Input
                            id="templateName"
                            value={selectedTemplate.name}
                            onChange={(e) => handleTemplateChange('name', e.target.value)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="templateActive" className="text-sm font-medium">Active</Label>
                            <p className="text-xs text-neutral-500">Enable this template</p>
                          </div>
                          <Switch
                            id="templateActive"
                            checked={selectedTemplate.isActive}
                            onCheckedChange={(checked) => handleTemplateChange('isActive', checked)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="templateSubject">Email Subject</Label>
                        <Input
                          id="templateSubject"
                          value={selectedTemplate.subject}
                          onChange={(e) => handleTemplateChange('subject', e.target.value)}
                          placeholder="Enter email subject..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Available Variables</Label>
                        <div className="flex flex-wrap gap-2">
                          {selectedTemplate.variables.map((variable) => (
                            <Badge key={variable} variant="outline" className="text-xs">
                              {`{{${variable}}}`}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* HTML Content */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Code className="h-5 w-5 text-green-600" />
                        HTML Content
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={selectedTemplate.htmlContent}
                        onChange={(e) => handleTemplateChange('htmlContent', e.target.value)}
                        rows={12}
                        className="font-mono text-sm"
                        placeholder="Enter HTML content..."
                      />
                    </CardContent>
                  </Card>

                  {/* Text Content */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-orange-600" />
                        Plain Text Content
                      </CardTitle>
                      <CardDescription>
                        Fallback content for email clients that don't support HTML
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={selectedTemplate.textContent}
                        onChange={(e) => handleTemplateChange('textContent', e.target.value)}
                        rows={6}
                        placeholder="Enter plain text content..."
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="preview" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-purple-600" />
                        Email Preview
                      </CardTitle>
                      <CardDescription>
                        Preview how the email will look to recipients
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Label>Preview Mode:</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            variant={previewMode === "html" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPreviewMode("html")}
                          >
                            HTML
                          </Button>
                          <Button
                            variant={previewMode === "text" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPreviewMode("text")}
                          >
                            Text
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 bg-neutral-50 rounded-lg">
                          <div className="text-sm text-neutral-600 mb-2">Subject:</div>
                          <div className="font-medium">
                            {selectedTemplate.subject
                              .replace(/\{\{siteName\}\}/g, "Homestay Booking")
                              .replace(/\{\{homestayName\}\}/g, "Cozy Mountain Cabin")
                            }
                          </div>
                        </div>

                        {renderPreview()}
                      </div>

                      <div className="flex justify-end">
                        <Button variant="outline">
                          <Send className="h-4 w-4 mr-2" />
                          Send Test Email
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Mail className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Template Selected</h3>
                  <p className="text-neutral-600">Select a template from the list to start editing.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  )
}
