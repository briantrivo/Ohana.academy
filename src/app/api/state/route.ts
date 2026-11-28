import { NextRequest, NextResponse } from "next/server";
import { buildClientStateView, getAuthUser } from "@/lib/auth";
import { isGoogleOAuthConfigured } from "@/lib/auth-crypto";
import {
  canAccessMemberZaloGroup,
  getMemberZaloGroupUrl,
} from "@/lib/membership-secrets";
import { readServerDb } from "@/lib/server-db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authUser = await getAuthUser(req);
  const db = await readServerDb();
  const scoped = buildClientStateView(db, authUser);
  const canSeeZalo = Boolean(
    authUser &&
      canAccessMemberZaloGroup(authUser.role, db.subscriptions?.[authUser.id])
  );

  return NextResponse.json({
    ...scoped,
    currentUser: authUser,
    googleEnabled: isGoogleOAuthConfigured(),
    memberZaloGroupUrl: canSeeZalo ? getMemberZaloGroupUrl() : null,
  });
}
