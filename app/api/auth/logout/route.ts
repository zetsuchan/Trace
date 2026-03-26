import { destroySession, SESSION_COOKIE } from "@/lib/auth";
import { logAudit, getClientIp } from "@/lib/audit";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    // Get user ID from session before destroying for audit log
    await destroySession(token);

    await logAudit({
      userId: null,
      action: "logout",
      ipAddress: getClientIp(request),
    });
  }

  cookieStore.delete(SESSION_COOKIE);

  return Response.json({ success: true });
}
