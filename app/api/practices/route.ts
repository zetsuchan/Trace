import { db } from "@/lib/db";
import { practices, practiceMembers } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { logAudit, getClientIp } from "@/lib/audit";
import { getUserPractices } from "@/lib/auth/access";

// GET — list practices the current user belongs to
export async function GET() {
  const user = await getSession();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const result = await getUserPractices(user.id);
  return Response.json({ practices: result });
}

// POST — create a new practice
export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  if (user.role !== "provider" && user.role !== "admin") {
    return Response.json({ error: "Only providers can create practices" }, { status: 403 });
  }

  const { name, npi, address } = await request.json();

  if (!name) {
    return Response.json({ error: "Practice name is required" }, { status: 400 });
  }

  // Generate slug from name
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const [practice] = await db
    .insert(practices)
    .values({
      name,
      slug,
      npi: npi || null,
      address: address || null,
    })
    .returning();

  // Add the creator as admin
  await db.insert(practiceMembers).values({
    practiceId: practice.id,
    userId: user.id,
    role: "admin",
    acceptedAt: new Date(),
  });

  await logAudit({
    userId: user.id,
    action: "create_practice",
    resourceType: "practice",
    resourceId: practice.id,
    ipAddress: getClientIp(request),
  });

  return Response.json({ practice });
}
