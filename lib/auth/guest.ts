// ─────────────────────────────────────────────
// TRACE — Guest/Dev Auth
// Pre-seeded accounts for development
// ─────────────────────────────────────────────

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createSession } from "./index";

// Fixed emails for guest accounts (must match seed data)
export const GUEST_PATIENT_EMAIL = "guest-patient@dev.trace";
export const GUEST_PROVIDER_EMAIL = "guest-provider@dev.trace";

export async function guestSignIn(
  role: "patient" | "provider",
): Promise<{ token: string; user: { id: string; email: string; name: string | null; role: string } } | null> {
  const email = role === "patient" ? GUEST_PATIENT_EMAIL : GUEST_PROVIDER_EMAIL;

  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (result.length === 0) return null;

  const user = result[0];
  const token = await createSession(user.id);

  return {
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  };
}

export function isDevMode(): boolean {
  return process.env.NODE_ENV === "development";
}

export function getAutoLoginRole(): "patient" | "provider" | null {
  const val = process.env.DEV_AUTO_LOGIN;
  if (val === "patient" || val === "provider") return val;
  return null;
}
