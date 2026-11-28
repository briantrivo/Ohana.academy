import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { canAccessCourseWithMembership } from "@/lib/membership";
import { readServerDb } from "@/lib/server-db";
import {
  SUPABASE_RESOURCES_BUCKET,
  getSupabaseAdmin,
  isSupabaseConfigured,
} from "@/lib/supabase";
import { resolveUploadsDir } from "@/lib/uploads";

const MIME_MAP: Record<string, string> = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".txt": "text/plain; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".zip": "application/zip",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ name: string }> }
) {
  const { name } = await context.params;
  const safeName = path.basename(decodeURIComponent(name));
  const targetUrl = `/api/resources/file/${encodeURIComponent(safeName)}`;

  const db = await readServerDb();
  const authUser = await getAuthUser(req);

  let authorized = authUser?.role === "admin";
  if (!authorized) {
    for (const course of db.courses) {
      for (const ch of course.chapters) {
        for (const les of ch.lessons) {
          const hasThisFile = (les.resources || []).some(
            (r) => r.url === targetUrl
          );
          if (!hasThisFile) continue;

          if (les.isFreePreview) {
            authorized = true;
            break;
          }
          if (authUser) {
            if (
              canAccessCourseWithMembership(
                course,
                authUser,
                db.enrollments[authUser.id] || [],
                db.subscriptions?.[authUser.id]
              )
            ) {
              authorized = true;
              break;
            }
          }
        }
        if (authorized) break;
      }
      if (authorized) break;
    }
  }

  if (!authorized) {
    return NextResponse.json(
      { error: "Bạn cần đăng nhập và kích hoạt khóa học để tải tài liệu này." },
      { status: authUser ? 403 : 401 }
    );
  }

  const ext = path.extname(safeName).toLowerCase();
  const contentType = MIME_MAP[ext] || "application/octet-stream";
  const displayName = safeName.replace(/^\d+_/, "");

  if (isSupabaseConfigured()) {
    const sb = getSupabaseAdmin();
    if (sb) {
      const { data, error } = await sb.storage
        .from(SUPABASE_RESOURCES_BUCKET)
        .download(safeName);
      if (!error && data) {
        const arrayBuf = await data.arrayBuffer();
        return new NextResponse(Buffer.from(arrayBuf), {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(
              displayName
            )}`,
          },
        });
      }
    }
  }

  const uploadDir = resolveUploadsDir();
  const filePath = path.join(uploadDir, safeName);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json(
      { error: "Không tìm thấy tệp tài liệu." },
      { status: 404 }
    );
  }

  const fileBuffer = fs.readFileSync(filePath);
  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(
        displayName
      )}`,
    },
  });
}
