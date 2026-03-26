import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createSession, verifyPassword, sessionCookieOptions, SESSION_COOKIE } from "@/lib/auth";
import { logAudit, getClientIp } from "@/lib/audit";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json({ error: "Email and password required" }, { status: 400 });
    }

    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (result.length === 0) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const user = result[0];

    if (!user.passwordHash || !verifyPassword(password, user.passwordHash)) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await createSession(user.id);

    await logAudit({
      userId: user.id,
      action: "login",
      resourceType: "user",
      resourceId: user.id,
      ipAddress: getClientIp(request),
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions());

    return Response.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    console.error("[auth/login] Error:", err);
    return Response.json(
      { error: "Database connection failed. Is Postgres running?" },
      { status: 500 },
    );
  }
}
