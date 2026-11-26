import { NextRequest, NextResponse } from "next/server";
import { evaluateCoupon } from "@/lib/coupons";
import { readServerDb } from "@/lib/server-db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = String(body.code || "").trim();
    const courseId = String(body.courseId || "").trim();

    if (!code || !courseId) {
      return NextResponse.json(
        { valid: false, error: "Vui lòng nhập mã ưu đãi hợp lệ." },
        { status: 400 }
      );
    }

    const db = await readServerDb();
    const course = db.courses.find((c) => c.id === courseId);
    if (!course) {
      return NextResponse.json(
        { valid: false, error: "Không tìm thấy khóa học." },
        { status: 404 }
      );
    }

    const result = evaluateCoupon(db.coupons || [], code, course.id, course.price);
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
