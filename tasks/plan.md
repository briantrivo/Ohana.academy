# Implementation Plan: Hệ Thống Hội Viên Định Kỳ — Ohana Membership

## Overview
Triển khai trọn vẹn mô hình **Ohana Membership (Đóng phí hàng tháng/quý/năm để học kho bài giảng AI cập nhật liên tục)** trên `https://ohanaai-academy.vercel.app` với 3 gói khởi tạo (`299.000đ / 30 ngày`, `790.000đ / 90 ngày`, `2.490.000đ / 365 ngày`), thanh toán tự động qua **VietQR ACB `49682677` + SePay Webhook**, trang `/membership` hiển thị bảng tin **Bài học mới cập nhật**, tạo sẵn khóa mẫu *"Kho Bài Học AI Cập Nhật Hàng Tháng"*, và bộ công cụ Quản trị Membership đầy đủ trong `/admin`.

## Architecture Decisions
1. **Tách quyền Hội viên có thời hạn (`ohana_subscriptions`) khỏi quyền mua đứt trọn đời (`ohana_enrollments`)**:
   - Mua khóa lẻ (`6.600.000đ`) vẫn lưu vĩnh viễn trong `ohana_enrollments`.
   - Mua Membership lưu hạn dùng `expires_at` trong `ohana_subscriptions`; gia hạn sớm sẽ cộng dồn nối tiếp (`max(now, currentExpiresAt) + durationDays`). Khi hết hạn chỉ tạm khóa nội dung Membership mà không xóa tiến độ học (`ohana_lesson_progress`).
2. **Dùng chung hạ tầng Đơn hàng & Webhook SePay sẵn có**:
   - Bổ sung các trường tùy chọn `order_type` (`'course' | 'membership'`), `plan_id`, `duration_days` vào `ohana_orders` (`ALTER TABLE ... ADD COLUMN IF NOT EXISTS`). Mã đơn vẫn giữ định dạng `OHANA\d{6}` để tương thích 100% với regex đối soát SePay hiện hành mà không phải chỉnh lại cấu hình trên `my.sepay.vn`.
3. **Linh hoạt phạm vi khóa học Membership**:
   - Hỗ trợ đồng thời `course.accessType === "membership"` (khóa chuyên biệt cho Hội viên) VÀ cờ `course.includedInMembership === true` (cho phép Admin bật/tắt đưa bất kỳ khóa học nào vào gói Hội viên mà không ảnh hưởng khóa chính `6.600.000đ`).
4. **Đăng nhanh bài học cập nhật**:
   - Mỗi `Lesson` có thêm `publishedAt?: string`; Admin có form **"Đăng Bài Học Cập Nhật Mới"** ngay trong tab Membership để đẩy video mới vào thẳng chương trình tháng và hiển thị tự động trên bảng tin `/membership`.

## Task List

### Phase 1: Domain Logic, Tests & Database Foundation
- **Task 1**: Viết bộ kiểm thử tự động `tests/membership.test.mjs` (TDD Red → Green) và module domain `src/lib/membership.ts`.
- **Task 2**: Nâng cấp `src/types/lms.ts`, `supabase/schema.sql`, `src/lib/supabase.ts`, `src/lib/server-db.ts`, `src/lib/auth.ts` và thêm khóa mẫu *"Kho Bài Học AI Cập Nhật Hàng Tháng"* vào `src/lib/seed-data.ts`.

### Phase 2: Backend APIs & SePay Auto-Renewal
- **Task 3**: Nâng cấp `POST/PATCH /api/orders`, `/api/webhooks/payment`, `/api/resources/file/[name]` để tạo đơn Membership, tự động cộng dồn hạn dùng khi SePay báo tiền vào hoặc Admin duyệt đơn, và kiểm tra hạn hội viên khi tải tài liệu.
- **Task 4**: Xây dựng `GET/POST/PATCH/DELETE /api/admin/membership` cho phép Admin chỉnh gói giá, bật/tắt khóa học trong Membership, đăng nhanh bài học cập nhật, và cấp/cộng ngày thủ công cho học viên.

### Phase 3: Learner UI & Admin Studio
- **Task 5**: Xây dựng trang `/membership` (bảng giá 3 gói, thanh toán VietQR ACB trực tiếp có áp dụng Coupon, đồng hồ hạn hội viên, danh sách Bài học mới cập nhật) + cập nhật `Navbar`, `CourseCard`, `/ page`, `/courses/[slug]`, `/learn/[slug]`, `/my-learning`.
- **Task 6**: Bổ sung tab **Hội Viên (Membership)** trong `/admin` và migrate dữ liệu thật lên Supabase + deploy Production `https://ohanaai-academy.vercel.app`.
