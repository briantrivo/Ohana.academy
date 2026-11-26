import { CouponRecord } from "@/types/lms";

export const DEFAULT_INITIAL_COUPONS: CouponRecord[] = [
  {
    code: "OHANA500",
    label: "Ưu đãi Cộng đồng Ohana (-500.000đ)",
    discountType: "fixed",
    discountValue: 500000,
    targetCourseId: "ALL",
    maxUses: 100,
    usedCount: 0,
    active: false,
    createdAt: "2026-11-01T08:00:00.000Z",
  },
  {
    code: "TRIVO10",
    label: "Mã giới thiệu Giám đốc Brian Võ (-10%)",
    discountType: "percent",
    discountValue: 10,
    targetCourseId: "ALL",
    maxUses: 100,
    usedCount: 0,
    active: false,
    createdAt: "2026-11-01T08:05:00.000Z",
  },
];

export type CouponEvaluationResult =
  | {
      valid: true;
      coupon: CouponRecord;
      discountAmount: number;
      finalAmount: number;
    }
  | {
      valid: false;
      error: string;
    };

export function evaluateCoupon(
  coupons: CouponRecord[],
  rawCode: string,
  courseId: string,
  coursePrice: number
): CouponEvaluationResult {
  const cleanCode = String(rawCode || "").trim().toUpperCase();
  if (!cleanCode) {
    return { valid: false, error: "Vui lòng nhập mã ưu đãi." };
  }

  const invalidMsg = "Mã ưu đãi không hợp lệ hoặc đã hết hiệu lực.";
  const found = (coupons || []).find(
    (c) => c.code.toUpperCase() === cleanCode
  );

  if (!found || !found.active) {
    return { valid: false, error: invalidMsg };
  }

  if (found.targetCourseId !== "ALL" && found.targetCourseId !== courseId) {
    return { valid: false, error: invalidMsg };
  }

  if (found.expiresAt) {
    const expMs = new Date(found.expiresAt).getTime();
    if (!Number.isNaN(expMs) && Date.now() > expMs) {
      return { valid: false, error: invalidMsg };
    }
  }

  if (found.maxUses > 0 && found.usedCount >= found.maxUses) {
    return { valid: false, error: invalidMsg };
  }

  const rawDiscount =
    found.discountType === "percent"
      ? Math.round((coursePrice * Math.min(100, Math.max(0, found.discountValue))) / 100)
      : Math.max(0, Math.round(found.discountValue));

  const discountAmount = Math.min(coursePrice, rawDiscount);
  const finalAmount = Math.max(0, coursePrice - discountAmount);

  return {
    valid: true,
    coupon: found,
    discountAmount,
    finalAmount,
  };
}
