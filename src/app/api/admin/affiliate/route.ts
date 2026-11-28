import { NextRequest, NextResponse } from "next/server";
import { buildClientStateView, getAuthUser } from "@/lib/auth";
import { generateReferralCode } from "@/lib/affiliate";
import { readServerDb, writeServerDb } from "@/lib/server-db";

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
        { error: "Chỉ Quản trị viên mới có quyền quản lý hoa hồng Affiliate." },
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
  return NextResponse.json({
    commissions: db.affiliateCommissions || [],
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth.error || !auth.authUser) return auth.error;

  try {
    const body = await req.json();
    const action = String(body.action || "");
    const db = await readServerDb();
    db.affiliateCommissions = db.affiliateCommissions || [];

    if (action === "mark_paid") {
      const commissionId = String(body.commissionId || "").trim();
      const payoutNote = String(body.payoutNote || "").trim();
      const target = db.affiliateCommissions.find((c) => c.id === commissionId);
      if (!target) {
        return NextResponse.json(
          { error: "Không tìm thấy khoản hoa hồng này." },
          { status: 404 }
        );
      }
      target.status = "paid";
      target.paidAt = new Date().toISOString();
      target.payoutNote =
        payoutNote || `Admin (${auth.authUser.name}) đã chuyển khoản`;
      await writeServerDb(db);
      return NextResponse.json({
        success: true,
        commission: target,
        db: buildClientStateView(db, auth.authUser),
      });
    }

    if (action === "mark_pending") {
      const commissionId = String(body.commissionId || "").trim();
      const target = db.affiliateCommissions.find((c) => c.id === commissionId);
      if (!target) {
        return NextResponse.json(
          { error: "Không tìm thấy khoản hoa hồng này." },
          { status: 404 }
        );
      }
      target.status = "pending";
      target.paidAt = undefined;
      await writeServerDb(db);
      return NextResponse.json({
        success: true,
        commission: target,
        db: buildClientStateView(db, auth.authUser),
      });
    }

    if (action === "cancel_commission") {
      const commissionId = String(body.commissionId || "").trim();
      const payoutNote = String(body.payoutNote || "").trim();
      const target = db.affiliateCommissions.find((c) => c.id === commissionId);
      if (!target) {
        return NextResponse.json(
          { error: "Không tìm thấy khoản hoa hồng này." },
          { status: 404 }
        );
      }
      target.status = "cancelled";
      target.payoutNote = payoutNote || "Admin hủy hoa hồng";
      await writeServerDb(db);
      return NextResponse.json({
        success: true,
        commission: target,
        db: buildClientStateView(db, auth.authUser),
      });
    }

    if (action === "toggle_user_affiliate") {
      const userId = String(body.userId || "").trim();
      const enabled = Boolean(body.enabled);
      const user = db.users.find((u) => u.id === userId);
      if (!user) {
        return NextResponse.json(
          { error: "Không tìm thấy tài khoản học viên." },
          { status: 404 }
        );
      }
      user.affiliateEnabled = enabled;
      if (enabled && !user.referralCode) {
        user.referralCode = generateReferralCode(user.name, user.id);
      }
      await writeServerDb(db);
      return NextResponse.json({
        success: true,
        db: buildClientStateView(db, auth.authUser),
      });
    }

    return NextResponse.json(
      { error: "Hành động không được hỗ trợ." },
      { status: 400 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Lỗi xử lý Affiliate: " + String(err) },
      { status: 500 }
    );
  }
}
