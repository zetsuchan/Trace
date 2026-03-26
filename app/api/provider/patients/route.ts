import { db } from "@/lib/db";
import { traces, users } from "@/lib/db/schema";
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
    return Response.json({ patients: [] });
  }

  const patients = await getPracticePatients(practice.practiceId);

  // Enrich each patient with user info and latest trace data
  const enriched = await Promise.all(
    patients.map(async (p) => {
      // Get user name
      const userResult = await db
        .select({ name: users.name, email: users.email })
        .from(users)
        .where(eq(users.id, p.userId))
        .limit(1);

      // Get latest trace
      const latestTrace = await db
        .select({
          id: traces.id,
          inputText: traces.inputText,
          suggestions: traces.suggestions,
          createdAt: traces.createdAt,
        })
        .from(traces)
        .where(eq(traces.userId, p.userId))
        .orderBy(desc(traces.createdAt))
        .limit(1);

      // Get trace count
      const allTraces = await db
        .select({ id: traces.id, suggestions: traces.suggestions })
        .from(traces)
        .where(eq(traces.userId, p.userId));

      // Determine highest urgency from latest trace
      let lastUrgency: string = "none";
      if (latestTrace[0]?.suggestions) {
        const suggs = latestTrace[0].suggestions as Suggestion[];
        if (suggs.some((s) => s.urgency === "urgent")) lastUrgency = "urgent";
        else if (suggs.some((s) => s.urgency === "discuss")) lastUrgency = "discuss";
        else if (suggs.length > 0) lastUrgency = "info";
      }

      return {
        profileId: p.profileId,
        userId: p.userId,
        name: userResult[0]?.name ?? userResult[0]?.email ?? "Unknown",
        email: userResult[0]?.email ?? null,
        genotype: p.genotype,
        hbfLevel: p.hbfLevel,
        linkedAt: p.linkedAt,
        traceCount: allTraces.length,
        lastTraceDate: latestTrace[0]?.createdAt ?? null,
        lastTraceInput: latestTrace[0]?.inputText ?? null,
        lastUrgency,
      };
    }),
  );

  await logAudit({
    userId: user.id,
    action: "view_patient_list",
    resourceType: "practice",
    resourceId: practice.practiceId,
    ipAddress: getClientIp(request),
  });

  return Response.json({ patients: enriched });
}
