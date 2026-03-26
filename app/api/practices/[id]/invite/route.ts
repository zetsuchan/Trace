import { db } from "@/lib/db";
import { practiceMembers, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { isPracticeAdmin } from "@/lib/auth/access";
import { logAudit, getClientIp } from "@/lib/audit";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSession();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: practiceId } = await params;

  // Only admins can invite
  const isAdmin = await isPracticeAdmin(user.id, practiceId);
  if (!isAdmin) {
    return Response.json({ error: "Only practice admins can invite members" }, { status: 403 });
  }

  const { email, role } = await request.json();

  if (!email) {
    return Response.json({ error: "Email is required" }, { status: 400 });
  }

  const memberRole = ["provider", "nurse", "staff"].includes(role) ? role : "provider";

  // Check if the user exists
  const existingUser = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length === 0) {
    // TODO: Send invite email to unregistered user
    return Response.json({
      message: "Invite sent. User will be added when they register.",
      pending: true,
    });
  }

  const inviteeId = existingUser[0].id;

  // Check if already a member
  const existing = await db
    .select({ id: practiceMembers.id })
    .from(practiceMembers)
    .where(
      and(
        eq(practiceMembers.practiceId, practiceId),
        eq(practiceMembers.userId, inviteeId),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    return Response.json({ error: "User is already a member" }, { status: 409 });
  }

  const [member] = await db
    .insert(practiceMembers)
    .values({
      practiceId,
      userId: inviteeId,
      role: memberRole,
      invitedAt: new Date(),
    })
    .returning();

  await logAudit({
    userId: user.id,
    action: "invite_member",
    resourceType: "practice",
    resourceId: practiceId,
    metadata: { inviteeEmail: email, role: memberRole },
    ipAddress: getClientIp(request),
  });

  return Response.json({ member });
}
