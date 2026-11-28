import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { canAccessMemberZaloGroup } from "@/lib/membership-secrets";
import { readServerDb } from "@/lib/server-db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) {
    return NextResponse.json(
      { error: "Vui lòng đăng nhập Hội viên để xem mã QR nhóm Zalo." },
      { status: 401 }
    );
  }

  const db = await readServerDb();
  const sub = db.subscriptions?.[authUser.id];

  if (!canAccessMemberZaloGroup(authUser.role, sub)) {
    return NextResponse.json(
      { error: "Mã QR nhóm Zalo chỉ dành cho Hội viên Membership đang còn hạn." },
      { status: 403 }
    );
  }

  const qrPath = path.join(process.cwd(), "private", "zalo_group_hoivien_qr.jpg");
  if (!fs.existsSync(qrPath)) {
    return NextResponse.json(
      { error: "Không tìm thấy ảnh mã QR nhóm Zalo." },
      { status: 404 }
    );
  }

  const imgBuffer = fs.readFileSync(qrPath);
  return new NextResponse(imgBuffer, {
    status: 200,
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}
