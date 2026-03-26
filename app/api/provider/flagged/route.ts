import { db } from "@/lib/db";
import { traces, users, patientProfiles } from "@/lib/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { getUserPrimaryPractice, getPracticePatients } from "@/lib/auth/access";
import { logAudit, getClientIp } from "@/lib/audit";
import type { Suggestion } from "@/lib/types";

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  if (user.role !== "provider" && user.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const practice = await getUserPrimaryPractice(user.id);
  if (!practice) {
    return Response.json({ traces: [] });
  }

  const patients = await getPracticePatients(practice.practiceId);
  const patientUserIds = patients.map((p) => p.userId);

  if (patientUserIds.length === 0) {
    return Response.json({ traces: [] });
  }

  // Get all traces for practice patients
  const allTraces = await db
    .select({
      id: traces.id,
      inputText: traces.inputText,
      summary: traces.summary,
      suggestions: traces.suggestions,
      chains: traces.chains,
      createdAt: traces.createdAt,
      userId: traces.userId,
    })
    .from(traces)
    .where(inArray(traces.userId, patientUserIds))
    .orderBy(desc(traces.createdAt))
    .limit(100);

  // Filter to only flagged traces (urgent or discuss)
  const flagged = allTraces.filter((t) => {
    const suggs = t.suggestions as Suggestion[] | null;
    return suggs?.some((s) => s.urgency === "urgent" || s.urgency === "discuss");
  });

  // Enrich with patient info
  const enriched = await Promise.all(
    flagged.map(async (t) => {
      let patientName: string | null = null;
      let genotype: string | null = null;

      if (t.userId) {
        const userResult = await db
          .select({ name: users.name })
          .from(users)
          .where(eq(users.id, t.userId))
          .limit(1);
        patientName = userResult[0]?.name ?? null;

        const profileResult = await db
          .select({ genotype: patientProfiles.genotype })
          .from(patientProfiles)
          .where(eq(patientProfiles.userId, t.userId))
          .limit(1);
        genotype = profileResult[0]?.genotype ?? null;
      }

      const suggs = t.suggestions as Suggestion[];
      const highestUrgency = suggs.some((s) => s.urgency === "urgent")
        ? "urgent"
        : "discuss";

      return {
        id: t.id,
        inputText: t.inputText,
        summary: t.summary,
        suggestions: suggs,
        createdAt: t.createdAt,
        patientName,
        genotype,
        highestUrgency,
      };
    }),
  );

  // Sort: urgent first, then discuss, then by date
  enriched.sort((a, b) => {
    if (a.highestUrgency === "urgent" && b.highestUrgency !== "urgent") return -1;
    if (a.highestUrgency !== "urgent" && b.highestUrgency === "urgent") return 1;
    return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
  });

  await logAudit({
    userId: user.id,
    action: "view_patient_list",
    resourceType: "practice",
    resourceId: practice.practiceId,
    metadata: { view: "flagged", count: enriched.length },
    ipAddress: getClientIp(request),
  });

  return Response.json({ traces: enriched });
}
