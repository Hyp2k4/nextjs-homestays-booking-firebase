import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  Timestamp,
  type Unsubscribe 
} from "firebase/firestore"
import { db } from "@/lib/firebase/config"

// Settings interfaces
export interface NotificationSettings {
  emailNotifications: {
    newBookings: boolean
    newReviews: boolean
    newUsers: boolean
    paymentAlerts: boolean
    systemAlerts: boolean
  }
  pushNotifications: {
    enabled: boolean
    newBookings: boolean
    urgentAlerts: boolean
  }
  emailTemplates: {
    welcomeEmail: boolean
    bookingConfirmation: boolean
    reviewReminder: boolean
  }
}

export interface SecuritySettings {
  authentication: {
    requireEmailVerification: boolean
    enableTwoFactor: boolean
    sessionTimeout: number // minutes
    maxLoginAttempts: number
    lockoutDuration: number // minutes
  }
  passwordPolicy: {
    minLength: number
    requireUppercase: boolean
    requireLowercase: boolean
    requireNumbers: boolean
    requireSpecialChars: boolean
    passwordExpiry: number // days, 0 = never
  }
  apiSecurity: {
    rateLimitEnabled: boolean
    maxRequestsPerMinute: number
    enableCors: boolean
    allowedOrigins: string[]
  }
}

export interface PaymentSettings {
  gateways: {
    stripe: {
      enabled: boolean
      publicKey: string
      secretKey: string
      webhookSecret: string
    }
    paypal: {
      enabled: boolean
      clientId: string
      clientSecret: string
      sandbox: boolean
    }
    vnpay: {
      enabled: boolean
      merchantId: string
      secretKey: string
      returnUrl: string
    }
  }
  commissions: {
    hostCommission: number // percentage
    platformFee: number // percentage
    paymentProcessingFee: number // percentage
  }
  policies: {
    refundPolicy: string
    cancellationFee: number // percentage
    lateCancellationHours: number
  }
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  htmlContent: string
  textContent: string
  variables: string[] // Available template variables
  isActive: boolean
  lastModified: Timestamp | Date
}

export interface DatabaseSettings {
  backup: {
    autoBackupEnabled: boolean
    backupFrequency: "daily" | "weekly" | "monthly"
    retentionDays: number
    lastBackup?: Timestamp | Date
  }
  maintenance: {
    maintenanceMode: boolean
    maintenanceMessage: string
    scheduledMaintenance?: {
      startTime: Timestamp | Date
      endTime: Timestamp | Date
      description: string
    }
  }
  performance: {
    enableCaching: boolean
    cacheExpiry: number // minutes
    enableCompression: boolean
  }
}

export interface AppearanceSettings {
  branding: {
    siteName: string
    logo: string
    favicon: string
    primaryColor: string
    secondaryColor: string
    accentColor: string
  }
  theme: {
    defaultTheme: "light" | "dark" | "auto"
    allowUserThemeSwitch: boolean
  }
  layout: {
    headerStyle: "fixed" | "static"
    sidebarCollapsed: boolean
    showBreadcrumbs: boolean
  }
  customCSS: string
}

export interface LocalizationSettings {
  defaultLanguage: string
  supportedLanguages: {
    code: string
    name: string
    flag: string
    enabled: boolean
  }[]
  dateFormat: string
  timeFormat: "12h" | "24h"
  currency: {
    code: string
    symbol: string
    position: "before" | "after"
  }
  timezone: string
}

