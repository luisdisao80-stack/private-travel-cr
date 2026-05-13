// Tiny cookie-based session for the /admin area. One operator, one password.
//
// Env vars (set in Vercel for Production + Preview):
//   ADMIN_PASSWORD          — the plaintext password the operator types in.
//   ADMIN_SESSION_SECRET    — random hex, used to sign session cookies.
//                             Generate with: openssl rand -hex 32
//
// The session cookie holds `<issuedAtMs>.<hmac>` so we can both check it's
// authentic and that it hasn't expired without needing any server-side store.

import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "ptcr_admin";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s) throw new Error("ADMIN_SESSION_SECRET is not set");
  return s;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

function timingSafeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export function verifyPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return timingSafeEqual(input, expected);
}

export async function setAdminSession(): Promise<void> {
  const issuedAt = Date.now().toString();
  const value = `${issuedAt}.${sign(issuedAt)}`;
  const store = await cookies();
  store.set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAdminAuthed(): Promise<boolean> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return false;
  const dot = raw.indexOf(".");
  if (dot < 1) return false;
  const issuedAt = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  try {
    if (!timingSafeEqual(sign(issuedAt), sig)) return false;
  } catch {
    return false;
  }
  const age = Date.now() - Number(issuedAt);
  if (!Number.isFinite(age) || age < 0 || age > MAX_AGE_SECONDS * 1000) {
    return false;
  }
  return true;
}
