import { AdminSettingsService, type EmailTemplate } from "@/lib/admin-settings-service"
import { GlobalSettingsService } from "@/lib/global-settings-service"
import { I18nService, type Language } from "@/lib/i18n"

export interface EmailData {
  to: string
  templateId: string
  variables: Record<string, string>
  language?: Language
}

export class EmailService {
  // Send email using template
  static async sendTemplateEmail(emailData: EmailData): Promise<boolean> {
    try {
      // Get email templates
      const templates = await AdminSettingsService.getEmailTemplates()
      let template = templates.find(t => t.id === emailData.templateId)

      if (!template || !template.isActive) {
        console.error(`Template ${emailData.templateId} not found or inactive`)
        return false
      }

      // If language is specified and different from default, try to get localized template
      if (emailData.language && emailData.language !== 'en') {
        const localizedTemplate = templates.find(t => t.id === `${emailData.templateId}_${emailData.language}`)
        if (localizedTemplate && localizedTemplate.isActive) {
          template = localizedTemplate
        }
      }

      // Process template with variables
      const processedEmail = this.processTemplate(template, emailData.variables)
      
      // Send email via API
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: emailData.to,
          subject: processedEmail.subject,
          html: processedEmail.htmlContent,
          text: processedEmail.textContent
        })
      })

      return response.ok
    } catch (error) {
      console.error('Error sending template email:', error)
      return false
    }
  }

  // Process template with variables
  private static processTemplate(template: EmailTemplate, variables: Record<string, string>) {
    // Add global variables
    const globalVars = {
      siteName: GlobalSettingsService.getSiteName(),
      siteUrl: typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com',
      currentYear: new Date().getFullYear().toString(),
      ...variables
    }

    // Replace variables in subject
    let subject = template.subject
    Object.entries(globalVars).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      subject = subject.replace(regex, value)
    })

    // Replace variables in HTML content
    let htmlContent = template.htmlContent
    Object.entries(globalVars).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      htmlContent = htmlContent.replace(regex, value)
    })

    // Replace variables in text content
    let textContent = template.textContent
    Object.entries(globalVars).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      textContent = textContent.replace(regex, value)
    })

    return {
      subject,
      htmlContent,
      textContent
    }
  }

  // Send welcome email
  static async sendWelcomeEmail(userEmail: string, userName: string, language?: Language): Promise<boolean> {
    return this.sendTemplateEmail({
      to: userEmail,
      templateId: 'welcome',
      variables: {
        userName,
        userEmail
      },
      language
    })
  }

  // Send booking confirmation email
  static async sendBookingConfirmationEmail(
    guestEmail: string,
    bookingData: {
      guestName: string
      homestayName: string
      checkInDate: string
      checkOutDate: string
      guestCount: string
      totalAmount: string
      bookingId: string
      hostName: string
      hostPhone: string
      hostEmail: string
      hostId: string
    },
    language?: Language
  ): Promise<boolean> {
    return this.sendTemplateEmail({
      to: guestEmail,
      templateId: 'booking_confirmation',
      variables: bookingData,
      language
    })
  }

  // Send review reminder email
  static async sendReviewReminderEmail(
    guestEmail: string,
    reminderData: {
      guestName: string
      homestayName: string
      checkInDate: string
      checkOutDate: string
      reviewUrl: string
    },
    language?: Language
  ): Promise<boolean> {
    return this.sendTemplateEmail({
      to: guestEmail,
      templateId: 'review_reminder',
      variables: reminderData,
      language
    })
  }

  // Send custom email
  static async sendCustomEmail(
    to: string,
    subject: string,
    htmlContent: string,
    textContent?: string
  ): Promise<boolean> {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject,
          html: htmlContent,
          text: textContent || this.htmlToText(htmlContent)
        })
      })

      return response.ok
    } catch (error) {
      console.error('Error sending custom email:', error)
      return false
    }
  }

  // Convert HTML to plain text (basic implementation)
  private static htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
      .replace(/&amp;/g, '&') // Replace &amp; with &
      .replace(/&lt;/g, '<') // Replace &lt; with <
      .replace(/&gt;/g, '>') // Replace &gt; with >
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim()
  }

  // Test email template
  static async testEmailTemplate(templateId: string, testEmail: string): Promise<boolean> {
    const testVariables: Record<string, string> = {
      userName: "John Doe",
      userEmail: testEmail,
      guestName: "John Doe",
      homestayName: "Cozy Mountain Cabin",
      checkInDate: "March 15, 2024",
      checkOutDate: "March 18, 2024",
      guestCount: "2",
      totalAmount: "1,500,000₫",
      bookingId: "BK123456",
      hostName: "Jane Smith",
      hostPhone: "+84 123 456 789",
      hostEmail: "jane@example.com",
      hostId: "host123",
      reviewUrl: `${typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com'}/reviews/new`
    }

    return this.sendTemplateEmail({
      to: testEmail,
      templateId,
      variables: testVariables
    })
  }

  // Get email template preview
  static async getTemplatePreview(templateId: string): Promise<{ subject: string; htmlContent: string; textContent: string } | null> {
    try {
      const templates = await AdminSettingsService.getEmailTemplates()
      const template = templates.find(t => t.id === templateId)
      
      if (!template) return null

      const previewVariables: Record<string, string> = {
        userName: "John Doe",
        userEmail: "john@example.com",
        guestName: "John Doe",
        homestayName: "Cozy Mountain Cabin",
        checkInDate: "March 15, 2024",
        checkOutDate: "March 18, 2024",
        guestCount: "2",
        totalAmount: "1,500,000₫",
        bookingId: "BK123456",
        hostName: "Jane Smith",
        hostPhone: "+84 123 456 789",
        hostEmail: "jane@example.com",
        hostId: "host123",
        reviewUrl: "#"
      }

      return this.processTemplate(template, previewVariables)
    } catch (error) {
      console.error('Error getting template preview:', error)
      return null
    }
  }
}
