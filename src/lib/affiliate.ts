export const AFFILIATE_COOKIE_NAME = "ohana_ref";
export const AFFILIATE_COOKIE_DAYS = 30;
export const AFFILIATE_RATE_COURSE = 0.1; // 10% Khóa Thương Mại
export const AFFILIATE_RATE_MEMBERSHIP = 0.2; // 20% Gói Hội Viên Membership

export const VIETQR_BANKS: { id: string; name: string }[] = [
  { id: "ACB", name: "ACB — Ngân hàng Á Châu" },
  { id: "TCB", name: "Techcombank — Kỹ Thương Việt Nam" },
  { id: "VCB", name: "Vietcombank — Ngoại Thương Việt Nam" },
  { id: "MB", name: "MB Bank — Quân Đội" },
  { id: "BIDV", name: "BIDV — Đầu Tư và Phát Triển" },
  { id: "VPB", name: "VPBank — Việt Nam Thịnh Vượng" },
  { id: "CTG", name: "VietinBank — Công Thương Việt Nam" },
  { id: "TPB", name: "TPBank — Tiên Phong" },
  { id: "VIB", name: "VIB — Quốc Tế Việt Nam" },
  { id: "STB", name: "Sacombank — Sài Gòn Thương Tín" },
  { id: "SHB", name: "SHB — Sài Gòn Hà Nội" },
  { id: "HDB", name: "HDBank — Phát Triển TP.HCM" },
  { id: "MSB", name: "MSB — Hàng Hải Việt Nam" },
  { id: "OCB", name: "OCB — Phương Đông" },
  { id: "LPB", name: "LPBank — Lộc Phát Việt Nam" },
  { id: "EIB", name: "Eximbank — Xuất Nhập Khẩu" },
  { id: "CAKE", name: "CAKE by VPBank" },
  { id: "TIMO", name: "Timo by BVBank" },
];

export interface AffiliateUserLike {
  id: string;
  name?: string;
  email: string;
  phone?: string;
  role: string;
  referralCode?: string;
  referredByUserId?: string;
  affiliateEnabled?: boolean;
}

export interface AffiliateOrderLike {
  orderCode?: string;
  orderType?: "course" | "membership";
  courseTitle?: string;
  userId: string;
  customerName?: string;
  customerEmail?: string;
  finalAmount: number;
  status: string;
  referrerUserId?: string;
  referralCode?: string;
}

export interface AffiliateSubscriptionLike {
  userId: string;
  expiresAt?: string;
}

export interface AffiliateCommissionLike {
  id: string;
  orderCode: string;
  orderType: "course" | "membership";
  itemTitle: string;
  orderAmount: number;
  commissionRate: number;
  commissionAmount: number;
  referrerUserId: string;
  referrerName: string;
  referrerEmail: string;
  referrerPhone: string;
  referralCode: string;
  buyerUserId: string;
  buyerName: string;
  buyerEmail: string;
  status: "pending" | "paid" | "cancelled";
  payoutNote?: string;
  createdAt: string;
  paidAt?: string;
}

