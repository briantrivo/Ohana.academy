import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { maskEmail } from "@/lib/affiliate";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  SessionPayload,
  sanitizeUser,
  signToken,
  verifyToken,
} from "@/lib/auth-crypto";
import { readServerDb } from "@/lib/server-db";
import { LMSDatabase, UserProfile, UserRecord } from "@/types/lms";

export function isHttpsRequest(req: NextRequest): boolean {
  const proto = req.headers.get("x-forwarded-proto");
  if (proto) return proto.split(",")[0].trim() === "https";
  return req.nextUrl.protocol === "https:";
}

export function setSessionCookie(
  res: NextResponse,
  req: NextRequest,
  user: UserRecord | UserProfile
): void {
  const payload: SessionPayload = {
    uid: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  };
  const token = signToken(payload);
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
    secure: isHttpsRequest(req),
  });
}

export function clearSessionCookie(res: NextResponse, req: NextRequest): void {
  res.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    secure: isHttpsRequest(req),
  });
}

export async function getAuthUser(
  req?: NextRequest
): Promise<UserProfile | null> {
  let token = "";
  if (req) {
    token = req.cookies.get(SESSION_COOKIE_NAME)?.value || "";
  } else {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value || "";
    } catch {
      return null;
    }
  }

  const payload = verifyToken<SessionPayload>(token);
  if (!payload || !payload.uid) return null;

  const db = await readServerDb();
  const userRecord = (db.users || []).find((u) => u.id === payload.uid);
  if (!userRecord) return null;

  return sanitizeUser(userRecord);
}

export function isValidInternalRedirect(target: string | null | undefined): string {
  if (!target) return "/my-learning";
  const trimmed = target.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return "/my-learning";
  }
  return trimmed;
}

export function buildClientStateView(
  db: LMSDatabase,
  authUser: UserProfile | null
): LMSDatabase {
  const isAdmin = authUser?.role === "admin";
  const uid = authUser?.id;

  const safeCourses = db.courses.map((c) => {
    if (isAdmin) return c;
    const { internalPasscode: _hidden, ...rest } = c;
    return rest;
  });

  const activePlans = (db.membershipPlans || []).filter((p) => p.active);

  if (!authUser || !uid) {
    return {
      users: [],
      courses: safeCourses,
      orders: [],
      coupons: [],
      activationCodes: [],
      certificates: [],
      membershipPlans: activePlans,
      subscriptions: {},
      affiliateCommissions: [],
      enrollments: {},
      progress: {},
      quizScores: {},
    };
  }

  if (isAdmin) {
    return {
      users: (db.users || []).map((u) => sanitizeUser(u)) as UserRecord[],
      courses: safeCourses,
      orders: db.orders,
      coupons: db.coupons || [],
      activationCodes: db.activationCodes,
      certificates: db.certificates,
      membershipPlans: db.membershipPlans || [],
      subscriptions: db.subscriptions || {},
      affiliateCommissions: db.affiliateCommissions || [],
      enrollments: db.enrollments,
      progress: db.progress,
      quizScores: db.quizScores,
    };
  }

  const ownSub = db.subscriptions?.[uid];
  const ownCommissions = (db.affiliateCommissions || [])
    .filter((c) => c.referrerUserId === uid)
    .map((c) => ({
      ...c,
      buyerEmail: maskEmail(c.buyerEmail),
    }));
  return {
    users: [],
    courses: safeCourses,
    orders: db.orders.filter((o) => o.userId === uid),
    coupons: [],
    activationCodes: [],
    certificates: db.certificates.filter(
      (c) => c.studentEmail.toLowerCase() === authUser.email.toLowerCase()
    ),
    membershipPlans: activePlans,
    subscriptions: ownSub ? { [uid]: ownSub } : {},
    affiliateCommissions: ownCommissions,
    enrollments: {
      [uid]: db.enrollments[uid] || [],
    },
    progress: {
      [uid]: db.progress[uid] || {},
    },
    quizScores: {
      [uid]: db.quizScores[uid] || {},
    },
  };
}
