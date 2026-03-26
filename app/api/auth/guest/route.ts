import { guestSignIn, isDevMode } from "@/lib/auth/guest";
import { sessionCookieOptions, SESSION_COOKIE } from "@/lib/auth";
import { logAudit, getClientIp } from "@/lib/audit";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  // Guest sign-in only available in development
  if (!isDevMode()) {
    return Response.json({ error: "Guest sign-in not available" }, { status: 403 });
  }

  try {
    const { role } = await request.json();

    if (role !== "patient" && role !== "provider") {
      return Response.json({ error: "Role must be 'patient' or 'provider'" }, { status: 400 });
    }

    const result = await guestSignIn(role);

    if (!result) {
      return Response.json(
        { error: "Guest account not found. Run `bun run db:seed` first." },
        { status: 404 },
      );
    }

    await logAudit({
      userId: result.user.id,
      action: "guest_login",
      resourceType: "user",
      resourceId: result.user.id,
      metadata: { role },
      ipAddress: getClientIp(request),
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, result.token, sessionCookieOptions());

    return Response.json({ user: result.user });
  } catch (err) {
    console.error("[auth/guest] Error:", err);
    return Response.json(
      { error: "Database connection failed. Is Postgres running?" },
      { status: 500 },
    );
  }
}
