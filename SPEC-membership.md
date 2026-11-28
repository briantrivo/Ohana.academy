# Spec: Hệ Thống Hội Viên Định Kỳ — Ohana Membership (Đóng Phí Hàng Tháng & Học Bài Cập Nhật)

## 1. Objective
Xây dựng tính năng **Ohana Membership (Gói Hội Viên Hàng Tháng / Quý / Năm)** tích hợp đồng bộ vào nền tảng **Ohana AI Academy (`https://ohanaai-academy.vercel.app`)**:
- **Đối với Học viên / Hội viên**: Đăng ký gói Hội viên theo tháng (30 ngày), quý (90 ngày) hoặc năm (365 ngày) qua **VietQR ACB (`49682677` - `VO QUOC TRI`) + SePay tự động kích hoạt trong 3 giây**; truy cập không giới hạn kho bài giảng cập nhật liên tục hàng tuần/tháng khi còn hạn; theo dõi số ngày còn lại tại `/membership` & `/my-learning`; gia hạn cộng dồn ngày tự động bất cứ lúc nào.
- **Đối với Quản trị viên (`admin`)**: Tạo/chỉnh sửa các gói Membership (giá, số ngày, quyền lợi, bật/tắt), đánh dấu khóa học thuộc quyền lợi Membership (`accessType: "membership"` hoặc `includedInMembership: true`), đăng bài học cập nhật mới (kèm mốc thời gian `publishedAt` hiển thị bảng tin "Bài học mới cập nhật"), và cấp/gia hạn ngày Membership thủ công cho học viên chốt qua Zalo/Offline.

## 2. Tech Stack
- **Framework**: Next.js `15.5.29` (App Router), React `19`, TypeScript `5`
- **Styling & Icons**: Tailwind CSS `v4`, `lucide-react`
- **Database & Persistence**: Supabase PostgreSQL (`@supabase/supabase-js`, `pg`) với Row Level Security (RLS) bật trên toàn bộ bảng; fallback JSON local khi chạy dev không gắn Supabase
- **Authentication**: Cookie phiên `HttpOnly` ký HMAC-SHA256 (`ohana_session`) + Google OAuth 2.0 PKCE
- **Payment & Auto-Activation**: VietQR (`ACB 49682677`) + Webhook SePay (`/api/webhooks/payment`, xác thực `PAYMENT_WEBHOOK_SECRET` bằng `crypto.timingSafeEqual`)

## 3. Commands
```powershell
# Kiểm tra kiểu tĩnh TypeScript
npx.cmd tsc --noEmit

# Build kiểm tra Production
npm.cmd run build

# Chạy môi trường phát triển local
npm.cmd run dev

# Deploy Production lên Vercel
npx.cmd --yes vercel --prod --yes
```

## 4. Project Structure
```text
ohana-academy-lms/
├── supabase/schema.sql                     # Bổ sung bảng ohana_membership_plans & ohana_subscriptions (bật RLS)
├── src/
│   ├── types/lms.ts                        # Thêm CourseAccessType="membership", MembershipPlan, UserSubscription, Lesson.publishedAt
│   ├── lib/
│   │   ├── membership.ts                   # Logic tính hạn dùng, cộng dồn ngày gia hạn, kiểm tra quyền học Membership & lọc bài mới cập nhật
│   │   ├── supabase.ts                     # Auto-migration tạo bảng ohana_membership_plans & ohana_subscriptions
│   │   ├── server-db.ts                    # Đọc/ghi đồng bộ plans & subscriptions trên Supabase
│   │   └── auth.ts                         # Chỉ trả subscription của chính user hiện tại (Admin thấy toàn bộ để quản trị)
│   ├── app/
│   │   ├── membership/page.tsx             # Trang Hội viên VIP: Bảng giá gói tháng/quý/năm, Bảng tin Bài học mới cập nhật, Thanh toán/Gia hạn VietQR
│   │   ├── my-learning/page.tsx            # Thẻ trạng thái Hội viên (Còn X ngày / Đã hết hạn + nút Gia hạn nhanh)
│   │   ├── learn/[slug]/page.tsx           # Kiểm tra hạn Membership theo thời gian thực; hiện màn hình nhắc gia hạn nếu hết hạn
│   │   ├── admin/page.tsx                  # Tab Quản trị Membership: Cấu hình gói giá, danh sách hội viên, cấp/gia hạn ngày thủ công
│   │   └── api/
│   │       ├── membership/orders/route.ts  # Tạo đơn đăng ký/gia hạn Membership VietQR (áp dụng được cả Coupon nếu có)
│   │       ├── admin/membership/route.ts   # CRUD gói Membership & cấp/cộng ngày thủ công cho user
│   │       └── webhooks/payment/route.ts   # Mở rộng nhận diện đơn Membership (cộng dồn expires_at tự động khi SePay báo tiền vào)
```

