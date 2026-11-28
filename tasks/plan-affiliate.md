# Implementation Plan: Hệ Thống Affiliate (Cộng Tác Viên Giới Thiệu)

## Overview
Triển khai hệ thống **Ohana Affiliate** trên `https://ohanaai-academy.vercel.app` cho phép Học viên đã mua khóa học / Gói Membership, Nhân sự nội bộ, Admin (và CTV được Admin bật thủ công) lấy mã & link giới thiệu (`?ref=CODE`) hưởng **10% Khóa Thương Mại** và **20% Gói Hội Viên Membership** (bao gồm trọn đời các lần gia hạn sau của khách đã gắn `referred_by_user_id`), kèm trang `/affiliate` cấu hình ngân hàng nhận tiền và tab **Hoa Hồng Affiliate** trong `/admin` tích hợp sẵn **mã VietQR chuyển hoa hồng** & trạng thái đối soát chi trả.

## Architecture Decisions
1. **Attribution trọn đời kết hợp Cookie 30 ngày**:
   - Component `ReferralTracker` đặt trong `RootLayout` tự động bắt `?ref=CODE` trên mọi URL và lưu cookie `ohana_ref` trong 30 ngày.
   - Khi khách tạo đơn đầu tiên (hoặc đăng ký tài khoản), hệ thống kiểm tra tính hợp lệ của người giới thiệu (đủ điều kiện Affiliate, không trùng `userId`/`email`) và lưu cố định `referred_by_user_id` trên `ohana_users`. Từ đó các kỳ gia hạn Membership tháng sau vẫn tự động tính 20% hoa hồng mà không cần bấm lại link.
2. **Idempotent Commission Creation**:
   - Bảng `ohana_affiliate_commissions` dùng `order_code` làm khóa duy nhất (`unique`); hàm `createCommissionForPaidOrder` kiểm tra trùng `orderCode` trước khi tạo mới, chỉ chạy khi đơn đạt `status === "paid"` và `finalAmount > 0`.
3. **Privacy & RLS**:
   - Bật RLS trên `ohana_affiliate_commissions`.
   - Tại `buildClientStateView`: Học viên chỉ nhìn thấy danh sách hoa hồng của chính mình (ẩn email đầy đủ của khách mua, chỉ hiện tên khách/sản phẩm/số tiền hoa hồng/trạng thái chi trả) và thông tin STK của chính mình; Admin thấy toàn bộ để đối soát & chuyển khoản.
4. **VietQR Payout trực tiếp trong Admin**:
   - Sử dụng lại hàm `buildVietQrUrl` hiện có với `bankId`, `accountNo`, `accountName` mà cộng tác viên khai báo và nội dung chuyển khoản `HH <orderCode>` để Admin quét chuyển hoa hồng trong 3 giây rồi bấm **Đánh dấu Đã chuyển khoản**.

## Task List
- **Task 1**: Viết `tests/affiliate.test.mjs` (TDD Red → Green) và `src/lib/affiliate.ts` (tính 10%/20%, điều kiện mở quyền, chống self-referral, idempotent, sinh mã `OHA-...`, danh sách ngân hàng VietQR).
- **Task 2**: Nâng cấp `src/types/lms.ts`, `src/lib/supabase.ts`, `supabase/schema.sql`, `src/lib/server-db.ts`, `src/lib/auth.ts`, `src/context/LMSContext.tsx`.
- **Task 3**: Xây dựng `POST/GET /api/affiliate`, `POST /api/admin/affiliate`, và tích hợp sinh hoa hồng vào `/api/orders`, `/api/webhooks/payment`, `/api/auth/register`, `/api/auth/google/callback`.
- **Task 4**: Xây dựng `ReferralTracker`, trang `/affiliate`, cập nhật `Navbar`, `/my-learning`, `/checkout/[slug]`, `/membership`.
- **Task 5**: Thêm tab **Hoa Hồng Affiliate** (kèm Modal/QR VietQR chuyển hoa hồng & nút Bật/Tắt quyền CTV cho user) trong `/admin`.
- **Task 6**: Chạy full test suite, `tsc --noEmit`, `npm run build`, migrate Supabase thật, deploy Production `https://ohanaai-academy.vercel.app`, và kiểm thử bảo mật + chức năng live.
