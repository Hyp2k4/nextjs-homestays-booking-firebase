import Link from "next/link"
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-muted border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src="/Logo.svg"
                  alt="Logo"
                  width={80}   // chỉnh tùy ý
                  height={80}
                  className="revert"
                />
              </Link>
            </div>
            <p className="text-muted-foreground text-sm">
              Nền tảng đặt homestay hàng đầu Việt Nam, kết nối du khách với những trải nghiệm địa phương đích thực.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif font-semibold text-foreground mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-muted-foreground hover:text-primary">
                  Trợ giúp
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary">
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-muted-foreground hover:text-primary">
                  Tuyển dụng
                </Link>
              </li>
            </ul>
          </div>

          {/* For Hosts */}
          <div>
            <h3 className="font-serif font-semibold text-foreground mb-4">Dành cho chủ nhà</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/host" className="text-muted-foreground hover:text-primary">
                  Cho thuê nhà
                </Link>
              </li>
              <li>
                <Link href="/host/resources" className="text-muted-foreground hover:text-primary">
                  Tài nguyên
                </Link>
              </li>
              <li>
                <Link href="/host/community" className="text-muted-foreground hover:text-primary">
                  Cộng đồng
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-serif font-semibold text-foreground mb-4">Pháp lý</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary">
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-muted-foreground hover:text-primary">
                  Chính sách Cookie
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-sm">© 2024 VietStay. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  )
}
