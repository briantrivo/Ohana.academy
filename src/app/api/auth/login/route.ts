import { NextRequest, NextResponse } from "next/server";
import {
  buildClientStateView,
  setSessionCookie,
} from "@/lib/auth";
import { sanitizeUser, verifyPassword } from "@/lib/auth-crypto";
import { readServerDb, writeServerDb } from "@/lib/server-db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ Email và Mật khẩu." },
        { status: 400 }
      );
    }

    const db = await readServerDb();
    const user = (db.users || []).find(
      (u) => u.email.toLowerCase() === email
    );

    if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: "Email hoặc mật khẩu chưa chính xác." },
        { status: 401 }
      );
    }

    user.lastLoginAt = new Date().toISOString();
    await writeServerDb(db);

    const safeUser = sanitizeUser(user);
    const res = NextResponse.json({
      success: true,
      user: safeUser,
      db: buildClientStateView(db, safeUser),
    });
    setSessionCookie(res, req, user);
    return res;
  } catch (err) {
    return NextResponse.json(
      { error: "Lỗi đăng nhập: " + String(err) },
      { status: 500 }
    );
  }
}
