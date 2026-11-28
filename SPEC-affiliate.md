# Spec: Hệ Thống Cộng Tác Viên Giới Thiệu — Ohana Affiliate

## 1. Objective
Xây dựng tính năng **Affiliate (Giới Thiệu Nhận Hoa Hồng)** tích hợp trực tiếp vào **Ohana AI Academy (`https://ohanaai-academy.vercel.app`)**, biến học viên đã mua khóa học / hội viên thành kênh lan tỏa tự nhiên:
- **Học viên đủ điều kiện Affiliate**: Nhận mã & link giới thiệu cá nhân (`?ref=CODE`), chia sẻ link Trang chủ, từng Khóa học thương mại hoặc trang `/membership`; cập nhật thông tin ngân hàng + SĐT Zalo nhận hoa hồng; theo dõi minh bạch số đơn thành công, hoa hồng chờ chi trả và hoa hồng đã nhận tại `/affiliate` (và liên kết từ `/my-learning`).
- **Tỷ lệ hoa hồng mặc định**:
  - **Khóa Thương Mại (`orderType = "course"`)**: **`10%`** trên `finalAmount` (số tiền thực thu sau mã giảm giá).
  - **Gói Hội Viên Membership (`orderType = "membership"`)**: **`20%`** trên `finalAmount`.
- **Quản trị viên (`admin`)**: Theo dõi toàn bộ hoa hồng phát sinh theo từng đơn đã thanh toán tại tab **Hoa Hồng Affiliate** trong `/admin`, xem thông tin Zalo & Ngân hàng của người giới thiệu, quét nhanh **mã VietQR sinh sẵn cho đúng STK người giới thiệu** để chuyển tiền và bấm **Đánh dấu Đã chuyển khoản** (lưu thời điểm chi trả & ghi chú giao dịch).

## 2. Tech Stack
- **Framework**: Next.js `15.5.29` (App Router), React `19`, TypeScript `5`
- **Styling & Icons**: Tailwind CSS `v4`, `lucide-react`
- **Database**: Supabase PostgreSQL (`@supabase/supabase-js`, `pg`) + RLS trên toàn bộ bảng
- **Authentication**: Cookie `HttpOnly` HMAC-SHA256 (`ohana_session`) + Google OAuth 2.0 PKCE
- **Payment Integration**: Tự động ghi nhận hoa hồng ngay trong `/api/webhooks/payment` (SePay ACB) và `approve_order` (`/api/orders`)

## 3. Commands
```powershell
# Chạy unit tests logic Affiliate & Membership
node --test tests/membership.test.mjs tests/affiliate.test.mjs

# Kiểm tra TypeScript
npx.cmd tsc --noEmit

# Build Production
npm.cmd run build

# Deploy Production
npx.cmd --yes vercel --prod --yes
```

## 4. Project Structure
```text
ohana-academy-lms/
├── supabase/schema.sql                      # Bổ sung bảng ohana_affiliate_commissions & cột referral/bank trên ohana_users, ohana_orders
├── tests/affiliate.test.mjs                 # Unit tests TDD cho tính hoa hồng 10%/20%, chống tự giới thiệu, điều kiện mở quyền, tổng hợp chi trả
├── src/
│   ├── types/lms.ts                         # Thêm AffiliatePayoutInfo, AffiliateCommission, referralCode/referredByUserId trên UserRecord & Order
│   ├── lib/
│   │   ├── affiliate.ts                     # Pure domain logic: sinh mã ref, kiểm tra đủ điều kiện Affiliate, tính hoa hồng 10%/20%, chống self-referral
│   │   ├── supabase.ts                      # Auto-migration bảng ohana_affiliate_commissions & cột mới (bật RLS)
│   │   ├── server-db.ts                     # Đọc/ghi đồng bộ affiliate commissions & user payout info trên Supabase
│   │   └── auth.ts                          # Lọc bảo mật: user thường chỉ thấy hoa hồng của chính mình (ẩn email khách mua); Admin thấy toàn bộ
│   ├── components/
│   │   └── ReferralTracker.tsx              # Tự động bắt ?ref=CODE trên mọi trang và lưu cookie ohana_ref (30 ngày)
│   └── app/
│       ├── affiliate/page.tsx               # Cổng Affiliate cho học viên: Link chia sẻ, Cấu hình STK nhận tiền, Thống kê & Lịch sử hoa hồng
│       ├── my-learning/page.tsx             # Thẻ quyền lợi Affiliate & nút vào Cổng Affiliate
│       ├── checkout/[slug]/page.tsx         # Gửi kèm mã ref (từ cookie) khi tạo đơn + hiện thông báo gọn nếu có người giới thiệu
│       ├── membership/page.tsx              # Gửi kèm mã ref (từ cookie) khi đăng ký gói Membership
│       ├── admin/page.tsx                   # Tab Hoa Hồng Affiliate: Tổng chờ trả/đã trả, bảng chi tiết, VietQR chuyển hoa hồng & nút Đã chuyển khoản
│       └── api/
│           ├── affiliate/route.ts           # Học viên kích hoạt/lấy mã ref & lưu thông tin Ngân hàng / Zalo nhận hoa hồng
│           ├── admin/affiliate/route.ts     # Admin đánh dấu Đã chuyển khoản / Hủy hoa hồng / Bật quyền Affiliate cho học viên
│           ├── orders/route.ts              # Gắn referrer_user_id khi tạo đơn & sinh commission khi approve_order
│           └── webhooks/payment/route.ts    # Tự động sinh bản ghi hoa hồng (10% / 20%) khi SePay xác nhận tiền vào
```

