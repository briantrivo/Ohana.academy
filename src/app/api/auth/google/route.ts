import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { isHttpsRequest, isValidInternalRedirect } from "@/lib/auth";
import {
  OAUTH_TX_COOKIE_NAME,
  isGoogleOAuthConfigured,
  signToken,
} from "@/lib/auth-crypto";

export async function GET(req: NextRequest) {
  const nextPath = isValidInternalRedirect(req.nextUrl.searchParams.get("next"));

  if (!isGoogleOAuthConfigured()) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("google_setup", "1");
    url.searchParams.set("next", nextPath);
    return NextResponse.redirect(url);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID!.trim();
  const redirectUri = `${req.nextUrl.origin}/api/auth/google/callback`;

  const state = crypto.randomBytes(32).toString("base64url");
  const verifier = crypto.randomBytes(32).toString("base64url");
  const challenge = crypto
    .createHash("sha256")
    .update(verifier)
    .digest("base64url");

  const txToken = signToken({
    state,
    verifier,
    next: nextPath,
    exp: Date.now() + 10 * 60 * 1000, // 10 phút
  });

  const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleUrl.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString();

  const res = NextResponse.redirect(googleUrl);
  res.cookies.set(OAUTH_TX_COOKIE_NAME, txToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
    secure: isHttpsRequest(req),
  });
  return res;
}
