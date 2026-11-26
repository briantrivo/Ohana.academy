import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Chính sách bảo mật | OHANA AI ACADEMY",
  description:
    "Chính sách thu thập, sử dụng và bảo vệ dữ liệu học viên trên nền tảng Ohana AI Academy (Công Ty TNHH Astronixa).",
};

export default function PrivacyPolicyPage() {
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
          Chính Sách Bảo Mật Thông Tin
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Áp dụng cho nền tảng đào tạo trực tuyến{" "}
          <strong className="text-slate-200">Ohana AI Academy</strong> (
          <code>https://ohanaai-academy.vercel.app</code>) do{" "}
          <strong className="text-slate-200">Công Ty TNHH Astronixa</strong> &amp; Ban Đào Tạo Ohana
          Career vận hành.
        </p>
      </div>

      <div className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 text-sm text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-display text-lg font-bold text-white">
            1. Dữ liệu chúng tôi thu thập
          </h2>
          <p>
            Khi bạn đăng ký tài khoản trực tiếp hoặc sử dụng nút{" "}
            <strong>Đăng nhập bằng Google</strong>, chúng tôi chỉ thu thập các thông tin cơ bản cần
            thiết cho việc học tập và cấp chứng chỉ:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-300">
            <li>Họ và tên hiển thị, địa chỉ Email và ảnh đại diện (từ phạm vi Google OAuth: <code>openid</code>, <code>email</code>, <code>profile</code>).</li>
            <li>Số điện thoại hoặc đơn vị/phòng ban (khi học viên hoặc nhân sự nội bộ tự cung cấp).</li>
            <li>Tiến độ hoàn thành bài giảng, kết quả bài kiểm tra, thông tin đơn hàng khóa học và chứng chỉ đã cấp.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-lg font-bold text-white">
            2. Mục đích sử dụng dữ liệu
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-slate-300">
            <li>Xác thực đăng nhập, duy trì phiên học tập an toàn và phân quyền truy cập khóa học.</li>
            <li>Kích hoạt khóa học tự động sau khi thanh toán VietQR hoặc nhập mã kích hoạt nội bộ.</li>
            <li>Lưu trữ tiến độ học tập, tải tài liệu đính kèm và cấp phát chứng chỉ hoàn thành định danh.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-lg font-bold text-white">
            3. Lưu trữ, bảo mật &amp; không chia sẻ trái phép
          </h2>
          <p>
            Dữ liệu tài khoản được lưu trữ bảo mật trên hạ tầng cơ sở dữ liệu Supabase với cơ chế băm
            mật khẩu an toàn (scrypt) và cookie phiên <code>HttpOnly</code> ký số HMAC-SHA256. Chúng
            tôi tuyệt đối không bán, cho thuê hoặc chia sẻ thông tin cá nhân của học viên cho bên
            thứ ba phục vụ mục đích quảng cáo.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-lg font-bold text-white">
            4. Quyền của người dùng &amp; thông tin liên hệ
          </h2>
          <p>
            Học viên có quyền yêu cầu xem, chỉnh sửa hoặc xóa dữ liệu tài khoản của mình bất kỳ lúc
            nào bằng cách gửi email về bộ phận hỗ trợ:
          </p>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-xs text-slate-300 space-y-1">
            <div>
              <strong>Đơn vị vận hành:</strong> Công Ty TNHH Astronixa — Ohana AI Academy
            </div>
            <div>
              <strong>Email hỗ trợ:</strong> astronixaglobal@gmail.com
            </div>
            <div>
              <strong>Website:</strong> https://ohanaai-academy.vercel.app
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
