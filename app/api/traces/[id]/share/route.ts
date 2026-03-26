import { db } from "@/lib/db";
import { sharedTraces, traces, patientProfiles, patientPracticeLinks } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { logAudit, getClientIp } from "@/lib/audit";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getSession();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id: traceId } = await params;
    const { practiceId, note } = await request.json();

    if (!practiceId) {
      return Response.json({ error: "Practice ID is required" }, { status: 400 });
    }

    // Verify the trace belongs to this user
    const trace = await db
      .select({ id: traces.id })
      .from(traces)
      .where(and(eq(traces.id, traceId), eq(traces.userId, user.id)))
      .limit(1);

    if (trace.length === 0) {
      return Response.json({ error: "Trace not found" }, { status: 404 });
    }

    // Verify patient is linked to this practice
    const profile = await db
      .select({ id: patientProfiles.id })
      .from(patientProfiles)
      .where(eq(patientProfiles.userId, user.id))
      .limit(1);

    if (profile.length === 0) {
      return Response.json({ error: "No patient profile found" }, { status: 400 });
    }

    const link = await db
      .select({ id: patientPracticeLinks.id })
      .from(patientPracticeLinks)
      .where(
        and(
          eq(patientPracticeLinks.patientProfileId, profile[0].id),
          eq(patientPracticeLinks.practiceId, practiceId),
          eq(patientPracticeLinks.status, "active"),
        ),
      )
      .limit(1);

    if (link.length === 0) {
      return Response.json({ error: "Not linked to this practice" }, { status: 403 });
    }

    // Check if already shared
    const existing = await db
      .select({ id: sharedTraces.id })
      .from(sharedTraces)
      .where(
        and(
          eq(sharedTraces.traceId, traceId),
          eq(sharedTraces.practiceId, practiceId),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      return Response.json({ error: "Already shared with this practice" }, { status: 409 });
    }

    const [shared] = await db
      .insert(sharedTraces)
      .values({
        traceId,
        patientUserId: user.id,
        practiceId,
        note: note || null,
      })
      .returning();

    await logAudit({
      userId: user.id,
      action: "share_trace",
      resourceType: "trace",
      resourceId: traceId,
      metadata: { practiceId, hasNote: !!note },
      ipAddress: getClientIp(request),
    });

    return Response.json({ shared });
  } catch (err) {
    console.error("[traces/share] Error:", err);
    return Response.json({ error: "Failed to share trace" }, { status: 500 });
  }
}
