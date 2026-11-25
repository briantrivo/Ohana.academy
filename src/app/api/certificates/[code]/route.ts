import { NextRequest, NextResponse } from "next/server";
import { readServerDb } from "@/lib/server-db";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;
  const db = await readServerDb();
  const cert = db.certificates.find(
    (c) => c.code.toUpperCase() === code.toUpperCase()
  );

  if (!cert) {
    return NextResponse.json(
      { error: "Không tìm thấy chứng chỉ theo mã tra cứu này." },
      { status: 404 }
    );
  }

  return NextResponse.json({ certificate: cert });
}