## 5. Code Style & Core Domain Logic
```ts
export const AFFILIATE_RATE_COURSE = 0.10;     // 10% Khóa Thương Mại
export const AFFILIATE_RATE_MEMBERSHIP = 0.20; // 20% Gói Hội Viên Membership

export function calculateAffiliateCommission(
  orderType: "course" | "membership",
  finalAmount: number
): { rate: number; amount: number } {
  const safeAmount = Math.max(0, Math.round(Number(finalAmount) || 0));
  const rate =
    orderType === "membership"
      ? AFFILIATE_RATE_MEMBERSHIP
      : AFFILIATE_RATE_COURSE;
  return {
    rate,
    amount: Math.round(safeAmount * rate),
  };
}
```

## 6. Testing Strategy
- **Unit tests (`tests/affiliate.test.mjs`)**:
  - Tính chính xác `10%` cho khóa thương mại (kể cả sau khi áp coupon) và `20%` cho gói Membership (1/3/12 tháng).
  - Không phát sinh hoa hồng cho đơn `0đ` hoặc đơn tự mua (trùng `userId` hoặc trùng `email`).
  - Không tạo trùng hoa hồng nếu webhook bị gửi lại 2 lần cho cùng `orderCode` (idempotent theo `order_code`).
  - Kiểm tra điều kiện mở quyền Affiliate (đã mua khóa học/Membership hoặc được Admin cấp quyền).
- **TypeScript & Build**: `npx.cmd tsc --noEmit` & `npm.cmd run build` đạt `0` lỗi.
- **Live Production Verification**: Kiểm tra `/affiliate`, `/api/affiliate` (`401` khi chưa đăng nhập), `/api/admin/affiliate` (`401`/`403` cho non-admin), và kiểm tra `/api/state` không rò rỉ STK ngân hàng hay hoa hồng của người khác.

## 7. Boundaries
- **Always do**:
  - Đảm bảo **idempotent** theo `order_code` (1 đơn hàng thanh toán thành công chỉ tạo tối đa 1 bản ghi hoa hồng).
  - Chặn tự giới thiệu bản thân (`referrerUserId !== buyerUserId` và `referrerEmail !== buyerEmail`).
  - Bật RLS trên bảng `ohana_affiliate_commissions` và lọc dữ liệu theo `userId` tại `buildClientStateView`.
- **Ask first**:
  - Ai đủ điều kiện mở quyền Affiliate (chỉ học viên đã mua khóa/Membership hay mọi tài khoản).
  - Hoa hồng Membership 20% có tính tiếp cho các kỳ gia hạn sau của cùng khách hàng không.
- **Never do**:
  - Lộ thông tin tài khoản ngân hàng hoặc hoa hồng của người giới thiệu này cho học viên khác.
  - Tính hoa hồng trên đơn chưa thanh toán (`pending`) hoặc đơn bị hủy.

## 8. Success Criteria
1. Học viên đủ điều kiện vào `/affiliate` thấy ngay **Mã & Link giới thiệu cá nhân** (copy 1 chạm cho Trang chủ, Khóa 6.6tr, Gói Membership) và lưu được **Ngân hàng / STK / Tên chủ TK / SĐT Zalo** vào Supabase.
2. Khách truy cập bằng link `?ref=CODE` được lưu cookie 30 ngày; khi mua khóa thương mại hoặc gói Membership và thanh toán thành công qua SePay Webhook hoặc Admin duyệt tay, hệ thống tự động tạo bản ghi hoa hồng `10%` (Khóa thương mại) hoặc `20%` (Membership) trong bảng `ohana_affiliate_commissions`.
3. Trong `/admin` → tab **Hoa Hồng Affiliate**, Admin xem rõ tổng hoa hồng chờ chi trả, danh sách từng đơn kèm thông tin liên hệ Zalo & Ngân hàng của người giới thiệu, mở nhanh mã VietQR đúng STK/số tiền hoa hồng và bấm **Đánh dấu Đã chuyển khoản**.
4. Người giới thiệu kiểm tra lại trên `/affiliate` thấy trạng thái hoa hồng cập nhật thành **Đã chi trả** cùng ngày thanh toán.

## 9. Open Questions
1. **Điều kiện mở tính năng Affiliate**: Chỉ tự mở cho **Học viên đã mua khóa học / Gói Membership + Nhân sự Nội bộ / Admin** (và Admin có thể bật tay cho CTV ngoài), hay mở luôn cho **tất cả mọi người đăng ký tài khoản**?
2. **Hoa hồng Membership 20% khi khách gia hạn tháng tiếp theo**: Tính **trọn đời theo mọi lần gia hạn** của khách đó (Recurring Affiliate — gắn cố định người giới thiệu đầu tiên), hay **chỉ tính cho các đơn phát sinh trong thời hạn cookie 30 ngày**?
3. Anh duyệt bản Spec này để em triển khai đầy đủ từ Supabase, API đến giao diện Học viên & Admin luôn nhé?