export function calculateAffiliateCommission(
  orderType: "course" | "membership" | undefined,
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

export function isUserAffiliateEligible(
  user: AffiliateUserLike | null | undefined,
  orders: AffiliateOrderLike[] = [],
  subscriptions: Record<string, AffiliateSubscriptionLike> = {}
): boolean {
  if (!user) return false;
  if (user.role === "admin" || user.role === "internal") return true;
  if (user.affiliateEnabled) return true;
  if (subscriptions && subscriptions[user.id]) return true;
  return (orders || []).some(
    (o) =>
      o.userId === user.id &&
      o.status === "paid" &&
      Number(o.finalAmount || 0) > 0
  );
}

export function generateReferralCode(name: string, userId: string): string {
  const ascii = String(name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  const prefix = (ascii.slice(0, 6) || "MEMBER").padEnd(3, "X");
  const idClean = String(userId || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  const suffix = (idClean.slice(-4) || "2026").padStart(4, "0");
  return `OHA-${prefix}${suffix}`;
}

export function maskEmail(email: string): string {
  const raw = String(email || "").trim();
  const at = raw.indexOf("@");
  if (at <= 1) return "***";
  const local = raw.slice(0, at);
  const domain = raw.slice(at);
  const shown = local.slice(0, Math.min(2, local.length));
  return `${shown}***${domain}`;
}

export function resolveReferrerForOrder<TUser extends AffiliateUserLike>(params: {
  buyer: TUser;
  explicitRefCode?: string;
  users: TUser[];
  orders: AffiliateOrderLike[];
  subscriptions: Record<string, AffiliateSubscriptionLike>;
}): TUser | null {
  const { buyer, explicitRefCode, users, orders, subscriptions } = params;
  if (!buyer) return null;

  let candidate: TUser | undefined;

  // 1. Ưu tiên người giới thiệu đã gắn trọn đời trên hồ sơ khách hàng (Recurring Membership)
  if (buyer.referredByUserId) {
    candidate = users.find((u) => u.id === buyer.referredByUserId);
  }

  // 2. Nếu chưa gắn trọn đời, tra theo mã ref từ cookie/link (?ref=CODE)
  if (!candidate && explicitRefCode) {
    const cleanCode = String(explicitRefCode).trim().toUpperCase();
    if (cleanCode) {
      candidate = users.find(
        (u) => (u.referralCode || "").trim().toUpperCase() === cleanCode
      );
    }
  }

  if (!candidate) return null;

  // 3. Chống tự giới thiệu bản thân (cùng userId hoặc cùng email)
  if (
    candidate.id === buyer.id ||
    candidate.email.trim().toLowerCase() === buyer.email.trim().toLowerCase()
  ) {
    return null;
  }

  // 4. Người giới thiệu phải đủ điều kiện Affiliate
  if (!isUserAffiliateEligible(candidate, orders, subscriptions)) {
    return null;
  }

  return candidate;
}

export function createCommissionForPaidOrder(params: {
  order: AffiliateOrderLike;
  referrer: AffiliateUserLike | null | undefined;
  existingCommissions: AffiliateCommissionLike[];
  nowMs?: number;
}): AffiliateCommissionLike | null {
  const { order, referrer, existingCommissions, nowMs = Date.now() } = params;
  if (!order || !referrer) return null;
  if (order.status !== "paid") return null;
  if (!order.orderCode) return null;

  const orderAmount = Math.max(0, Math.round(Number(order.finalAmount) || 0));
  if (orderAmount <= 0) return null;

  // Chống tự giới thiệu
  if (
    referrer.id === order.userId ||
    (order.customerEmail &&
      referrer.email.trim().toLowerCase() ===
        order.customerEmail.trim().toLowerCase())
  ) {
    return null;
  }

  // Idempotent theo orderCode
  const alreadyExists = (existingCommissions || []).some(
    (c) => c.orderCode.toUpperCase() === order.orderCode!.toUpperCase()
  );
  if (alreadyExists) return null;

  const orderType = order.orderType === "membership" ? "membership" : "course";
  const { rate, amount } = calculateAffiliateCommission(orderType, orderAmount);
  if (amount <= 0) return null;

  return {
    id: `aff-${order.orderCode}-${nowMs}`,
    orderCode: order.orderCode,
    orderType,
    itemTitle: order.courseTitle || "Sản phẩm Ohana Academy",
    orderAmount,
    commissionRate: rate,
    commissionAmount: amount,
    referrerUserId: referrer.id,
    referrerName: referrer.name || referrer.email,
    referrerEmail: referrer.email,
    referrerPhone: referrer.phone || "",
    referralCode:
      order.referralCode ||
      referrer.referralCode ||
      generateReferralCode(referrer.name || referrer.email, referrer.id),
    buyerUserId: order.userId,
    buyerName: order.customerName || "Học viên Ohana",
    buyerEmail: order.customerEmail || "",
    status: "pending",
    createdAt: new Date(nowMs).toISOString(),
  };
}
