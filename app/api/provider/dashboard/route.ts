import { db } from "@/lib/db";
import { traces, users, patientProfiles, patientPracticeLinks, suggestions as suggestionsTable } from "@/lib/db/schema";
import { eq, and, gte, desc, inArray } from "drizzle-orm";
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
    return Response.json({
      stats: { totalPatients: 0, tracesThisWeek: 0, flaggedCount: 0 },
      recentTraces: [],
      practiceId: null,
    });
  }

  // Get patients in practice
  const patients = await getPracticePatients(practice.practiceId);
  const patientUserIds = patients.map((p) => p.userId);

  // Get traces this week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  let recentTraces: Array<{
    id: string;
    inputText: string;
    summary: string | null;
    suggestions: unknown;
    createdAt: Date | null;
    userId: string | null;
    patientName: string | null;
    genotype: string | null;
  }> = [];

  let tracesThisWeek = 0;
  let flaggedCount = 0;

  if (patientUserIds.length > 0) {
    // Recent traces across all patients
    const traceResults = await db
      .select({
        id: traces.id,
        inputText: traces.inputText,
        summary: traces.summary,
        suggestions: traces.suggestions,
        createdAt: traces.createdAt,
        userId: traces.userId,
      })
      .from(traces)
      .where(inArray(traces.userId, patientUserIds))
      .orderBy(desc(traces.createdAt))
      .limit(20);

    // Enrich with patient names and genotypes
    recentTraces = await Promise.all(
      traceResults.map(async (t) => {
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

        return { ...t, patientName, genotype };
      }),
    );

    // Count traces this week
    tracesThisWeek = traceResults.filter(
      (t) => t.createdAt && new Date(t.createdAt) >= oneWeekAgo,
    ).length;

    // Count flagged (urgent or discuss)
    flaggedCount = traceResults.filter((t) => {
      const suggs = t.suggestions as Suggestion[] | null;
      return suggs?.some((s) => s.urgency === "urgent" || s.urgency === "discuss");
    }).length;
  }

  await logAudit({
    userId: user.id,
    action: "view_patient_list",
    resourceType: "practice",
    resourceId: practice.practiceId,
    ipAddress: getClientIp(request),
  });

  return Response.json({
    stats: {
      totalPatients: patients.length,
      tracesThisWeek,
      flaggedCount,
    },
    recentTraces: recentTraces.map((t) => ({
      id: t.id,
      inputText: t.inputText,
      summary: t.summary,
      suggestions: t.suggestions,
      createdAt: t.createdAt,
      patientName: t.patientName,
      genotype: t.genotype,
    })),
    practiceId: practice.practiceId,
  });
}
