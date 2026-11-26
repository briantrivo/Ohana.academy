import type { Metadata } from "next";
import Link from "next/link";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { LMSProvider } from "@/context/LMSContext";
import { Navbar } from "@/components/Navbar";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin", "vietnamese"],
  variable: "--font-display",
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  title: "OHANA ACADEMY | Nền Tảng Đào Tạo Nội Bộ & Khóa Học Thực Chiến Astronixa",
  description:
    "Hệ thống E-Learning chính thức của Ohana & Astronixa: Đào tạo nội bộ đội ngũ toàn quốc, khóa học cộng đồng miễn phí và chương trình làm chủ AI kinh doanh thực chiến.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${jakarta.variable} ${spaceGrotesk.variable}`}>
      <body className="tech-grid min-h-screen flex flex-col antialiased">
        <LMSProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-slate-900 bg-[#04060B] py-10 text-xs text-slate-400 print:hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src="/ohana/astronixa_logo.jpg"
                  alt="Astronixa Ohana"
                  className="w-9 h-9 rounded-lg object-contain bg-white/5 border border-purple-500/30 p-1"
                />
                <div>
                  <div className="font-display font-bold text-white text-sm">
                    OHANA ACADEMY • ASTRONIXA ECOSYSTEM
                  </div>
                  <div className="text-[11px] text-slate-500">
                    One Universe — One Family • Đào tạo Nội bộ & Thương mại hóa Tri thức
                  </div>
                </div>
              </div>
              <div className="text-center sm:text-right text-[11px] text-slate-500">
                <div>Đơn vị vận hành: Công Ty TNHH Astronixa & Ban Đào Tạo Ohana Career</div>
                <div className="mt-0.5">
                  Hỗ trợ thanh toán tự động VietQR 24/7 • Cấp chứng chỉ định danh trực tuyến
                </div>
                <div className="mt-1.5 flex items-center justify-center sm:justify-end gap-3 text-slate-400">
                  <Link href="/privacy" className="hover:text-cyan-400 transition-colors">
                    Chính sách bảo mật
                  </Link>
                  <span>•</span>
                  <Link href="/terms" className="hover:text-cyan-400 transition-colors">
                    Điều khoản sử dụng
                  </Link>
                </div>
              </div>
            </div>
          </footer>
        </LMSProvider>
      </body>
    </html>
  );
}
