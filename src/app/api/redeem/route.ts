import { NextRequest, NextResponse } from "next/server";
import {
  buildClientStateView,
  getAuthUser,
  setSessionCookie,
} from "@/lib/auth";
import { sanitizeUser } from "@/lib/auth-crypto";
import { readServerDb, writeServerDb } from "@/lib/server-db";

export async function POST(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) {
    return NextResponse.json(
      { error: "Vui lòng đăng nhập tài khoản trước khi nhập mã kích hoạt." },
      { status: 401 }
    );
  }

  try {
    const { code } = await req.json();
    const cleanCode = String(code || "").trim().toUpperCase();

    if (!cleanCode) {
      return NextResponse.json(
        { error: "Vui lòng nhập mã kích hoạt." },
        { status: 400 }
      );
    }

    const db = await readServerDb();
    const found = db.activationCodes.find(
      (ac) => ac.code.toUpperCase() === cleanCode && ac.active
    );

    if (!found) {
      return NextResponse.json(
        { error: "Mã kích hoạt không tồn tại hoặc đã ngưng hiệu lực." },
        { status: 404 }
      );
    }

    if (found.usedCount >= found.maxUses) {
      return NextResponse.json(
        { error: "Mã kích hoạt này đã hết lượt sử dụng." },
        { status: 400 }
      );
    }

    if (!db.enrollments[authUser.id]) db.enrollments[authUser.id] = [];

    const unlockedCourseIds: string[] = [];
    const userRecord = db.users.find((u) => u.id === authUser.id);

    if (found.targetCourseId === "ALL_INTERNAL") {
      db.courses
        .filter((c) => c.accessType === "internal")
        .forEach((c) => {
          if (!db.enrollments[authUser.id].includes(c.id)) {
            db.enrollments[authUser.id].push(c.id);
            unlockedCourseIds.push(c.id);
          }
        });
      if (userRecord && userRecord.role === "student") {
        userRecord.role = "internal";
        userRecord.department =
          userRecord.department || "Nhân sự & Đối tác Nội bộ Ohana";
      }
    } else {
      if (!db.enrollments[authUser.id].includes(found.targetCourseId)) {
        db.enrollments[authUser.id].push(found.targetCourseId);
        unlockedCourseIds.push(found.targetCourseId);
      }
    }

    found.usedCount += 1;
    await writeServerDb(db);

    const updatedUser = userRecord ? sanitizeUser(userRecord) : authUser;
    const res = NextResponse.json({
      success: true,
      message: `Kích hoạt thành công: ${found.label}`,
      unlockedCourseIds,
      user: updatedUser,
      db: buildClientStateView(db, updatedUser),
    });

    if (userRecord) {
      setSessionCookie(res, req, userRecord);
    }
    return res;
  } catch (err) {
    return NextResponse.json(
      { error: "Lỗi kích hoạt mã: " + String(err) },
      { status: 500 }
    );
  }
}
