import { NextRequest, NextResponse } from "next/server";
import { buildClientStateView, getAuthUser } from "@/lib/auth";
import { hashPassword, sanitizeUser } from "@/lib/auth-crypto";
import { readServerDb, writeServerDb } from "@/lib/server-db";
import { UserRecord, UserRole } from "@/types/lms";

export async function GET(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }
  if (authUser.role !== "admin") {
    return NextResponse.json(
      { error: "Chỉ Quản trị viên mới có quyền truy cập." },
      { status: 403 }
    );
  }
  const db = await readServerDb();
  return NextResponse.json({
    users: db.users.map((u) => sanitizeUser(u)),
  });
}

export async function POST(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }
  if (authUser.role !== "admin") {
    return NextResponse.json(
      { error: "Chỉ Quản trị viên mới có quyền cấp tài khoản." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim();
    const department = String(body.department || "").trim();
    const password = String(body.password || "");
    const role: UserRole =
      body.role === "internal" ? "internal" : "student";

    if (!name || !email || password.length < 6) {
      return NextResponse.json(
        { error: "Cần nhập Họ tên, Email và Mật khẩu tối thiểu 6 ký tự." },
        { status: 400 }
      );
    }

    const db = await readServerDb();
    if (db.users.some((u) => u.email.toLowerCase() === email)) {
      return NextResponse.json(
        { error: "Email này đã tồn tại trên hệ thống." },
        { status: 409 }
      );
    }

    const newUser: UserRecord = {
      id: `user-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      name,
      email,
      phone,
      department: department || (role === "internal" ? "Nhân sự Nội bộ Ohana" : undefined),
      role,
      authProvider: "credentials",
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    const enrolled = ["course-free-ai-starter"];
    if (role === "internal") {
      db.courses
        .filter((c) => c.accessType === "internal")
        .forEach((c) => {
          if (!enrolled.includes(c.id)) enrolled.push(c.id);
        });
    }
    db.enrollments[newUser.id] = enrolled;
    await writeServerDb(db);

    return NextResponse.json({
      success: true,
      user: sanitizeUser(newUser),
      db: buildClientStateView(db, authUser),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }
  if (authUser.role !== "admin") {
    return NextResponse.json(
      { error: "Chỉ Quản trị viên mới có quyền phân quyền." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const userId = String(body.userId || "");
    const nextRole = body.role as UserRole;
    if (!userId || (nextRole !== "student" && nextRole !== "internal")) {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
    }

    const db = await readServerDb();
    const target = db.users.find((u) => u.id === userId);
    if (!target) {
      return NextResponse.json({ error: "Không tìm thấy người dùng." }, { status: 404 });
    }
    if (target.role === "admin") {
      return NextResponse.json(
        { error: "Không thể hạ quyền Quản trị viên chính." },
        { status: 400 }
      );
    }

    target.role = nextRole;
    if (nextRole === "internal") {
      target.department = target.department || "Nhân sự & Đối tác Nội bộ Ohana";
      if (!db.enrollments[target.id]) db.enrollments[target.id] = [];
      db.courses
        .filter((c) => c.accessType === "internal")
        .forEach((c) => {
          if (!db.enrollments[target.id].includes(c.id)) {
            db.enrollments[target.id].push(c.id);
          }
        });
    }

    await writeServerDb(db);
    return NextResponse.json({
      success: true,
      db: buildClientStateView(db, authUser),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
