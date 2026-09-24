import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";

const ADMIN_SESSION_COOKIE = "tr_admin_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 8;
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 1000 * 60 * 15;

type SessionPayload = {
  expiresAt: number;
};

const globalForAdminAuth = globalThis as unknown as {
  adminLoginAttempts?: Map<string, { count: number; firstAttemptAt: number }>;
};

const loginAttempts = globalForAdminAuth.adminLoginAttempts ?? new Map<string, { count: number; firstAttemptAt: number }>();

if (!globalForAdminAuth.adminLoginAttempts) {
  globalForAdminAuth.adminLoginAttempts = loginAttempts;
}

function getAdminSecret(): string | null {
  return process.env.ADMIN_SECRET?.trim() || null;
}

function getSessionSecret(): string | null {
  return process.env.ADMIN_SESSION_SECRET?.trim() || null;
}

function encodeBase64Url(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string): string {
  const sessionSecret = getSessionSecret();

  if (!sessionSecret) {
    throw new Error("ADMIN_SESSION_SECRET is required for admin sessions.");
  }

  return crypto.createHmac("sha256", sessionSecret).update(value).digest("base64url");
}

function timingSafeStringEqual(left: string, right: string): boolean {
  const leftHash = crypto.createHash("sha256").update(left).digest();
  const rightHash = crypto.createHash("sha256").update(right).digest();

  return crypto.timingSafeEqual(leftHash, rightHash);
}

export function validateAdminPassword(password: string): boolean {
  const adminSecret = getAdminSecret();

  if (!adminSecret) {
    throw new Error("ADMIN_SECRET is required for admin authentication.");
  }

  return timingSafeStringEqual(password, adminSecret);
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");

  return forwardedFor?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export function isLoginRateLimited(identifier: string): boolean {
  const attempt = loginAttempts.get(identifier);

  if (!attempt) {
    return false;
  }

  if (Date.now() - attempt.firstAttemptAt > LOGIN_WINDOW_MS) {
    loginAttempts.delete(identifier);
    return false;
  }

  return attempt.count >= MAX_LOGIN_ATTEMPTS;
}

export function recordFailedLogin(identifier: string): void {
  const existing = loginAttempts.get(identifier);

  if (!existing || Date.now() - existing.firstAttemptAt > LOGIN_WINDOW_MS) {
    loginAttempts.set(identifier, { count: 1, firstAttemptAt: Date.now() });
    return;
  }

  loginAttempts.set(identifier, {
    count: existing.count + 1,
    firstAttemptAt: existing.firstAttemptAt
  });
}

export function clearFailedLogins(identifier: string): void {
  loginAttempts.delete(identifier);
}

export function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin || !host) {
    return;
  }

  const originHost = new URL(origin).host;

  if (originHost !== host) {
    throw new Error("Cross-origin admin request blocked.");
  }
}

export async function createAdminSession(): Promise<void> {
  const payload: SessionPayload = {
    expiresAt: Date.now() + SESSION_DURATION_MS
  };
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = sign(encodedPayload);
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE, `${encodedPayload}.${signature}`, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000
  });
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const sessionSecret = getSessionSecret();

  if (!sessionSecret) {
    throw new Error("ADMIN_SESSION_SECRET is required for admin session validation.");
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) {
    return false;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature || sign(encodedPayload) !== signature) {
    return false;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(encodedPayload)) as SessionPayload;

    return typeof payload.expiresAt === "number" && payload.expiresAt > Date.now();
  } catch {
    return false;
  }
}
