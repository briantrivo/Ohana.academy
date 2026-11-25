import { NextRequest, NextResponse } from "next/server";
import { buildClientStateView, getAuthUser } from "@/lib/auth";
import { isGoogleOAuthConfigured } from "@/lib/auth-crypto";
import { readServerDb } from "@/lib/server-db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authUser = await getAuthUser(req);
  const db = await readServerDb();
  const scoped = buildClientStateView(db, authUser);

  return NextResponse.json({
    ...scoped,
    currentUser: authUser,
    googleEnabled: isGoogleOAuthConfigured(),
  });
}
