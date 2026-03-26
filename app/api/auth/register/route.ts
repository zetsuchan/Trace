import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createSession, hashPassword, sessionCookieOptions, SESSION_COOKIE } from "@/lib/auth";
import { logAudit, getClientIp } from "@/lib/audit";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const { email, password, name, role } = await request.json();

  if (!email || !password) {
    return Response.json({ error: "Email and password required" }, { status: 400 });
  }

  // Check if email already exists
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    return Response.json({ error: "Email already registered" }, { status: 409 });
  }

  // Only allow "patient" or "provider" roles on registration
  const userRole = role === "provider" ? "provider" : "patient";

  const [user] = await db
    .insert(users)
    .values({
      email,
      passwordHash: hashPassword(password),
      name: name || null,
      role: userRole,
    })
    .returning();

  const token = await createSession(user.id);

  await logAudit({
    userId: user.id,
    action: "register",
    resourceType: "user",
    resourceId: user.id,
    ipAddress: getClientIp(request),
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions());

  return Response.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
}
