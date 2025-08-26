"use client"

import { ModernButton } from "@/components/ui/modern-button"
import { ResponsiveContainer, ResponsiveGrid } from "@/components/ui/responsive-container"
import { 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Instagram, 
  Twitter,
  Youtube,
  Heart,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const footerLinks = {
  company: [
    { label: "Về chúng tôi", href: "/about" },
    { label: "Tuyển dụng", href: "/careers" },
    { label: "Tin tức", href: "/news" },
    { label: "Đối tác", href: "/partners" },
  ],
  support: [
    { label: "Trung tâm hỗ trợ", href: "/support" },
    { label: "Liên hệ", href: "/contact" },
    { label: "Câu hỏi thường gặp", href: "/faq" },
    { label: "Báo cáo sự cố", href: "/report" },
  ],
  hosting: [
    { label: "Trở thành Host", href: "/become-host" },
    { label: "Hướng dẫn Host", href: "/host-guide" },
    { label: "Cộng đồng Host", href: "/host-community" },
    { label: "Tài nguyên Host", href: "/host-resources" },
  ],
  legal: [
    { label: "Điều khoản sử dụng", href: "/terms" },
    { label: "Chính sách bảo mật", href: "/privacy" },
    { label: "Chính sách cookie", href: "/cookies" },
    { label: "Quy định cộng đồng", href: "/community-rules" },
  ],
}

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
]

export function ModernFooter() {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-slate-700">
        <ResponsiveContainer spacing="lg" className="py-12">
          <div className="text-center space-y-6">
            <h3 className="text-2xl md:text-3xl font-bold">
              Đăng ký nhận thông tin{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                ưu đãi đặc biệt
              </span>
            </h3>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Nhận ngay những ưu đãi hấp dẫn, tin tức du lịch và gợi ý homestay tuyệt vời
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <ModernButton variant="gradient" className="px-8">
                Đăng ký
                <ArrowRight className="h-4 w-4 ml-2" />
              </ModernButton>
            </div>
          </div>
        </ResponsiveContainer>
      </div>

      {/* Main Footer Content */}
      <ResponsiveContainer spacing="lg" className="py-16">
        <ResponsiveGrid cols={{ xs: 1, sm: 2, lg: 5 }} gap="lg">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="/Logo.svg"
                alt="StayVN Logo"
                width={48}
                height={48}
                className="brightness-0 invert"
              />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                StayVN
              </h2>
            </Link>
            <p className="text-slate-300 leading-relaxed max-w-md">
              Nền tảng đặt phòng homestay hàng đầu Việt Nam. Khám phá những trải nghiệm 
              lưu trú độc đáo và tạo nên những kỷ niệm đáng nhớ.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-slate-300">
                <MapPin className="h-5 w-5 text-amber-500" />
                <span>123 Đường ABC, Quận 1, TP.HCM</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-300">
                <Phone className="h-5 w-5 text-amber-500" />
                <span>+84 123 456 789</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-300">
                <Mail className="h-5 w-5 text-amber-500" />
                <span>hello@stayvn.com</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <Link
                    key={social.label}
                    href={social.href}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-amber-500 flex items-center justify-center transition-all duration-200 hover:scale-110"
                    aria-label={social.label}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Công ty</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-300 hover:text-amber-400 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Hỗ trợ</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-300 hover:text-amber-400 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hosting Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Hosting</h4>
            <ul className="space-y-3">
              {footerLinks.hosting.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-300 hover:text-amber-400 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </ResponsiveGrid>
      </ResponsiveContainer>

      {/* Bottom Bar */}
      <div className="border-t border-slate-700">
        <ResponsiveContainer spacing="lg" className="py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-slate-400 text-sm">
              <span>© 2024 StayVN. All rights reserved.</span>
              <div className="flex space-x-4">
                {footerLinks.legal.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="hover:text-amber-400 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-2 text-slate-400 text-sm">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500 animate-pulse" />
              <span>in Vietnam</span>
            </div>
          </div>
        </ResponsiveContainer>
      </div>
    </footer>
  )
}
