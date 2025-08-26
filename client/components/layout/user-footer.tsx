"use client"

import Link from "next/link"
import { useAppearanceSettings, GlobalSettingsService } from "@/lib/global-settings-service"
import { useLanguage } from "@/lib/i18n"
import { LanguageToggle } from "@/components/ui/language-switcher"
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Heart
} from "lucide-react"

export function UserFooter() {
  const { t } = useLanguage()
  const siteName = GlobalSettingsService.getSiteName()
  const logoUrl = GlobalSettingsService.getLogoUrl()
  const primaryColor = GlobalSettingsService.getPrimaryColor()

  const footerLinks = {
    company: [
      { name: t('footer.company.aboutUs') || "About Us", href: "/about" },
      { name: t('footer.company.ourStory') || "Our Story", href: "/story" },
      { name: t('footer.company.careers') || "Careers", href: "/careers" },
      { name: t('footer.company.press') || "Press", href: "/press" },
      { name: t('footer.company.blog') || "Blog", href: "/blog" },
    ],
    support: [
      { name: t('footer.support.helpCenter') || "Help Center", href: "/help" },
      { name: t('footer.support.contactUs') || "Contact Us", href: "/contact" },
      { name: t('footer.support.safety') || "Safety", href: "/safety" },
      { name: t('footer.support.cancellation') || "Cancellation", href: "/cancellation" },
      { name: t('footer.support.community') || "Community", href: "/community" },
    ],
    hosting: [
      { name: t('footer.hosting.becomeHost') || "Become a Host", href: "/host" },
      { name: t('footer.hosting.resources') || "Host Resources", href: "/host/resources" },
      { name: t('footer.hosting.community') || "Host Community", href: "/host/community" },
      { name: t('footer.hosting.responsible') || "Host Responsibly", href: "/host/responsible" },
    ],
    legal: [
      { name: t('footer.legal.terms') || "Terms of Service", href: "/terms" },
      { name: t('footer.legal.privacy') || "Privacy Policy", href: "/privacy" },
      { name: t('footer.legal.cookies') || "Cookie Policy", href: "/cookies" },
      { name: t('footer.legal.sitemap') || "Sitemap", href: "/sitemap" },
    ]
  }

  const socialLinks = [
    { name: "Facebook", href: "#", icon: Facebook },
    { name: "Twitter", href: "#", icon: Twitter },
    { name: "Instagram", href: "#", icon: Instagram },
    { name: "YouTube", href: "#", icon: Youtube },
  ]

  return (
    <footer className="bg-neutral-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-3 mb-6">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={siteName}
                  className="h-8 w-auto object-contain brightness-0 invert"
                />
              ) : (
                <div 
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: primaryColor }}
                >
                  {siteName.charAt(0)}
                </div>
              )}
              <span className="text-xl font-bold">{siteName}</span>
            </Link>

            <p className="text-neutral-300 mb-6 max-w-sm">
              {t('footer.description')}
            </p>

            {/* Contact Info */}
            <div className="space-y-3 text-sm text-neutral-300">
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-primary-400" />
                <span>{t('footer.contact.address')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-primary-400" />
                <span>{t('footer.contact.phone')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-primary-400" />
                <span>{t('footer.contact.email')}</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">{t('footer.company')}</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-neutral-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">{t('footer.support')}</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-neutral-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hosting Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">{t('footer.hosting')}</h3>
            <ul className="space-y-3">
              {footerLinks.hosting.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-neutral-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">{t('footer.legal')}</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-neutral-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 pt-8 border-t border-neutral-800">
          <div className="max-w-md">
            <h3 className="font-semibold text-white mb-4">{t('footer.newsletter.title')}</h3>
            <p className="text-neutral-300 text-sm mb-4">
              {t('footer.newsletter.description')}
            </p>
            <div className="flex space-x-3">
              <input
                type="email"
                placeholder={t('footer.newsletter.placeholder')}
                className="flex-1 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                className="px-6 py-2 rounded-lg text-white font-medium transition-colors"
                style={{ backgroundColor: primaryColor }}
              >
                {t('footer.newsletter.subscribe')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-neutral-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-neutral-400 text-sm">
              © {new Date().getFullYear()} {siteName}. {t('footer.copyright')}
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className="text-neutral-400 hover:text-white transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>

            {/* Language/Currency Selector */}
            <div className="flex items-center space-x-4 text-sm">
              <LanguageToggle />
              <span className="text-neutral-600">|</span>
              <button className="text-neutral-400 hover:text-white transition-colors">
                ₫ {t('footer.currency')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