## 5. Code Style & Core Domain Logic
Quy tắc cộng dồn thời hạn khi thanh toán gói mới (không làm mất ngày còn lại của hội viên gia hạn sớm):
```ts
export function computeExtendedExpiry(
  currentExpiresAt: string | undefined,
  durationDays: number,
  nowMs: number = Date.now()
): { startedAt: string; expiresAt: string } {
  const currentExpMs = currentExpiresAt ? new Date(currentExpiresAt).getTime() : 0;
  const baseMs = !Number.isNaN(currentExpMs) && currentExpMs > nowMs ? currentExpMs : nowMs;
  const nextExpMs = baseMs + durationDays * 24 * 60 * 60 * 1000;
  return {
    startedAt: new Date(nowMs).toISOString(),
    expiresAt: new Date(nextExpMs).toISOString(),
  };
}
```

## 6. Testing Strategy
- **Unit / Logic Tests**: Viết script kiểm thử tự động kiểm tra logic `computeExtendedExpiry` (đăng ký mới, gia hạn khi đang còn hạn -> cộng dồn chuẩn xác, gia hạn sau khi đã hết hạn -> tính từ hiện tại), kiểm tra quyền truy cập khóa học khi còn hạn vs hết hạn, và kiểm tra chống lộ dữ liệu hội viên khác trên `/api/state`.
- **Build & Type Verification**: `npx.cmd tsc --noEmit` & `npm.cmd run build` đạt `0` lỗi.
- **Live Production Verification**: Kiểm tra trực tiếp trên `https://ohanaai-academy.vercel.app` các trang `/membership`, `/api/membership/orders` (chặn chưa đăng nhập `401`), `/api/admin/membership` (chặn non-admin `401`/`403`) và luồng Webhook SePay.

## 7. Boundaries
- **Always do**:
  - Kiểm tra hạn Membership (`expiresAt > now`) ở **cả phía Server API** (tải tài liệu `/api/resources/file/[name]`, cấp chứng chỉ) lẫn giao diện phòng học (`/learn/[slug]`).
  - Bảo toàn 100% lịch sử tiến độ bài học (`ohana_lesson_progress`) kể cả khi hội viên tạm hết hạn.
  - Bật RLS trên mọi bảng Supabase mới tạo (`ohana_membership_plans`, `ohana_subscriptions`).
- **Ask first**:
  - Mức giá khởi tạo của các gói Tháng / Quý / Năm và phạm vi khóa học nằm trong Membership.
- **Never do**:
  - Làm ảnh hưởng quyền truy cập trọn đời của học viên đã mua đứt khóa học thương mại lẻ (`commercial`).
  - Lộ danh sách hội viên và ngày hết hạn của người khác cho tài khoản `student` trên `/api/state`.

## 8. Success Criteria
1. Thanh điều hướng có mục **Membership (Hội Viên)** dẫn tới `/membership` hiển thị rõ bảng giá gói định kỳ, trạng thái hội viên hiện tại và danh sách **"Bài học mới cập nhật"**.
2. Học viên đăng nhập có thể chọn gói (VD: 1 tháng / 3 tháng / 12 tháng), tạo mã **VietQR ACB `49682677`** và ngay khi SePay bắn Webhook thanh toán hợp lệ, hạn hội viên tự động kích hoạt hoặc cộng dồn nối tiếp ngày ngay trong 3 giây.
3. Khi còn hạn, hội viên vào học trọn bộ khóa/bài giảng Membership (xem video + tải file đính kèm); ngay khi quá hạn `expiresAt`, phòng học tự khóa lại với thông báo mời gia hạn nhưng vẫn giữ nguyên tiến độ cũ.
4. Trong `/admin`, Quản trị viên có thể: (a) chỉnh sửa giá/số ngày/bật tắt gói Membership, (b) tạo khóa học loại `Membership` hoặc tích chọn khóa học đưa vào Membership, và (c) cấp mới / cộng thêm ngày thủ công cho bất kỳ học viên nào.

## 9. Open Questions
1. **Phạm vi nội dung Membership**: Chỉ mở **Kho khóa học / chuyên đề Membership riêng** (tách biệt với khóa chính `6.600.000đ`), hay cho phép Admin tích chọn linh hoạt từng khóa?
2. **Bảng giá khởi tạo mặc định** cho gói 1 Tháng / 3 Tháng / 12 Tháng trước khi anh tự tinh chỉnh trong `/admin`?
3. **Khởi tạo sẵn 1 khóa mẫu "Kho Bài Học AI Cập Nhật Hàng Tuần (Membership)"** để anh chỉ việc bấm thêm video mới vào từng tuần/tháng luôn không?
