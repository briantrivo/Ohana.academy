import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng | OHANA AI ACADEMY",
  description:
    "Điều khoản sử dụng nền tảng đào tạo trực tuyến Ohana AI Academy (Công Ty TNHH Astronixa).",
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="mb-8">
        <Link
          href="/"
          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          ← Quay lại trang chủ Ohana Academy
        </Link>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-white">
          Điều Khoản Sử Dụng
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Khi truy cập và sử dụng hệ thống <strong className="text-slate-200">Ohana AI Academy</strong>,
          học viên và nhân sự đồng ý tuân thủ các quy định dưới đây.
        </p>
      </div>

      <div className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 text-sm text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-display text-lg font-bold text-white">
            1. Tài khoản &amp; Quyền truy cập
          </h2>
          <p>
            Mỗi tài khoản học viên hoặc nhân sự nội bộ chỉ dành cho cá nhân đăng ký sử dụng. Người
            dùng có trách nhiệm bảo mật thông tin đăng nhập (Email/Mật khẩu hoặc tài khoản Google)
            và không chia sẻ tài khoản cho bên thứ ba trái phép.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-lg font-bold text-white">
            2. Bản quyền nội dung đào tạo
          </h2>
          <p>
            Toàn bộ video bài giảng, tài liệu đính kèm, bộ prompt mẫu và chương trình đào tạo thuộc
            bản quyền của Công Ty TNHH Astronixa &amp; Ohana Career. Học viên được phép tải tài liệu
            đính kèm phục vụ học tập và ứng dụng cá nhân/kinh doanh của mình, nhưng không được sao
            chép, phát tán hoặc thương mại hóa lại giáo trình khi chưa có sự đồng ý bằng văn bản.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-lg font-bold text-white">
            3. Thanh toán khóa học &amp; Kích hoạt
          </h2>
          <p>
            Đối với khóa học thương mại thanh toán qua VietQR, hệ thống sẽ tự động kích hoạt khóa
            học ngay khi giao dịch chuyển khoản hợp lệ được xác nhận đúng mã đơn hàng và số tiền.
            Mọi thắc mắc về đơn hàng hoặc mã kích hoạt nội bộ vui lòng liên hệ đội ngũ hỗ trợ.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-lg font-bold text-white">
            4. Liên hệ hỗ trợ
          </h2>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-xs text-slate-300 space-y-1">
            <div>
              <strong>Đơn vị vận hành:</strong> Công Ty TNHH Astronixa — Ohana AI Academy
            </div>
            <div>
              <strong>Email hỗ trợ:</strong> astronixaglobal@gmail.com
            </div>
            <div>
              <strong>Chính sách bảo mật:</strong>{" "}
              <Link href="/privacy" className="text-cyan-400 hover:underline">
                https://ohanaai-academy.vercel.app/privacy
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
