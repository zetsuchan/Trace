import { db } from "@/lib/db";
import { practiceMembers, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { isPracticeMember } from "@/lib/auth/access";

// GET — list members of a practice
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

  const members = await db
    .select({
      id: practiceMembers.id,
      role: practiceMembers.role,
      invitedAt: practiceMembers.invitedAt,
      acceptedAt: practiceMembers.acceptedAt,
      userId: users.id,
      name: users.name,
      email: users.email,
    })
    .from(practiceMembers)
    .innerJoin(users, eq(practiceMembers.userId, users.id))
    .where(eq(practiceMembers.practiceId, practiceId));

  return Response.json({ members });
}

// POST — accept an invite (current user accepts their pending membership)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSession();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: practiceId } = await params;

  // Find pending membership for this user
  const pending = await db
    .select()
    .from(practiceMembers)
    .where(
      and(
        eq(practiceMembers.practiceId, practiceId),
        eq(practiceMembers.userId, user.id),
      ),
    )
    .limit(1);

  if (pending.length === 0) {
    return Response.json({ error: "No pending invite found" }, { status: 404 });
  }

  if (pending[0].acceptedAt) {
    return Response.json({ error: "Already accepted" }, { status: 409 });
  }

  await db
    .update(practiceMembers)
    .set({ acceptedAt: new Date() })
    .where(eq(practiceMembers.id, pending[0].id));

  return Response.json({ success: true });
}
