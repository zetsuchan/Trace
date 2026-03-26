import { db } from "@/lib/db";
import { sharedTraces } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { isPracticeMember } from "@/lib/auth/access";
import { logAudit, getClientIp } from "@/lib/audit";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getSession();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id: sharedId } = await params;

    // Get the shared trace
    const shared = await db
      .select()
      .from(sharedTraces)
      .where(eq(sharedTraces.id, sharedId))
      .limit(1);

    if (shared.length === 0) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    // Verify provider is a member of the practice
    const isMember = await isPracticeMember(user.id, shared[0].practiceId);
    if (!isMember) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Mark as viewed
    await db
      .update(sharedTraces)
      .set({ viewedAt: new Date(), viewedBy: user.id })
      .where(eq(sharedTraces.id, sharedId));

    await logAudit({
      userId: user.id,
      action: "view_trace",
      resourceType: "trace",
      resourceId: shared[0].traceId,
      metadata: { sharedId, patientUserId: shared[0].patientUserId },
      ipAddress: getClientIp(request),
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("[provider/shared/view] Error:", err);
    return Response.json({ error: "Failed to mark as viewed" }, { status: 500 });
  }
}
