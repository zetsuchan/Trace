import { db } from "@/lib/db";
import { traces, users, patientProfiles } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { canViewPatient } from "@/lib/auth/access";
import { logAudit, getClientIp } from "@/lib/audit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSession();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  if (user.role !== "provider" && user.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: patientUserId } = await params;

  // Get patient profile
  const profile = await db
    .select()
    .from(patientProfiles)
    .where(eq(patientProfiles.userId, patientUserId))
    .limit(1);

  if (profile.length === 0) {
    return Response.json({ error: "Patient not found" }, { status: 404 });
  }

  // Check access
  const hasAccess = await canViewPatient(user.id, profile[0].id);
  if (!hasAccess) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get user info
  const userResult = await db
    .select({ name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, patientUserId))
    .limit(1);

  // Get all traces
  const patientTraces = await db
    .select({
      id: traces.id,
      inputText: traces.inputText,
      summary: traces.summary,
      suggestions: traces.suggestions,
      createdAt: traces.createdAt,
    })
    .from(traces)
    .where(eq(traces.userId, patientUserId))
    .orderBy(desc(traces.createdAt));

  await logAudit({
    userId: user.id,
    action: "view_patient",
    resourceType: "patient",
    resourceId: patientUserId,
    ipAddress: getClientIp(request),
  });

  return Response.json({
    patient: {
      name: userResult[0]?.name ?? userResult[0]?.email ?? "Unknown",
      email: userResult[0]?.email ?? null,
      genotype: profile[0].genotype,
      hbfLevel: profile[0].hbfLevel,
      baselineSpo2: profile[0].baselineSpo2,
      traces: patientTraces,
    },
  });
}