export class AdminSettingsService {
  // Generic method to get any settings
  static async getSettings<T>(settingsType: string): Promise<T | null> {
    try {
      const docRef = doc(db, "settings", settingsType)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return docSnap.data() as T
      }
      return null
    } catch (error) {
      console.error(`Error getting ${settingsType} settings:`, error)
      throw error
    }
  }

  // Generic method to save any settings
  static async saveSettings<T>(settingsType: string, settings: T): Promise<void> {
    try {
      const docRef = doc(db, "settings", settingsType)
      await setDoc(docRef, {
        ...settings,
        lastUpdated: Timestamp.now()
      }, { merge: true })
    } catch (error) {
      console.error(`Error saving ${settingsType} settings:`, error)
      throw error
    }
  }

  // Generic method to subscribe to settings changes
  static subscribeToSettings<T>(
    settingsType: string, 
    callback: (settings: T | null) => void
  ): Unsubscribe {
    const docRef = doc(db, "settings", settingsType)
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data() as T)
      } else {
        callback(null)
      }
    })
  }

  // Specific methods for each settings type
  static async getNotificationSettings(): Promise<NotificationSettings | null> {
    return this.getSettings<NotificationSettings>("notifications")
  }

  static async saveNotificationSettings(settings: NotificationSettings): Promise<void> {
    return this.saveSettings("notifications", settings)
  }

  static subscribeToNotificationSettings(callback: (settings: NotificationSettings | null) => void): Unsubscribe {
    return this.subscribeToSettings("notifications", callback)
  }

  static async getSecuritySettings(): Promise<SecuritySettings | null> {
    return this.getSettings<SecuritySettings>("security")
  }

  static async saveSecuritySettings(settings: SecuritySettings): Promise<void> {
    return this.saveSettings("security", settings)
  }

  static async getPaymentSettings(): Promise<PaymentSettings | null> {
    return this.getSettings<PaymentSettings>("payments")
  }

  static async savePaymentSettings(settings: PaymentSettings): Promise<void> {
    return this.saveSettings("payments", settings)
  }

  static async getDatabaseSettings(): Promise<DatabaseSettings | null> {
    return this.getSettings<DatabaseSettings>("database")
  }

  static async saveDatabaseSettings(settings: DatabaseSettings): Promise<void> {
    return this.saveSettings("database", settings)
  }

  static async getAppearanceSettings(): Promise<AppearanceSettings | null> {
    return this.getSettings<AppearanceSettings>("appearance")
  }

  static async saveAppearanceSettings(settings: AppearanceSettings): Promise<void> {
    return this.saveSettings("appearance", settings)
  }

  static async getLocalizationSettings(): Promise<LocalizationSettings | null> {
    return this.getSettings<LocalizationSettings>("localization")
  }

  static async saveLocalizationSettings(settings: LocalizationSettings): Promise<void> {
    return this.saveSettings("localization", settings)
  }

  // Default settings generators
  static getDefaultNotificationSettings(): NotificationSettings {
    return {
      emailNotifications: {
        newBookings: true,
        newReviews: true,
        newUsers: true,
        paymentAlerts: true,
        systemAlerts: true
      },
      pushNotifications: {
        enabled: true,
        newBookings: true,
        urgentAlerts: true
      },
      emailTemplates: {
        welcomeEmail: true,
        bookingConfirmation: true,
        reviewReminder: true
      }
    }
  }

  static getDefaultSecuritySettings(): SecuritySettings {
    return {
      authentication: {
        requireEmailVerification: true,
        enableTwoFactor: false,
        sessionTimeout: 480, // 8 hours
        maxLoginAttempts: 5,
        lockoutDuration: 30
      },
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: false,
        passwordExpiry: 0
      },
      apiSecurity: {
        rateLimitEnabled: true,
        maxRequestsPerMinute: 100,
        enableCors: true,
        allowedOrigins: ["http://localhost:3000", "http://localhost:3001"]
      }
    }
  }

  static getDefaultPaymentSettings(): PaymentSettings {
    return {
      gateways: {
        stripe: {
          enabled: false,
          publicKey: "",
          secretKey: "",
          webhookSecret: ""
        },
        paypal: {
          enabled: false,
          clientId: "",
          clientSecret: "",
          sandbox: true
        },
        vnpay: {
          enabled: false,
          merchantId: "",
          secretKey: "",
          returnUrl: ""
        }
      },
      commissions: {
        hostCommission: 85, // Host gets 85%
        platformFee: 15, // Platform takes 15%
        paymentProcessingFee: 2.9 // Payment processor fee
      },
      policies: {
        refundPolicy: "Refunds are processed according to the cancellation policy.",
        cancellationFee: 10, // 10% cancellation fee
        lateCancellationHours: 24 // Must cancel 24 hours before
      }
    }
  }

  static getDefaultAppearanceSettings(): AppearanceSettings {
    return {
      branding: {
        siteName: "Homestay Booking",
        logo: "",
        favicon: "",
        primaryColor: "#3B82F6",
        secondaryColor: "#10B981",
        accentColor: "#F59E0B"
      },
      theme: {
        defaultTheme: "light",
        allowUserThemeSwitch: true
      },
      layout: {
        headerStyle: "fixed",
        sidebarCollapsed: false,
        showBreadcrumbs: true
      },
      customCSS: ""
    }
  }

  static getDefaultLocalizationSettings(): LocalizationSettings {
    return {
      defaultLanguage: "vi",
      supportedLanguages: [
        { code: "vi", name: "Tiếng Việt", flag: "🇻🇳", enabled: true },
        { code: "en", name: "English", flag: "🇺🇸", enabled: true },
        { code: "ko", name: "한국어", flag: "🇰🇷", enabled: false },
        { code: "ja", name: "日本語", flag: "🇯🇵", enabled: false }
      ],
      dateFormat: "DD/MM/YYYY",
      timeFormat: "24h",
      currency: {
        code: "VND",
        symbol: "₫",
        position: "after"
      },
      timezone: "Asia/Ho_Chi_Minh"
    }
  }

  // Email template methods
  static async getEmailTemplates(): Promise<EmailTemplate[]> {
    try {
      const templates = await this.getSettings<EmailTemplate[]>("emailTemplates")
      return templates || this.getDefaultEmailTemplates()
    } catch (error) {
      console.error("Error getting email templates:", error)
      return this.getDefaultEmailTemplates()
    }
  }

  static async saveEmailTemplate(template: EmailTemplate): Promise<void> {
    try {
      const templates = await this.getEmailTemplates()
      const index = templates.findIndex(t => t.id === template.id)

      if (index >= 0) {
        templates[index] = { ...template, lastModified: Timestamp.now() }
      } else {
        templates.push({ ...template, lastModified: Timestamp.now() })
      }

      await this.saveSettings("emailTemplates", templates)
    } catch (error) {
      console.error("Error saving email template:", error)
      throw error
    }
  }

  static getDefaultEmailTemplates(): EmailTemplate[] {
    return [
      {
        id: "welcome",
        name: "Welcome Email",
        subject: "Welcome to {{siteName}}! 🏠",
        htmlContent: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to {{siteName}}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .content { padding: 40px 30px; }
        .welcome-title { font-size: 24px; color: #2d3748; margin-bottom: 20px; }
        .feature-list { background-color: #f7fafc; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .feature-item { display: flex; align-items: center; margin-bottom: 15px; }
        .feature-icon { width: 24px; height: 24px; margin-right: 15px; background-color: #667eea; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { background-color: #2d3748; color: #a0aec0; padding: 30px; text-align: center; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">{{siteName}}</div>
            <p>Your gateway to authentic homestay experiences</p>
        </div>
        <div class="content">
            <h1 class="welcome-title">Welcome, {{userName}}! 🎉</h1>
            <p>Thank you for joining our homestay community. We're excited to help you discover unique places to stay and create unforgettable memories.</p>

            <div class="feature-list">
                <div class="feature-item">
                    <div class="feature-icon">🏠</div>
                    <div>Browse thousands of unique homestays worldwide</div>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">📅</div>
                    <div>Easy booking and management system</div>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">⭐</div>
                    <div>Share your experiences with reviews</div>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">💬</div>
                    <div>Connect with local hosts</div>
                </div>
            </div>

            <a href="{{siteUrl}}/homestays" class="cta-button">Start Exploring</a>

            <p>If you have any questions, our support team is here to help. Just reply to this email!</p>
            <p>Happy travels!<br>The {{siteName}} Team</p>
        </div>
        <div class="footer">
            <p>&copy; {{currentYear}} {{siteName}}. All rights reserved.</p>
            <p>You received this email because you signed up for {{siteName}}.</p>
        </div>
    </div>
</body>
</html>`,
        textContent: "Welcome to {{siteName}}, {{userName}}! Thank you for joining our homestay community. You can now browse homestays, manage bookings, and leave reviews. Happy travels!",
        variables: ["siteName", "userName", "userEmail", "siteUrl", "currentYear"],
        isActive: true,
        lastModified: Timestamp.now()
      },
      {
        id: "booking_confirmation",
        name: "Booking Confirmation",
        subject: "🎉 Booking Confirmed - {{homestayName}}",
        htmlContent: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmed</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 30px; text-align: center; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .content { padding: 40px 30px; }
        .confirmation-title { font-size: 24px; color: #065f46; margin-bottom: 20px; text-align: center; }
        .booking-card { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 12px; padding: 30px; margin: 30px 0; border-left: 4px solid #10b981; }
        .homestay-name { font-size: 20px; font-weight: bold; color: #065f46; margin-bottom: 20px; }
        .booking-details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .detail-item { background-color: white; padding: 15px; border-radius: 8px; }
        .detail-label { font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: bold; margin-bottom: 5px; }
        .detail-value { font-size: 16px; color: #1f2937; font-weight: 600; }
        .total-amount { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; text-align: center; padding: 20px; border-radius: 8px; margin-top: 20px; }
        .cta-section { text-align: center; margin: 30px 0; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px; }
        .footer { background-color: #2d3748; color: #a0aec0; padding: 30px; text-align: center; font-size: 14px; }
        .contact-info { background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">{{siteName}}</div>
            <p>Booking Confirmation</p>
        </div>
        <div class="content">
            <h1 class="confirmation-title">🎉 Booking Confirmed!</h1>
            <p>Hi {{guestName}},</p>
            <p>Great news! Your booking has been confirmed. We're excited to host you!</p>

            <div class="booking-card">
                <div class="homestay-name">{{homestayName}}</div>
                <div class="booking-details">
                    <div class="detail-item">
                        <div class="detail-label">Check-in</div>
                        <div class="detail-value">📅 {{checkInDate}}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Check-out</div>
                        <div class="detail-value">📅 {{checkOutDate}}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Guests</div>
                        <div class="detail-value">👥 {{guestCount}} guest(s)</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Booking ID</div>
                        <div class="detail-value">#{{bookingId}}</div>
                    </div>
                </div>
                <div class="total-amount">
                    <div class="detail-label">Total Amount</div>
                    <div style="font-size: 24px; font-weight: bold; color: #92400e;">{{totalAmount}}</div>
                </div>
            </div>

            <div class="contact-info">
                <h3 style="margin-top: 0; color: #374151;">📞 Host Contact Information</h3>
                <p><strong>Host:</strong> {{hostName}}<br>
                <strong>Phone:</strong> {{hostPhone}}<br>
                <strong>Email:</strong> {{hostEmail}}</p>
            </div>

            <div class="cta-section">
                <a href="{{siteUrl}}/profile/bookings/{{bookingId}}" class="cta-button">View Booking Details</a>
                <a href="{{siteUrl}}/messages/{{hostId}}" class="cta-button">Message Host</a>
            </div>

            <p><strong>What's next?</strong></p>
            <ul>
                <li>Save this confirmation email for your records</li>
                <li>Contact your host if you have any questions</li>
                <li>Check-in instructions will be sent 24 hours before arrival</li>
                <li>Don't forget to leave a review after your stay!</li>
            </ul>

            <p>We hope you have a wonderful stay!<br>The {{siteName}} Team</p>
        </div>
        <div class="footer">
            <p>&copy; {{currentYear}} {{siteName}}. All rights reserved.</p>
            <p>Need help? Contact us at support@{{siteName}}.com</p>
        </div>
    </div>
</body>
</html>`,
        textContent: "Booking confirmed! Hi {{guestName}}, your booking for {{homestayName}} from {{checkInDate}} to {{checkOutDate}} has been confirmed. Total: {{totalAmount}}. Booking ID: #{{bookingId}}. Contact your host: {{hostName}} ({{hostPhone}}).",
        variables: ["guestName", "homestayName", "checkInDate", "checkOutDate", "guestCount", "totalAmount", "bookingId", "hostName", "hostPhone", "hostEmail", "hostId", "siteName", "siteUrl", "currentYear"],
        isActive: true,
        lastModified: Timestamp.now()
      },
      {
        id: "review_reminder",
        name: "Review Reminder",
        subject: "⭐ How was your stay at {{homestayName}}?",
        htmlContent: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Review Your Stay</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 40px 30px; text-align: center; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .content { padding: 40px 30px; }
        .review-title { font-size: 24px; color: #92400e; margin-bottom: 20px; text-align: center; }
        .homestay-card { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center; }
        .stars { font-size: 30px; margin: 15px 0; }
        .rating-buttons { display: flex; justify-content: center; gap: 10px; margin: 20px 0; flex-wrap: wrap; }
        .rating-btn { display: inline-block; background-color: white; border: 2px solid #f59e0b; color: #92400e; padding: 10px 15px; text-decoration: none; border-radius: 25px; font-weight: bold; transition: all 0.3s; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .benefits { background-color: #fef3c7; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .benefit-item { display: flex; align-items: center; margin-bottom: 10px; }
        .footer { background-color: #2d3748; color: #a0aec0; padding: 30px; text-align: center; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">{{siteName}}</div>
            <p>Share Your Experience</p>
        </div>
        <div class="content">
            <h1 class="review-title">⭐ How was your stay?</h1>
            <p>Hi {{guestName}},</p>
            <p>We hope you had an amazing time at your recent stay! Your experience matters to us and helps other travelers make informed decisions.</p>

            <div class="homestay-card">
                <h3 style="margin-top: 0; color: #92400e;">{{homestayName}}</h3>
                <p style="color: #78350f;">{{checkInDate}} - {{checkOutDate}}</p>
                <div class="stars">⭐⭐⭐⭐⭐</div>
                <p style="margin-bottom: 0; color: #78350f;">Rate your experience</p>
            </div>

            <div class="rating-buttons">
                <a href="{{reviewUrl}}?rating=5" class="rating-btn">⭐⭐⭐⭐⭐ Excellent</a>
                <a href="{{reviewUrl}}?rating=4" class="rating-btn">⭐⭐⭐⭐ Good</a>
                <a href="{{reviewUrl}}?rating=3" class="rating-btn">⭐⭐⭐ Average</a>
            </div>

            <div style="text-align: center;">
                <a href="{{reviewUrl}}" class="cta-button">Write Your Review</a>
            </div>

            <div class="benefits">
                <h3 style="margin-top: 0; color: #92400e;">Why leave a review?</h3>
                <div class="benefit-item">
                    <span style="margin-right: 10px;">🌟</span>
                    <span>Help other travelers discover great places</span>
                </div>
                <div class="benefit-item">
                    <span style="margin-right: 10px;">🏠</span>
                    <span>Support your host and their business</span>
                </div>
                <div class="benefit-item">
                    <span style="margin-right: 10px;">💝</span>
                    <span>Get priority access to special offers</span>
                </div>
                <div class="benefit-item">
                    <span style="margin-right: 10px;">🎯</span>
                    <span>Improve the platform for everyone</span>
                </div>
            </div>

            <p>Your honest feedback takes just 2 minutes and makes a huge difference!</p>
            <p>Thank you for choosing {{siteName}}!<br>The {{siteName}} Team</p>
        </div>
        <div class="footer">
            <p>&copy; {{currentYear}} {{siteName}}. All rights reserved.</p>
            <p>This review request was sent because you recently stayed at {{homestayName}}.</p>
        </div>
    </div>
</body>
</html>`,
        textContent: "Hi {{guestName}}, how was your stay at {{homestayName}}? Your feedback helps other travelers and supports your host. Please take a moment to leave a review: {{reviewUrl}}",
        variables: ["guestName", "homestayName", "checkInDate", "checkOutDate", "reviewUrl", "siteName", "currentYear"],
        isActive: true,
        lastModified: Timestamp.now()
      }
    ]
  }
}
