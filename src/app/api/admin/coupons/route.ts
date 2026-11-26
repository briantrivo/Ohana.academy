import { NextRequest, NextResponse } from "next/server";
import { buildClientStateView, getAuthUser } from "@/lib/auth";
import { readServerDb, writeServerDb } from "@/lib/server-db";
import { CouponRecord, DiscountType } from "@/types/lms";

async function requireAdmin(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) {
    return {
      error: NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 }),
    };
  }
  if (authUser.role !== "admin") {
    return {
      error: NextResponse.json(
        { error: "Chỉ Quản trị viên mới có quyền quản lý mã giảm giá." },
        { status: 403 }
      ),
    };
  }
  return { authUser };
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;
  const db = await readServerDb();
  return NextResponse.json({ coupons: db.coupons || [] });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth.error || !auth.authUser) return auth.error;

  try {
    const body = await req.json();
    const rawCode = String(body.code || "")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9_-]/g, "");
    const label = String(body.label || "").trim();
    const discountType: DiscountType =
      body.discountType === "percent" ? "percent" : "fixed";
    const discountValue = Number(body.discountValue || 0);
    const targetCourseId = String(body.targetCourseId || "ALL").trim() || "ALL";
    const maxUses = Math.max(0, Math.floor(Number(body.maxUses ?? 100)));
    const active = body.active !== undefined ? Boolean(body.active) : true;
    const expiresAtRaw = String(body.expiresAt || "").trim();

    if (!rawCode || rawCode.length < 3) {
      return NextResponse.json(
        { error: "Mã giảm giá cần tối thiểu 3 ký tự (chữ không dấu, số, - hoặc _)." },
        { status: 400 }
      );
    }
    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      return NextResponse.json(
        { error: "Giá trị giảm phải lớn hơn 0." },
        { status: 400 }
      );
    }
    if (discountType === "percent" && discountValue > 100) {
      return NextResponse.json(
        { error: "Giảm theo phần trăm không được vượt quá 100%." },
        { status: 400 }
      );
    }

    let expiresAt: string | undefined;
    if (expiresAtRaw) {
      const parsed = new Date(expiresAtRaw);
      if (Number.isNaN(parsed.getTime())) {
        return NextResponse.json(
          { error: "Ngày hết hạn không hợp lệ." },
          { status: 400 }
        );
      }
      expiresAt = parsed.toISOString();
    }

    const db = await readServerDb();
    db.coupons = db.coupons || [];
    const existing = db.coupons.find((c) => c.code.toUpperCase() === rawCode);

    const record: CouponRecord = {
      code: rawCode,
      label:
        label ||
        (discountType === "percent"
          ? `Ưu đãi giảm ${discountValue}%`
          : `Ưu đãi giảm ${new Intl.NumberFormat("vi-VN").format(discountValue)}đ`),
      discountType,
      discountValue: Math.round(discountValue),
      targetCourseId,
      maxUses,
      usedCount: existing ? existing.usedCount : 0,
      active,
      expiresAt,
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
    };

    db.coupons = db.coupons.filter((c) => c.code.toUpperCase() !== rawCode);
    db.coupons.unshift(record);
    await writeServerDb(db);

    return NextResponse.json({
      success: true,
      coupon: record,
      db: buildClientStateView(db, auth.authUser),
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Không thể lưu mã giảm giá: " + String(err) },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth.error || !auth.authUser) return auth.error;

  try {
    const body = await req.json();
    const code = String(body.code || "").trim().toUpperCase();
    if (!code) {
      return NextResponse.json({ error: "Thiếu mã giảm giá." }, { status: 400 });
    }

    const db = await readServerDb();
    db.coupons = db.coupons || [];
    const target = db.coupons.find((c) => c.code.toUpperCase() === code);
    if (!target) {
      return NextResponse.json(
        { error: "Không tìm thấy mã giảm giá này." },
        { status: 404 }
      );
    }

    if (typeof body.active === "boolean") {
      target.active = body.active;
    }
    if (body.maxUses !== undefined) {
      target.maxUses = Math.max(0, Math.floor(Number(body.maxUses)));
    }
    if (body.label !== undefined) {
      target.label = String(body.label).trim() || target.label;
    }

    await writeServerDb(db);
    return NextResponse.json({
      success: true,
      coupon: target,
      db: buildClientStateView(db, auth.authUser),
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Không thể cập nhật mã giảm giá: " + String(err) },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth.error || !auth.authUser) return auth.error;

  try {
    const { searchParams } = new URL(req.url);
    const code = String(searchParams.get("code") || "").trim().toUpperCase();
    if (!code) {
      return NextResponse.json({ error: "Thiếu mã cần xóa." }, { status: 400 });
    }

    const db = await readServerDb();
    db.coupons = (db.coupons || []).filter((c) => c.code.toUpperCase() !== code);
    await writeServerDb(db);

    return NextResponse.json({
      success: true,
      db: buildClientStateView(db, auth.authUser),
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Không thể xóa mã giảm giá: " + String(err) },
      { status: 500 }
    );
  }
}
