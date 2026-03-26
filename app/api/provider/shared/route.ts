import { db } from "@/lib/db";
import { sharedTraces, traces, users } from "@/lib/db/schema";
import { eq, desc, isNull } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { getUserPrimaryPractice } from "@/lib/auth/access";
import type { Suggestion } from "@/lib/types";

export async function GET() {
  try {
    const user = await getSession();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    if (user.role !== "provider" && user.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const practice = await getUserPrimaryPractice(user.id);
    if (!practice) {
      return Response.json({ shared: [], unviewedCount: 0 });
    }

    const results = await db
      .select({
        id: sharedTraces.id,
        traceId: sharedTraces.traceId,
        patientUserId: sharedTraces.patientUserId,
        note: sharedTraces.note,
        sharedAt: sharedTraces.sharedAt,
        viewedAt: sharedTraces.viewedAt,
        inputText: traces.inputText,
        summary: traces.summary,
        suggestions: traces.suggestions,
        traceCreatedAt: traces.createdAt,
      })
      .from(sharedTraces)
      .innerJoin(traces, eq(sharedTraces.traceId, traces.id))
      .where(eq(sharedTraces.practiceId, practice.practiceId))
      .orderBy(desc(sharedTraces.sharedAt))
      .limit(50);

    // Enrich with patient names
    const enriched = await Promise.all(
      results.map(async (r) => {
        const userResult = await db
          .select({ name: users.name })
          .from(users)
          .where(eq(users.id, r.patientUserId))
          .limit(1);

        return {
          ...r,
          patientName: userResult[0]?.name ?? "Patient",
        };
      }),
    );

    const unviewedCount = enriched.filter((r) => !r.viewedAt).length;

    return Response.json({ shared: enriched, unviewedCount });
  } catch (err) {
    console.error("[provider/shared] Error:", err);
    return Response.json({ error: "Failed to load shared traces" }, { status: 500 });
  }
}
