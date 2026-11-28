import crypto from "crypto";
import { UserProfile, UserRecord, UserRole } from "@/types/lms";

export const SESSION_COOKIE_NAME = "ohana_session";
export const OAUTH_TX_COOKIE_NAME = "ohana_oauth_tx";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 ngày

function getSigningSecret(): string {
  return (
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "ohana-academy-local-dev-secret-change-in-vercel"
  );
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function hashPasswordWithSalt(password: string, saltHex: string): string {
  const derived = crypto.scryptSync(password, saltHex, 64).toString("hex");
  return `${saltHex}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(":");
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  if (!salt || !keyHex) return false;
  try {
    const keyBuf = Buffer.from(keyHex, "hex");
    const derivedBuf = crypto.scryptSync(password, salt, 64);
    if (keyBuf.length !== derivedBuf.length) return false;
    return crypto.timingSafeEqual(keyBuf, derivedBuf);
  } catch {
    return false;
  }
}

export interface SessionPayload {
  uid: string;
  email: string;
  role: UserRole;
  exp: number;
}

export function signToken(payload: object): string {
  const encoded = Buffer.from(JSON.stringify(payload), "utf-8").toString(
    "base64url"
  );
  const sig = crypto
    .createHmac("sha256", getSigningSecret())
    .update(encoded)
    .digest("base64url");
  return `${encoded}.${sig}`;
}

export function verifyToken<T extends { exp?: number }>(token: string): T | null {
  if (!token || !token.includes(".")) return null;
  const [encoded, sig] = token.split(".");
  if (!encoded || !sig) return null;

  const expectedSig = crypto
    .createHmac("sha256", getSigningSecret())
    .update(encoded)
    .digest("base64url");

  try {
    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length) return null;
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;

    const decoded = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf-8")
    ) as T;
    if (decoded.exp && Date.now() > decoded.exp) return null;
    return decoded;
  } catch {
    return null;
  }
}

export function sanitizeUser(user: UserRecord): UserProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    department: user.department,
    role: user.role,
    avatar: user.avatar,
    authProvider: user.authProvider,
    referralCode: user.referralCode,
    referredByUserId: user.referredByUserId,
    affiliateEnabled: user.affiliateEnabled,
    affiliatePayout: user.affiliatePayout,
  };
}

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() &&
      process.env.GOOGLE_CLIENT_SECRET?.trim()
  );
}
