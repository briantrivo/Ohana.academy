# Tasks: Hệ Thống Hội Viên Định Kỳ — Ohana Membership

## Task 1: Domain Logic & TDD Suite (`src/lib/membership.ts` + `tests/membership.test.mjs`)
- [ ] Viết test kiểm tra cộng dồn hạn `computeExtendedExpiry`, kiểm tra quyền truy cập khóa Membership/Commercial, và trích xuất bài học mới cập nhật.
- [ ] Triển khai `src/lib/membership.ts` và xác nhận toàn bộ test PASS.

## Task 2: Schema Supabase, Types & Khóa Membership Mẫu
- [ ] Mở rộng `src/types/lms.ts` (`MembershipPlan`, `UserSubscription`, `Order.orderType/planId/durationDays`, `Course.accessType="membership"`, `Course.includedInMembership`, `Lesson.publishedAt`).
- [ ] Bổ sung DDL `ohana_membership_plans`, `ohana_subscriptions`, và cột mở rộng `ohana_orders` trong `src/lib/supabase.ts` & `supabase/schema.sql`.
- [ ] Đồng bộ đọc/ghi trong `src/lib/server-db.ts` và lọc bảo mật trong `src/lib/auth.ts` (user thường chỉ thấy subscription của chính mình).
- [ ] Khởi tạo 3 gói giá (`299.000đ`, `790.000đ`, `2.490.000đ`) và khóa mẫu *"Kho Bài Học AI Cập Nhật Hàng Tháng"*.

## Checkpoint 1: Foundation
- [ ] Unit tests PASS & `npx.cmd tsc --noEmit` không lỗi ở tầng `lib/` & `types/`.

## Task 3: Order, SePay Webhook & File Guard cho Membership
- [ ] Hỗ trợ tạo đơn `orderType: "membership"` trong `/api/orders` (hỗ trợ áp Coupon nếu có).
- [ ] Tự động kích hoạt / cộng dồn `expiresAt` trong `/api/webhooks/payment` và `approve_order` khi đơn Membership thanh toán thành công.
- [ ] Cho phép hội viên còn hạn tải tài liệu đính kèm của khóa Membership tại `/api/resources/file/[name]` (chặn khi hết hạn).

## Task 4: API Quản Trị Membership (`/api/admin/membership`)
- [ ] CRUD gói Membership (`save_plan`, `toggle_plan`, `delete_plan`).
- [ ] Bật/tắt `includedInMembership` cho từng khóa học (`toggle_course_membership`).
- [ ] Đăng nhanh bài giảng cập nhật mới kèm `publishedAt` vào khóa Membership (`add_updated_lesson`).
- [ ] Cấp mới / cộng thêm ngày Membership thủ công cho học viên (`grant_days`).

## Task 5: Giao Diện Học Viên (`/membership`, `Navbar`, `CourseCard`, `Learn`, `MyLearning`)
- [ ] Tạo trang `/membership`: Bảng trạng thái hạn hội viên, 3 gói đăng ký/gia hạn VietQR ACB `49682677` tự dò mỗi 3s, danh sách Bài học mới cập nhật & Kho khóa học Membership.
- [ ] Thêm mục **Hội Viên VIP** trên `Navbar`, nhãn Membership trên `CourseCard` & `/courses/[slug]`, thẻ hạn hội viên trong `/my-learning`, và màn hình nhắc gia hạn trong `/learn/[slug]`.

## Task 6: Tab Quản Trị Membership trong `/admin` & Deploy Production
- [ ] Bổ sung tab **Hội Viên Membership** trong `/admin` (quản lý gói giá, đăng bài học cập nhật mới, bật/tắt khóa học trong Membership, cấp ngày cho học viên) + thêm tùy chọn `Membership` ở Course Studio.
- [ ] Chạy test suite, `tsc --noEmit`, `npm run build`, migrate Supabase thật (tạo bảng + nạp 3 gói + khóa Membership mẫu) và deploy `https://ohanaai-academy.vercel.app` + kiểm thử live.
