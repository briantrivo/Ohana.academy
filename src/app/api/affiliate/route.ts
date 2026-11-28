import { NextRequest, NextResponse } from "next/server";
import { buildClientStateView, getAuthUser } from "@/lib/auth";
import {
  VIETQR_BANKS,
  generateReferralCode,
  isUserAffiliateEligible,
  maskEmail,
} from "@/lib/affiliate";
import { sanitizeUser } from "@/lib/auth-crypto";
import { readServerDb, writeServerDb } from "@/lib/server-db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  const db = await readServerDb();
  const userRecord = db.users.find((u) => u.id === authUser.id);
  if (!userRecord) {
    return NextResponse.json({ error: "Không tìm thấy tài khoản." }, { status: 404 });
  }

  const eligible = isUserAffiliateEligible(
    userRecord,
    db.orders || [],
    db.subscriptions || {}
  );

  // Tự động cấp mã giới thiệu duy nhất lần đầu khi đủ điều kiện Affiliate
  if (eligible && !userRecord.referralCode) {
    let candidate = generateReferralCode(userRecord.name, userRecord.id);
    const taken = new Set(
      db.users
        .filter((u) => u.id !== userRecord.id && u.referralCode)
        .map((u) => u.referralCode!.toUpperCase())
    );
    if (taken.has(candidate.toUpperCase())) {
      candidate = `${candidate}${Math.floor(10 + Math.random() * 89)}`;
    }
    userRecord.referralCode = candidate;
    await writeServerDb(db);
  }

  const ownCommissions = (db.affiliateCommissions || [])
    .filter((c) => c.referrerUserId === userRecord.id)
    .map((c) => ({
      ...c,
      buyerEmail: maskEmail(c.buyerEmail),
    }));

  const pendingAmount = ownCommissions
    .filter((c) => c.status === "pending")
    .reduce((sum, c) => sum + c.commissionAmount, 0);
  const paidAmount = ownCommissions
    .filter((c) => c.status === "paid")
    .reduce((sum, c) => sum + c.commissionAmount, 0);

  return NextResponse.json({
    eligible,
    user: sanitizeUser(userRecord),
    referralCode: userRecord.referralCode || null,
    payout: userRecord.affiliatePayout || null,
    summary: {
      totalOrders: ownCommissions.filter((c) => c.status !== "cancelled").length,
      pendingAmount,
      paidAmount,
      totalEarned: pendingAmount + paidAmount,
    },
    commissions: ownCommissions,
  });
}

export async function POST(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const db = await readServerDb();
    const userRecord = db.users.find((u) => u.id === authUser.id);
    if (!userRecord) {
      return NextResponse.json({ error: "Không tìm thấy tài khoản." }, { status: 404 });
    }

    const eligible = isUserAffiliateEligible(
      userRecord,
      db.orders || [],
      db.subscriptions || {}
    );
    if (!eligible) {
      return NextResponse.json(
        {
          error:
            "Quyền lợi Affiliate tự động mở khi bạn đã mua khóa học hoặc đăng ký Hội viên Membership.",
        },
        { status: 403 }
      );
    }

    // Lưu mã giới thiệu (tự sinh nếu trống, hoặc kiểm tra trùng nếu người dùng tùy chỉnh)
    if (body.referralCode !== undefined) {
      const cleanRef = String(body.referralCode || "")
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9-]/g, "");
      if (cleanRef.length < 4 || cleanRef.length > 20) {
        return NextResponse.json(
          { error: "Mã giới thiệu cần từ 4 đến 20 ký tự (chữ không dấu, số hoặc dấu -)." },
          { status: 400 }
        );
      }
      const conflict = db.users.some(
        (u) =>
          u.id !== userRecord.id &&
          (u.referralCode || "").toUpperCase() === cleanRef
      );
      if (conflict) {
        return NextResponse.json(
          { error: "Mã giới thiệu này đã có người sử dụng. Vui lòng chọn mã khác." },
          { status: 409 }
        );
      }
      userRecord.referralCode = cleanRef;
    } else if (!userRecord.referralCode) {
      userRecord.referralCode = generateReferralCode(userRecord.name, userRecord.id);
    }

    // Lưu thông tin tài khoản ngân hàng & SĐT Zalo nhận hoa hồng
    if (body.bankId !== undefined || body.accountNo !== undefined) {
      const bankId = String(body.bankId || "").trim().toUpperCase();
      const accountNo = String(body.accountNo || "").trim().replace(/\s+/g, "");
      const accountName = String(body.accountName || "").trim().toUpperCase();
      const zaloPhone = String(body.zaloPhone || userRecord.phone || "").trim();

      if (!bankId || !accountNo || !accountName) {
        return NextResponse.json(
          { error: "Vui lòng nhập đầy đủ Ngân hàng, Số tài khoản và Tên chủ tài khoản." },
          { status: 400 }
        );
      }
      const bankMeta = VIETQR_BANKS.find((b) => b.id === bankId);
      userRecord.affiliatePayout = {
        bankId,
        bankName: bankMeta?.name || bankId,
        accountNo,
        accountName,
        zaloPhone,
      };
      if (zaloPhone && !userRecord.phone) {
        userRecord.phone = zaloPhone;
      }
    }

    await writeServerDb(db);
    const safeUser = sanitizeUser(userRecord);
    return NextResponse.json({
      success: true,
      user: safeUser,
      db: buildClientStateView(db, safeUser),
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Không thể lưu thông tin Affiliate: " + String(err) },
      { status: 500 }
    );
  }
}
