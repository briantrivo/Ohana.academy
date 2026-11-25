# Spec: OHANA ACADEMY LMS (Đào Tạo Nội Bộ & Thương Mại Hóa Khóa Học)

## 1. Objective
Xây dựng nền tảng **Ohana Academy LMS** chuẩn mã nguồn mở MIT trên hệ sinh thái **Next.js + TypeScript + Tailwind CSS**, phục vụ đồng thời **2 mục tiêu cốt lõi** của Hệ sinh thái Astronixa Ohana:
- **Hướng 1 — Đào tạo Nội bộ & Cộng đồng Miễn phí**: Huấn luyện nhân sự/đối tác Ohana Career (mở khóa bằng tài khoản nội bộ hoặc Mã kích hoạt nội bộ `OHANA-NOIBO-2026`), khóa học cộng đồng miễn phí thu hút phễu khách hàng, theo dõi tiến độ `%`, làm Quiz trắc nghiệm chấm điểm tự động và cấp **Chứng chỉ điện tử có mã định danh xác thực**.
- **Hướng 2 — Bán khóa học Thương mại tự động tại Việt Nam**: Trang chủ & Landing Page khóa học chuyển đổi cao theo nhận diện **Cosmic Cyber Ohana**, học thử bài miễn phí (Preview), áp mã giảm giá/học bổng, tạo mã **VietQR động (Techcombank - STK `894567` - CÔNG TY TNHH ASTRONIXA)** và tích hợp sẵn **Webhook SePay / PayOS / Casso** tự động mở khóa học ngay sau 3 giây chuyển khoản.

## 2. Commands
```bash
# Chạy môi trường phát triển local
npm.cmd run dev

# Kiểm tra TypeScript & Build Production (chuẩn bị deploy Vercel)
npm.cmd run build

# Chạy Production Server
npm.cmd run start
```

## 3. Project Structure
```text
ohana-academy-lms/
├── public/ohana/              # Tài nguyên hình ảnh, logo, banner & chứng chỉ thực tế của Ohana Astronixa
├── data/                      # Lưu trữ dữ liệu JSON tự động ở local (tự động fallback /tmp trên Serverless)
├── src/
│   ├── types/lms.ts           # Định nghĩa kiểu dữ liệu (Course, Chapter, Lesson, Quiz, Order, Certificate, User)
│   ├── lib/
│   │   ├── seed-data.ts       # Dữ liệu khóa học thực tế của Ohana (Thương mại, Nội bộ, Cộng đồng)
│   │   ├── store.ts           # Tầng lưu trữ & đồng bộ trạng thái (Server API + LocalStorage Persistence)
│   │   └── video.ts           # Bộ phân tích URL thông minh cho YouTube (Unlisted/Watch/Shorts) & Vimeo
│   ├── components/
│   │   ├── Navbar.tsx         # Thanh điều hướng + Bộ chuyển vai trò nhanh (Học viên / Nội bộ / Admin)
│   │   ├── CourseCard.tsx     # Thẻ khóa học phân biệt Thương mại / Nội bộ / Miễn phí
│   │   └── VideoPlayer.tsx    # Trình phát nhúng YouTube Unlisted & Vimeo tối ưu học tập
│   └── app/
│       ├── page.tsx                       # Trang chủ Ohana Academy (Danh mục, Lộ trình, Bộ lọc 2 hướng)
│       ├── courses/[slug]/page.tsx        # Trang chi tiết khóa học (Landing Page, Học thử, Đề cương, Mua/Kích hoạt)
│       ├── learn/[slug]/page.tsx          # Phòng học tập (Video, Tài liệu, Tiến độ %, Làm bài Quiz & Nhận Chứng chỉ)
│       ├── checkout/[slug]/page.tsx       # Cổng thanh toán VietQR động tự động kiểm tra trạng thái 3s/lần
│       ├── my-learning/page.tsx           # Bảng điều khiển Học viên & Kho chứng chỉ đã đạt
│       ├── certificates/[code]/page.tsx   # Trang tra cứu & in Chứng chỉ tốt nghiệp Ohana x Viện KHCN
│       ├── admin/page.tsx                 # Ohana Studio: Tạo khóa học YouTube/Vimeo, Duyệt đơn, Tạo mã nội bộ
│       └── api/                           # REST API: Courses, Orders, Redeem Code, Webhook SePay/PayOS/Casso
```

## 4. Boundaries
- **Always do**: Giữ giao diện 100% Tiếng Việt rõ ràng, tương phản cao (WCAG AA), hỗ trợ đầy đủ cả YouTube Unlisted lẫn Vimeo, xác thực chữ ký/mã đơn hàng tại Webhook thanh toán.
- **Never do**: Gắn cứng khóa bí mật (API Key) vào mã nguồn phía client; sử dụng biến môi trường `PAYMENT_WEBHOOK_SECRET` khi lên Production.
