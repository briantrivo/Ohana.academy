import { NextRequest, NextResponse } from "next/server";
import { evaluateCoupon } from "@/lib/coupons";
import { readServerDb } from "@/lib/server-db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = String(body.code || "").trim();
    const courseId = String(body.courseId || "").trim();
    const planId = String(body.planId || "").trim();

    if (!code || (!courseId && !planId)) {
      return NextResponse.json(
        { valid: false, error: "Vui lòng nhập mã ưu đãi hợp lệ." },
        { status: 400 }
      );
    }

    const db = await readServerDb();
    let targetId = courseId;
    let basePrice = 0;

    if (planId) {
      const plan = (db.membershipPlans || []).find(
        (p) => p.id === planId && p.active
      );
      if (!plan) {
        return NextResponse.json(
          { valid: false, error: "Không tìm thấy gói Hội viên." },
          { status: 404 }
        );
      }
      targetId = `membership:${plan.id}`;
      basePrice = plan.price;
    } else {
      const course = db.courses.find((c) => c.id === courseId);
      if (!course) {
        return NextResponse.json(
          { valid: false, error: "Không tìm thấy khóa học." },
          { status: 404 }
        );
      }
      targetId = course.id;
      basePrice = course.price;
    }

    const result = evaluateCoupon(db.coupons || [], code, targetId, basePrice);
    if (!result.valid) {
      return NextResponse.json(
        { valid: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      code: result.coupon.code,
      label: result.coupon.label,
      discountType: result.coupon.discountType,
      discountValue: result.coupon.discountValue,
      discountAmount: result.discountAmount,
      finalAmount: result.finalAmount,
    });
  } catch (err) {
    return NextResponse.json(
      { valid: false, error: "Không thể kiểm tra mã ưu đãi: " + String(err) },
      { status: 500 }
    );
  }
}
