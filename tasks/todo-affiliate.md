# Tasks: Hệ Thống Affiliate (Cộng Tác Viên Giới Thiệu)

## Task 1: Domain Logic & TDD (`src/lib/affiliate.ts` + `tests/affiliate.test.mjs`)
- [ ] Viết bộ test TDD kiểm tra tỷ lệ 10%/20%, điều kiện mở quyền, attribution trọn đời, chống tự giới thiệu, idempotent theo `orderCode`.
- [ ] Triển khai `src/lib/affiliate.ts` và xác nhận tất cả tests PASS.

## Task 2: Schema Supabase, Types & Persistence
- [ ] Nâng cấp `src/types/lms.ts`, `src/lib/supabase.ts`, `supabase/schema.sql`, `src/lib/server-db.ts`, `src/lib/auth.ts`, `src/context/LMSContext.tsx`.

## Task 3: APIs & SePay Auto-Commission
- [ ] Tạo `/api/affiliate` (kích hoạt mã ref + lưu thông tin ngân hàng & Zalo nhận hoa hồng).
- [ ] Tạo `/api/admin/affiliate` (đánh dấu đã chuyển khoản / hủy / bật quyền CTV cho user).
- [ ] Tích hợp gắn `referrerUserId` & tự sinh hoa hồng trong `/api/orders`, `/api/webhooks/payment`, `/api/auth/register`, `/api/auth/google/callback`.

## Task 4: Frontend Learner Affiliate & Tracking
- [ ] Tạo `ReferralTracker` bắt `?ref=CODE` lưu cookie `ohana_ref` 30 ngày trong `layout.tsx`.
- [ ] Tạo trang `/affiliate` (lấy link chia sẻ 1 chạm, nhập STK ngân hàng, xem thống kê & lịch sử hoa hồng).
- [ ] Cập nhật `Navbar`, `/my-learning`, `/checkout/[slug]`, `/membership`.

## Task 5: Tab Hoa Hồng Affiliate trong `/admin`
- [ ] Bổ sung tab **Hoa Hồng Affiliate** (KPI chờ trả/đã trả, danh sách hoa hồng, sinh mã VietQR chuyển khoản cho CTV, nút Đánh dấu Đã chuyển khoản, và nút Bật/Tắt quyền Affiliate cho user).

## Task 6: Verify, Migrate Supabase & Deploy Production
- [ ] Chạy unit tests, `tsc --noEmit`, `npm run build`, migrate Supabase thật, deploy `https://ohanaai-academy.vercel.app` & kiểm thử live.
