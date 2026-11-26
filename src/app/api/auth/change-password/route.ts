import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/auth-crypto";
import { readServerDb, writeServerDb } from "@/lib/server-db";

export async function POST(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Mật khẩu mới phải có tối thiểu 8 ký tự." },
        { status: 400 }
      );
    }

    const db = await readServerDb();
    const target = db.users.find((u) => u.id === authUser.id);
    if (!target) {
      return NextResponse.json(
        { error: "Không tìm thấy tài khoản trên hệ thống." },
        { status: 404 }
      );
    }

    if (target.passwordHash) {
      if (!currentPassword || !verifyPassword(currentPassword, target.passwordHash)) {
        return NextResponse.json(
          { error: "Mật khẩu hiện tại chưa chính xác." },
          { status: 400 }
        );
      }
    }

    target.passwordHash = hashPassword(newPassword);
    await writeServerDb(db);

    return NextResponse.json({
      success: true,
      message: "Đã cập nhật mật khẩu mới thành công trên Supabase.",
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Lỗi đổi mật khẩu: " + String(err) },
      { status: 500 }
    );
  }
}
