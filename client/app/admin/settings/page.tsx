"use client"

import { AdminDashboardLayout } from "@/components/admin/dashboard-layout"
import { Button } from "@/components/ui/button"
import {
  Settings,
  Globe,
  Bell,
  Shield,
  CreditCard,
  Mail,
  Database,
  Palette,
  ArrowRight
} from "lucide-react"
import Link from "next/link"

const settingsCategories = [
  {
    title: "Hero Banner Setting",
    description: "Basic site configuration and preferences",
    icon: Settings,
    href: "/admin/settings/hero",
    color: "text-blue-600"
  },
  {
    title: "Notifications",
    description: "Email and push notification settings",
    icon: Bell,
    href: "/admin/settings/notifications",
    color: "text-green-600"
  },
  {
    title: "Security",
    description: "Authentication and security policies",
    icon: Shield,
    href: "/admin/settings/security",
    color: "text-red-600"
  },
  {
    title: "Payment Settings",
    description: "Payment gateways and commission rates",
    icon: CreditCard,
    href: "/admin/settings/payments",
    color: "text-purple-600"
  },
  {
    title: "Email Templates",
    description: "Customize email templates and content",
    icon: Mail,
    href: "/admin/settings/emails",
    color: "text-orange-600"
  },
  {
    title: "Database",
    description: "Database maintenance and backups",
    icon: Database,
    href: "/admin/settings/database",
    color: "text-gray-600"
  },
  {
    title: "Appearance",
    description: "Theme and branding customization",
    icon: Palette,
    href: "/admin/settings/appearance",
    color: "text-pink-600"
  },
  {
    title: "Localization",
    description: "Language and regional settings",
    icon: Globe,
    href: "/admin/settings/localization",
    color: "text-teal-600"
  },
  {
    title: "Vouchers Settings",
    description: "Language and regional settings",
    icon: Globe,
    href: "/admin/settings/vouchers",
    color: "text-teal-600"
  }
]

export default function AdminSettingsPage() {
  return (
    <AdminDashboardLayout title="Settings">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">System Settings</h2>
          <p className="text-neutral-600 mt-1">Configure and manage your application settings</p>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settingsCategories.map((category) => {
            const Icon = category.icon
            return (
              <Link key={category.href} href={category.href}>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 hover:shadow-md transition-all duration-200 hover:-translate-y-1 group">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center ${category.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-neutral-400 group-hover:text-primary-600 transition-colors" />
                  </div>

                  <h3 className="text-lg font-semibold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {category.title}
                  </h3>

                  <p className="text-neutral-600 text-sm leading-relaxed">
                    {category.description}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
          <h3 className="text-lg font-semibold text-neutral-900 mb-6">Quick Actions</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Database className="h-6 w-6" />
              <span className="text-sm">Backup Database</span>
            </Button>

            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Shield className="h-6 w-6" />
              <span className="text-sm">Security Scan</span>
            </Button>

            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Mail className="h-6 w-6" />
              <span className="text-sm">Test Email</span>
            </Button>

            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Settings className="h-6 w-6" />
              <span className="text-sm">System Info</span>
            </Button>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
          <h3 className="text-lg font-semibold text-neutral-900 mb-6">System Status</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <div className="w-8 h-8 bg-green-500 rounded-full"></div>
              </div>
              <h4 className="font-medium text-neutral-900">Database</h4>
              <p className="text-sm text-green-600">Healthy</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <div className="w-8 h-8 bg-green-500 rounded-full"></div>
              </div>
              <h4 className="font-medium text-neutral-900">API Services</h4>
              <p className="text-sm text-green-600">Online</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <div className="w-8 h-8 bg-yellow-500 rounded-full"></div>
              </div>
              <h4 className="font-medium text-neutral-900">Storage</h4>
              <p className="text-sm text-yellow-600">75% Used</p>
            </div>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  )
}
