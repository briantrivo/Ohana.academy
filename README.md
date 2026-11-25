# OHANA ACADEMY LMS — Hệ Thống E-Learning Toàn Diện (Nội Bộ & Thương Mại)

Nền tảng đào tạo trực tuyến mã nguồn mở MIT được xây dựng trên **Next.js 15 + TypeScript + Tailwind CSS**, tối ưu riêng cho **Hệ sinh thái Ohana & Astronixa**.

## Tính Năng Chính
1. **Hệ thống Đăng nhập, Đăng ký & Google OAuth 2.0 (`/login`)**:
   - Xác thực phiên làm việc bằng **Session Cookie (`HttpOnly`)** ký HMAC-SHA256 & mã hóa mật khẩu bằng **scrypt + salt**.
   - Hỗ trợ **Đăng nhập bằng tài khoản Google** chuẩn OAuth 2.0 + PKCE (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`).
   - Phân tách 3 vai trò bảo mật từ Server: **Học viên**, **Nhân sự Nội bộ Ohana** (qua tài khoản được cấp hoặc nhập mã `OHANA-NOIBO-2026`) và **Quản trị viên (Admin)**.
2. **Đào tạo Nội bộ & Cộng đồng Miễn phí (Hướng 1)**:
   - Theo dõi tiến độ `%`, bài kiểm tra Quiz chấm điểm tự động và xuất **Giấy Chứng Nhận điện tử có mã tra cứu**.
3. **Bán Khóa Học Thương Mại & Thanh Toán VietQR Tự Động (Hướng 2)**:
   - Học thử bài giảng miễn phí (`Học thử`) ngay tại trang chi tiết khóa học.
   - Tạo mã **VietQR động Techcombank (STK `894567` — CÔNG TY TNHH ASTRONIXA)** kèm Webhook `/api/webhooks/payment` tương thích **SePay / PayOS / Casso**.
4. **Quản Trị Studio (`/admin`) & Tài liệu bài giảng**:
   - Đăng khóa học qua link **YouTube / Playlist / Vimeo**, đính kèm trực tiếp file PDF/Word/Slide dưới từng bài giảng, quản lý tài khoản nhân sự và duyệt đơn hàng.

## Cấu Hình Google Login (Khi Chạy Thực Tế)
1. Vào [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → tạo **OAuth Client ID** (Web application).
2. Thêm **Authorized redirect URIs**:
   - Localhost: `http://localhost:3005/api/auth/google/callback`
   - Production (Vercel): `https://<ten-mien-cua-anh>/api/auth/google/callback`
3. Tạo file `.env.local` dựa trên `.env.example` và điền `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_SECRET`.

## Khởi Chạy Nhanh Trên Máy
```bash
npm.cmd install
npm.cmd run dev
```
Truy cập: `http://localhost:3005`
