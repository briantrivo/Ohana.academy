import { NextRequest, NextResponse } from "next/server";
import { buildClientStateView, getAuthUser } from "@/lib/auth";
import { readServerDb, writeServerDb } from "@/lib/server-db";
import { Course } from "@/types/lms";

export async function GET(req: NextRequest) {
  const authUser = await getAuthUser(req);
  const db = await readServerDb();
  return NextResponse.json({
    courses: buildClientStateView(db, authUser).courses,
  });
}

export async function POST(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) {
    return NextResponse.json(
      { error: "Vui lòng đăng nhập Quản trị viên để đăng khóa học." },
      { status: 401 }
    );
  }
  if (authUser.role !== "admin") {
    return NextResponse.json(
      { error: "Chỉ Quản trị viên mới có quyền tạo hoặc chỉnh sửa khóa học." },
      { status: 403 }
    );
  }

  try {
    const body = (await req.json()) as Partial<Course>;
    if (!body.title || !body.slug) {
      return NextResponse.json(
        { error: "Thiếu tiêu đề hoặc đường dẫn (slug) khóa học." },
        { status: 400 }
      );
    }

    const db = await readServerDb();
    const existingIdx = db.courses.findIndex(
      (c) => c.id === body.id || c.slug === body.slug
    );

    const courseRecord: Course = {
      id: body.id || `course-${Date.now()}`,
      slug: body.slug,
      title: body.title,
      subtitle: body.subtitle || "",
      category: body.category || "Chuyên đề Ohana",
      accessType: body.accessType || "commercial",
      price: Number(body.price || 0),
      originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
      thumbnail: body.thumbnail || "/ohana/banner_ohana_ai_academy_cyber.jpg",
      instructor: body.instructor || {
        name: "Brian Võ (Võ Quốc Trí)",
        role: "Market Director — Astronixa Ohana",
        avatar: "/ohana/astronixa_logo.jpg",
      },
      level: body.level || "Thực chiến",
      totalDuration: body.totalDuration || "Đang cập nhật",
      studentsCount: body.studentsCount ?? 1,
      rating: body.rating ?? 5.0,
      badge: body.badge,
      highlights:
        body.highlights && body.highlights.length > 0
          ? body.highlights
          : ["Bài giảng thực chiến chất lượng cao từ Ohana Academy"],
      certificateIssuer:
        body.certificateIssuer || "Ohana Academy — Astronixa Ecosystem",
      internalPasscode: body.internalPasscode,
      includedInMembership:
        body.accessType === "membership"
          ? true
          : Boolean(body.includedInMembership),
      chapters: body.chapters || [],
      createdAt: body.createdAt || new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      db.courses[existingIdx] = courseRecord;
    } else {
      db.courses.unshift(courseRecord);
      if (!db.enrollments[authUser.id]) db.enrollments[authUser.id] = [];
      if (!db.enrollments[authUser.id].includes(courseRecord.id)) {
        db.enrollments[authUser.id].push(courseRecord.id);
      }
      if (courseRecord.accessType === "internal") {
        if (!db.enrollments["user-internal"]) db.enrollments["user-internal"] = [];
        if (!db.enrollments["user-internal"].includes(courseRecord.id)) {
          db.enrollments["user-internal"].push(courseRecord.id);
        }
      }
    }

    await writeServerDb(db);
    return NextResponse.json({
      success: true,
      course: courseRecord,
      db: buildClientStateView(db, authUser),
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Không thể lưu khóa học: " + String(err) },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }
  if (authUser.role !== "admin") {
    return NextResponse.json(
      { error: "Chỉ Quản trị viên mới có quyền xóa khóa học." },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Thiếu ID khóa học" }, { status: 400 });
  }
  const db = await readServerDb();
  db.courses = db.courses.filter((c) => c.id !== id);
  await writeServerDb(db);
  return NextResponse.json({
    success: true,
    db: buildClientStateView(db, authUser),
  });
}
