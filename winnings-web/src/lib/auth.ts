import crypto from "crypto";
import { NextRequest } from "next/server";

const COOKIE_NAME = "wa_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

function getSecret() {
  return process.env.AUTH_SECRET || "dev-auth-secret-change-me";
}

function b64url(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromB64url(input: string) {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((input.length + 3) % 4);
  return Buffer.from(padded, "base64").toString("utf8");
}

function sign(payloadB64: string) {
  return b64url(crypto.createHmac("sha256", getSecret()).update(payloadB64).digest());
}

export function createSessionToken(email: string) {
  const payload = JSON.stringify({ email, exp: Date.now() + SESSION_TTL_MS });
  const payloadB64 = b64url(payload);
  const sig = sign(payloadB64);
  return `${payloadB64}.${sig}`;
}

export function readSessionEmail(token?: string | null): string | null {
  if (!token) return null;
  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig) return null;
  if (sign(payloadB64) !== sig) return null;

  try {
    const payload = JSON.parse(fromB64url(payloadB64)) as { email?: string; exp?: number };
    if (!payload?.email || !payload?.exp || payload.exp < Date.now()) return null;
    return payload.email;
  } catch {
    return null;
  }
}

export function getSessionEmailFromRequest(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  return readSessionEmail(token);
}

export function sessionCookieHeader(token: string) {
  const secure = process.env.NODE_ENV === "production";
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}${secure ? "; Secure" : ""}`;
}

export function clearSessionCookieHeader() {
  const secure = process.env.NODE_ENV === "production";
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? "; Secure" : ""}`;
}

export function hashPassword(password: string, salt?: string) {
  const useSalt = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, useSalt, 120000, 32, "sha256").toString("hex");
  return `${useSalt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = (stored || "").split(":");
  if (!salt || !hash) return false;
  const candidate = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(`${salt}:${hash}`));
}

export function randomToken() {
  return crypto.randomBytes(24).toString("hex");
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
