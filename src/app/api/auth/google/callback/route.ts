import { NextRequest, NextResponse } from "next/server";
import {
  isHttpsRequest,
  isValidInternalRedirect,
  setSessionCookie,
} from "@/lib/auth";
import {
  OAUTH_TX_COOKIE_NAME,
  isGoogleOAuthConfigured,
  verifyToken,
} from "@/lib/auth-crypto";
import { readServerDb, writeServerDb } from "@/lib/server-db";
import { UserRecord } from "@/types/lms";

interface OAuthTxPayload {
  state: string;
  verifier: string;
  next: string;
  exp: number;
}

export async function GET(req: NextRequest) {
  const loginFail = (errCode: string) => {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("error", errCode);
    const res = NextResponse.redirect(url);
    res.cookies.set(OAUTH_TX_COOKIE_NAME, "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      secure: isHttpsRequest(req),
    });
    return res;
  };

  if (!isGoogleOAuthConfigured()) {
    return loginFail("google_not_configured");
  }

  const oauthErr = req.nextUrl.searchParams.get("error");
  if (oauthErr) {
    return loginFail("google_cancelled");
  }

  const code = req.nextUrl.searchParams.get("code") || "";
  const state = req.nextUrl.searchParams.get("state") || "";
  const txRaw = req.cookies.get(OAUTH_TX_COOKIE_NAME)?.value || "";
  const tx = verifyToken<OAuthTxPayload>(txRaw);

  if (!code || !state || !tx || tx.state !== state) {
    return loginFail("google_state_invalid");
  }

  try {
    const redirectUri = `${req.nextUrl.origin}/api/auth/google/callback`;
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!.trim(),
        client_secret: process.env.GOOGLE_CLIENT_SECRET!.trim(),
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
        code_verifier: tx.verifier,
      }).toString(),
    });

    if (!tokenRes.ok) {
      return loginFail("google_token_exchange_failed");
    }

    const tokenJson = (await tokenRes.json()) as { access_token?: string };
    if (!tokenJson.access_token) {
      return loginFail("google_token_missing");
    }

    const userInfoRes = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: { Authorization: `Bearer ${tokenJson.access_token}` },
      }
    );

    if (!userInfoRes.ok) {
      return loginFail("google_userinfo_failed");
    }

    const profile = (await userInfoRes.json()) as {
      sub?: string;
      email?: string;
      email_verified?: boolean;
      name?: string;
      picture?: string;
    };

    if (!profile.email || profile.email_verified !== true) {
      return loginFail("google_email_unverified");
    }

    const emailLower = profile.email.toLowerCase();
    const db = await readServerDb();
    let user = db.users.find((u) => u.email.toLowerCase() === emailLower);

    if (!user) {
      const adminEmail = (
        process.env.ADMIN_EMAIL || "brian@astronixa.com"
      ).toLowerCase();
      user = {
        id: `user-gg-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        name: profile.name || emailLower.split("@")[0],
        email: emailLower,
        phone: "",
        role: emailLower === adminEmail ? "admin" : "student",
        avatar: profile.picture,
        authProvider: "google",
        googleSub: profile.sub,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      db.users.push(user);
      db.enrollments[user.id] = ["course-free-ai-starter"];
    } else {
      user.googleSub = profile.sub || user.googleSub;
      user.avatar = profile.picture || user.avatar;
      user.lastLoginAt = new Date().toISOString();
    }

    await writeServerDb(db);

    const dest = new URL(isValidInternalRedirect(tx.next), req.nextUrl.origin);
    const res = NextResponse.redirect(dest);
    res.cookies.set(OAUTH_TX_COOKIE_NAME, "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      secure: isHttpsRequest(req),
    });
    setSessionCookie(res, req, user);
    return res;
  } catch {
    return loginFail("google_callback_error");
  }
}
