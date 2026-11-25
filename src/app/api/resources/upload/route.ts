import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { buildClientStateView, getAuthUser } from "@/lib/auth";
import { readServerDb, writeServerDb } from "@/lib/server-db";
import {
  SUPABASE_RESOURCES_BUCKET,
  ensureSupabaseReady,
  getSupabaseAdmin,
  isSupabaseConfigured,
} from "@/lib/supabase";
import { resolveUploadsDir, sanitizeFileName } from "@/lib/uploads";

const MAX_FILE_BYTES = 25 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) {
    return NextResponse.json(
      { error: "Vui lòng đăng nhập Quản trị viên để tải tài liệu." },
      { status: 401 }
    );
  }
  if (authUser.role !== "admin") {
    return NextResponse.json(
      { error: "Chỉ Quản trị viên mới có quyền đính kèm tài liệu." },
      { status: 403 }
    );
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    let courseId = "";
    let lessonId = "";
    let title = "";
    let resourceUrl = "";
    let fileName: string | undefined;
    let fileSize: number | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file");
      courseId = String(formData.get("courseId") || "");
      lessonId = String(formData.get("lessonId") || "");
      title = String(formData.get("title") || "").trim();

      if (!(file instanceof File) || file.size === 0) {
        return NextResponse.json(
          { error: "Vui lòng chọn tệp tài liệu hợp lệ." },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_BYTES) {
        return NextResponse.json(
          { error: "Dung lượng tệp vượt quá giới hạn 25MB." },
          { status: 400 }
        );
      }

      const safeName = sanitizeFileName(file.name);
      const storedName = `${Date.now()}_${safeName}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      if (isSupabaseConfigured()) {
        await ensureSupabaseReady();
        const sb = getSupabaseAdmin();
        if (sb) {
          const { error: upErr } = await sb.storage
            .from(SUPABASE_RESOURCES_BUCKET)
            .upload(storedName, buffer, {
              contentType: file.type || "application/octet-stream",
              upsert: true,
            });
          if (upErr) {
            return NextResponse.json(
              { error: "Lỗi tải file lên Supabase Storage: " + upErr.message },
              { status: 500 }
            );
          }
        }
      } else {
        const uploadDir = resolveUploadsDir();
        fs.writeFileSync(path.join(uploadDir, storedName), buffer);
      }

      fileName = file.name;
      fileSize = file.size;
      title = title || file.name;
      resourceUrl = `/api/resources/file/${encodeURIComponent(storedName)}`;
    } else {
      const body = await req.json();
      courseId = String(body.courseId || "");
      lessonId = String(body.lessonId || "");
      title = String(body.title || "").trim();
      resourceUrl = String(body.url || "").trim();

      if (!title || !resourceUrl) {
        return NextResponse.json(
          { error: "Vui lòng nhập đầy đủ Tên tài liệu và Đường dẫn." },
          { status: 400 }
        );
      }
    }

    const db = await readServerDb();
    const course = db.courses.find((c) => c.id === courseId);
    if (!course) {
      return NextResponse.json(
        { error: "Không tìm thấy khóa học." },
        { status: 404 }
      );
    }

    let targetLessonFound = false;
    for (const chapter of course.chapters) {
      const lesson = chapter.lessons.find((l) => l.id === lessonId);
      if (lesson) {
        if (!lesson.resources) lesson.resources = [];
        lesson.resources.push({
          title,
          url: resourceUrl,
          ...(fileName ? { fileName } : {}),
          ...(fileSize ? { fileSize } : {}),
          uploadedAt: new Date().toISOString(),
        });
        targetLessonFound = true;
        break;
      }
    }

    if (!targetLessonFound) {
      return NextResponse.json(
        { error: "Không tìm thấy bài giảng để đính kèm tài liệu." },
        { status: 404 }
      );
    }

    await writeServerDb(db);
    return NextResponse.json({
      success: true,
      db: buildClientStateView(db, authUser),
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Lỗi tải lên tài liệu: " + String(err) },
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
      { error: "Chỉ Quản trị viên mới có quyền xóa tài liệu." },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId") || "";
    const lessonId = searchParams.get("lessonId") || "";
    const indexStr = searchParams.get("index");
    const index = indexStr !== null ? Number(indexStr) : -1;

    if (!courseId || !lessonId || Number.isNaN(index) || index < 0) {
      return NextResponse.json(
        { error: "Thiếu thông tin tài liệu cần xóa." },
        { status: 400 }
      );
    }

    const db = await readServerDb();
    const course = db.courses.find((c) => c.id === courseId);
    if (!course) {
      return NextResponse.json({ error: "Không tìm thấy khóa học." }, { status: 404 });
    }

    for (const chapter of course.chapters) {
      const lesson = chapter.lessons.find((l) => l.id === lessonId);
      if (lesson && lesson.resources && lesson.resources[index]) {
        const [removed] = lesson.resources.splice(index, 1);
        if (removed?.url?.startsWith("/api/resources/file/")) {
          const storedName = decodeURIComponent(
            removed.url.replace("/api/resources/file/", "")
          );
          const safeBase = path.basename(storedName);
          if (isSupabaseConfigured()) {
            const sb = getSupabaseAdmin();
            if (sb) {
              await sb.storage
                .from(SUPABASE_RESOURCES_BUCKET)
                .remove([safeBase])
                .catch(() => {});
            }
          } else {
            const filePath = path.join(resolveUploadsDir(), safeBase);
            if (fs.existsSync(filePath)) {
              try {
                fs.unlinkSync(filePath);
              } catch {}
            }
          }
        }
        await writeServerDb(db);
        return NextResponse.json({
          success: true,
          db: buildClientStateView(db, authUser),
        });
      }
    }

    return NextResponse.json({ error: "Không tìm thấy tài liệu." }, { status: 404 });
  } catch (err) {
    return NextResponse.json(
      { error: "Lỗi xóa tài liệu: " + String(err) },
      { status: 500 }
    );
  }
}
