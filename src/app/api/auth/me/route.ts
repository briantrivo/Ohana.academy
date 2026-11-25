import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { isGoogleOAuthConfigured, sanitizeUser } from "@/lib/auth-crypto";
import { readServerDb, writeServerDb } from "@/lib/server-db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  return NextResponse.json({
    user,
    googleEnabled: isGoogleOAuthConfigured(),
  });
}

export async function PATCH(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) {
    return NextResponse.json(
      { error: "Bạn cần đăng nhập để cập nhật hồ sơ." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const db = await readServerDb();
    const record = db.users.find((u) => u.id === authUser.id);
    if (!record) {
      return NextResponse.json({ error: "Không tìm thấy tài khoản." }, { status: 404 });
    }

    if (typeof body.name === "string" && body.name.trim()) {
      record.name = body.name.trim();
    }
    if (typeof body.phone === "string") {
      record.phone = body.phone.trim();
    }
    await writeServerDb(db);
    return NextResponse.json({ success: true, user: sanitizeUser(record) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
