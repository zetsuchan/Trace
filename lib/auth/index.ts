// ─────────────────────────────────────────────
// TRACE — Auth Library
// Server-side sessions in Postgres (HIPAA-compliant)
// ─────────────────────────────────────────────

import { db } from "@/lib/db";
import { users, sessions } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { hashSync, compareSync } from "bcryptjs";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "trace-session";
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const PROVIDER_INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 min for HIPAA

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
};

// ── Password helpers ─────────────────────────

export function hashPassword(password: string): string {
  return hashSync(password, 12);
}

export function verifyPassword(password: string, hash: string): boolean {
  return compareSync(password, hash);
}

// ── Session management ───────────────────────

export async function createSession(userId: string): Promise<string> {
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_MS);

  await db.insert(sessions).values({
    userId,
    token,
    expiresAt,
  });

  // Update last login
  await db.update(users).set({ lastLogin: new Date() }).where(eq(users.id, userId));

  return token;
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const result = await db
    .select({
      sessionId: sessions.id,
      userId: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      expiresAt: sessions.expiresAt,
      lastActiveAt: sessions.lastActiveAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())))
    .limit(1);

  if (result.length === 0) return null;

  const session = result[0];

  // HIPAA: enforce inactivity timeout for providers
  if (
    session.role !== "patient" &&
    session.lastActiveAt &&
    Date.now() - new Date(session.lastActiveAt).getTime() > PROVIDER_INACTIVITY_TIMEOUT_MS
  ) {
    await destroySession(token);
    return null;
  }

  // Touch last active timestamp
  await db
    .update(sessions)
    .set({ lastActiveAt: new Date() })
    .where(eq(sessions.id, session.sessionId));

  return {
    id: session.userId,
    email: session.email,
    name: session.name,
    role: session.role,
  };
}

export async function destroySession(token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.token, token));
}

export async function destroyAllUserSessions(userId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

// ── Cookie helpers ───────────────────────────

export function sessionCookieOptions() {
  return {
    name: SESSION_COOKIE,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_MS / 1000,
  };
}

// ── Role helpers ─────────────────────────────

export function isProvider(role: string): boolean {
  return role === "provider" || role === "admin";
}

export function isAdmin(role: string): boolean {
  return role === "admin";
}

// ── Require auth (for server components / actions) ──

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireProvider(): Promise<SessionUser> {
  const user = await requireAuth();
  if (!isProvider(user.role)) {
    throw new Error("Forbidden: provider access required");
  }
  return user;
}
