import { NextRequest, NextResponse } from "next/server";
import { buildClientStateView, setSessionCookie } from "@/lib/auth";
import { hashPassword, sanitizeUser } from "@/lib/auth-crypto";
import { readServerDb, writeServerDb } from "@/lib/server-db";
import { UserRecord, UserRole } from "@/types/lms";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim();
    const password = String(body.password || "");
    const internalCode = String(body.internalCode || "").trim().toUpperCase();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ Họ tên, Email và Mật khẩu." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Định dạng Email chưa hợp lệ." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu cần tối thiểu 6 ký tự." },
        { status: 400 }
      );
    }

    const db = await readServerDb();
    const exists = (db.users || []).some(
      (u) => u.email.toLowerCase() === email
    );
    if (exists) {
      return NextResponse.json(
        { error: "Email này đã được đăng ký. Vui lòng đăng nhập." },
        { status: 409 }
      );
    }

    let role: UserRole = "student";
    const initialEnrolled = ["course-free-ai-starter"];
    let department: string | undefined;

    if (internalCode) {
      const codeObj = db.activationCodes.find(
        (ac) =>
          ac.code.toUpperCase() === internalCode &&
          ac.active &&
          ac.usedCount < ac.maxUses
      );
      if (!codeObj) {
        return NextResponse.json(
          {
            error:
              "Mã nhân sự nội bộ / học bổng không hợp lệ hoặc đã hết lượt sử dụng.",
          },
          { status: 400 }
        );
      }

      if (codeObj.targetCourseId === "ALL_INTERNAL") {
        role = "internal";
        department = "Nhân sự & Đối tác Nội bộ Ohana";
        db.courses
          .filter((c) => c.accessType === "internal")
          .forEach((c) => {
            if (!initialEnrolled.includes(c.id)) {
              initialEnrolled.push(c.id);
            }
          });
      } else if (!initialEnrolled.includes(codeObj.targetCourseId)) {
        initialEnrolled.push(codeObj.targetCourseId);
      }

      codeObj.usedCount += 1;
    }

    const newUser: UserRecord = {
      id: `user-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      name,
      email,
      phone,
      department,
      role,
      authProvider: "credentials",
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    db.enrollments[newUser.id] = initialEnrolled;
    await writeServerDb(db);

    const safeUser = sanitizeUser(newUser);
    const res = NextResponse.json({
      success: true,
      user: safeUser,
      db: buildClientStateView(db, safeUser),
    });
    setSessionCookie(res, req, newUser);
    return res;
  } catch (err) {
    return NextResponse.json(
      { error: "Lỗi đăng ký tài khoản: " + String(err) },
      { status: 500 }
    );
  }
}
