import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { isPracticeMember, getPracticePatients } from "@/lib/auth/access";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSession();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: practiceId } = await params;

  const isMember = await isPracticeMember(user.id, practiceId);
  if (!isMember) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const patients = await getPracticePatients(practiceId);

  // Enrich with user names
  const enriched = await Promise.all(
    patients.map(async (p) => {
      const userResult = await db
        .select({ name: users.name, email: users.email })
        .from(users)
        .where(eq(users.id, p.userId))
        .limit(1);

      return {
        ...p,
        name: userResult[0]?.name ?? null,
        email: userResult[0]?.email ?? null,
      };
    }),
  );

  return Response.json({ patients: enriched });
}
