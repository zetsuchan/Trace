import { db } from "@/lib/db";
import { practices } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { isPracticeMember } from "@/lib/auth/access";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSession();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Check membership
  const isMember = await isPracticeMember(user.id, id);
  if (!isMember) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await db
    .select()
    .from(practices)
    .where(eq(practices.id, id))
    .limit(1);

  if (result.length === 0) {
    return Response.json({ error: "Practice not found" }, { status: 404 });
  }

  return Response.json({ practice: result[0] });
}
