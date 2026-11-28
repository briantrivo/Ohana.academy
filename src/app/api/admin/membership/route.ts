import { NextRequest, NextResponse } from "next/server";
import { buildClientStateView, getAuthUser } from "@/lib/auth";
import { computeExtendedExpiry } from "@/lib/membership";
import { readServerDb, writeServerDb } from "@/lib/server-db";
import { Lesson, MembershipPlan } from "@/types/lms";

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
        { error: "Chỉ Quản trị viên mới có quyền quản lý Hội viên Membership." },
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
    plans: db.membershipPlans || [],
    subscriptions: db.subscriptions || {},
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth.error || !auth.authUser) return auth.error;

  try {
    const body = await req.json();
    const action = String(body.action || "");
    const db = await readServerDb();
    db.membershipPlans = db.membershipPlans || [];
    db.subscriptions = db.subscriptions || {};

    if (action === "save_plan") {
      const id =
        String(body.id || "")
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9-_]/g, "") || `plan-${Date.now()}`;
      const name = String(body.name || "").trim();
      const subtitle = String(body.subtitle || "").trim();
      const durationDays = Math.max(1, Math.floor(Number(body.durationDays || 30)));
      const price = Math.max(0, Math.round(Number(body.price || 0)));
      const originalPrice =
        body.originalPrice && Number(body.originalPrice) > price
          ? Math.round(Number(body.originalPrice))
          : undefined;
      const badge = String(body.badge || "").trim() || undefined;
      const featuresRaw = Array.isArray(body.features)
        ? body.features
        : String(body.featuresText || "")
            .split(/\r?\n/)
            .map((s) => s.trim())
            .filter(Boolean);
      const active = body.active !== undefined ? Boolean(body.active) : true;
      const sortOrder = Math.max(1, Math.floor(Number(body.sortOrder || 1)));

      if (!name || price <= 0) {
        return NextResponse.json(
          { error: "Vui lòng nhập Tên gói và Giá gói hợp lệ (> 0)." },
          { status: 400 }
        );
      }

      const existing = db.membershipPlans.find((p) => p.id === id);
      const record: MembershipPlan = {
        id,
        name,
        subtitle,
        durationDays,
        price,
        originalPrice,
        badge,
        features:
          featuresRaw.length > 0
            ? featuresRaw.map((f: unknown) => String(f))
            : ["Truy cập toàn bộ Kho Bài Học Cập Nhật trong suốt kỳ hạn"],
        active,
        sortOrder,
        createdAt: existing ? existing.createdAt : new Date().toISOString(),
      };

      db.membershipPlans = db.membershipPlans.filter((p) => p.id !== id);
      db.membershipPlans.push(record);
      db.membershipPlans.sort((a, b) => a.sortOrder - b.sortOrder);

      await writeServerDb(db);
      return NextResponse.json({
        success: true,
        plan: record,
        db: buildClientStateView(db, auth.authUser),
      });
    }

    if (action === "toggle_plan") {
      const id = String(body.id || "").trim();
      const target = db.membershipPlans.find((p) => p.id === id);
      if (!target) {
        return NextResponse.json({ error: "Không tìm thấy gói." }, { status: 404 });
      }
      target.active = Boolean(body.active);
      await writeServerDb(db);
      return NextResponse.json({
        success: true,
        plan: target,
        db: buildClientStateView(db, auth.authUser),
      });
    }

    if (action === "delete_plan") {
      const id = String(body.id || "").trim();
      db.membershipPlans = db.membershipPlans.filter((p) => p.id !== id);
      await writeServerDb(db);
      return NextResponse.json({
        success: true,
        db: buildClientStateView(db, auth.authUser),
      });
    }

    if (action === "toggle_course_membership") {
      const courseId = String(body.courseId || "").trim();
      const included = Boolean(body.included);
      const course = db.courses.find((c) => c.id === courseId);
      if (!course) {
        return NextResponse.json(
          { error: "Không tìm thấy khóa học." },
          { status: 404 }
        );
      }
      if (course.accessType === "membership") {
        course.includedInMembership = true;
      } else {
        course.includedInMembership = included;
      }
      await writeServerDb(db);
      return NextResponse.json({
        success: true,
        course,
        db: buildClientStateView(db, auth.authUser),
      });
    }

    if (action === "add_updated_lesson") {
      const courseId = String(body.courseId || "").trim();
      const chapterTitle =
        String(body.chapterTitle || "").trim() ||
        `Cập Nhật Tháng ${new Date().getMonth() + 1}/${new Date().getFullYear()}`;
      const lessonTitle = String(body.lessonTitle || "").trim();
      const videoUrl = String(body.videoUrl || "").trim();
      const duration = String(body.duration || "15:00").trim() || "15:00";
      const summary =
        String(body.summary || "").trim() ||
        "Bài học cập nhật mới dành cho Hội viên Ohana Membership.";
      const isFreePreview = Boolean(body.isFreePreview);

      if (!courseId || !lessonTitle || !videoUrl) {
        return NextResponse.json(
          { error: "Cần chọn khóa học, nhập Tiêu đề bài mới và Link video." },
          { status: 400 }
        );
      }

      const course = db.courses.find((c) => c.id === courseId);
      if (!course) {
        return NextResponse.json(
          { error: "Không tìm thấy khóa học." },
          { status: 404 }
        );
      }

      const newLesson: Lesson = {
        id: `les-upd-${Date.now()}`,
        title: lessonTitle,
        duration,
        videoUrl,
        isFreePreview,
        publishedAt: new Date().toISOString(),
        summary,
      };

      const existingChapter = course.chapters.find(
        (ch) => ch.title.trim().toLowerCase() === chapterTitle.toLowerCase()
      );
      if (existingChapter) {
        existingChapter.lessons.unshift(newLesson);
      } else {
        course.chapters.unshift({
          id: `ch-upd-${Date.now()}`,
          title: chapterTitle,
          subtitle: "Bài học cập nhật định kỳ cho Hội viên Ohana Membership",
          lessons: [newLesson],
        });
      }

      const totalLessons = course.chapters.reduce(
        (sum, ch) => sum + ch.lessons.length,
        0
      );
      course.totalDuration = `${totalLessons} bài cập nhật`;

      await writeServerDb(db);
      return NextResponse.json({
        success: true,
        lesson: newLesson,
        course,
        db: buildClientStateView(db, auth.authUser),
      });
    }

    if (action === "grant_days") {
      const userId = String(body.userId || "").trim();
      const days = Math.max(1, Math.floor(Number(body.days || 30)));
      const planName =
        String(body.planName || "").trim() || `Hội Viên Ohana (+${days} ngày)`;
      const user = db.users.find((u) => u.id === userId);
      if (!user) {
        return NextResponse.json(
          { error: "Không tìm thấy tài khoản học viên." },
          { status: 404 }
        );
      }

      const prevSub = db.subscriptions[userId];
      const extended = computeExtendedExpiry(prevSub?.expiresAt, days);
      db.subscriptions[userId] = {
        userId,
        planId: prevSub?.planId || "admin-grant",
        planName,
        startedAt: prevSub?.startedAt || extended.startedAt,
        expiresAt: extended.expiresAt,
        lastOrderCode: `ADMIN-${Date.now()}`,
        updatedAt: new Date().toISOString(),
      };

      await writeServerDb(db);
      return NextResponse.json({
        success: true,
        subscription: db.subscriptions[userId],
        db: buildClientStateView(db, auth.authUser),
      });
    }

    if (action === "revoke_subscription") {
      const userId = String(body.userId || "").trim();
      if (db.subscriptions[userId]) {
        db.subscriptions[userId] = {
          ...db.subscriptions[userId],
          expiresAt: new Date(Date.now() - 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await writeServerDb(db);
      }
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
      { error: "Lỗi xử lý Membership: " + String(err) },
      { status: 500 }
    );
  }
}
