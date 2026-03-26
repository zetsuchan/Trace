import { db } from "@/lib/db";
import { practices, patientPracticeLinks, patientProfiles } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { logAudit, getClientIp } from "@/lib/audit";

// GET — list practices the patient is linked to
export async function GET() {
  const user = await getSession();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Get patient's profile
  const profile = await db
    .select({ id: patientProfiles.id })
    .from(patientProfiles)
    .where(eq(patientProfiles.userId, user.id))
    .limit(1);

  if (profile.length === 0) {
    return Response.json({ links: [] });
  }

  const links = await db
    .select({
      linkId: patientPracticeLinks.id,
      status: patientPracticeLinks.status,
      linkedAt: patientPracticeLinks.linkedAt,
      practiceId: practices.id,
      practiceName: practices.name,
      practiceSlug: practices.slug,
    })
    .from(patientPracticeLinks)
    .innerJoin(practices, eq(patientPracticeLinks.practiceId, practices.id))
    .where(eq(patientPracticeLinks.patientProfileId, profile[0].id));

  return Response.json({ links });
}

// POST — link patient to a practice via slug code
export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await request.json();

  if (!code) {
    return Response.json({ error: "Practice code is required" }, { status: 400 });
  }

  // Find practice by slug
  const practice = await db
    .select({ id: practices.id, name: practices.name })
    .from(practices)
    .where(eq(practices.slug, code.toLowerCase().trim()))
    .limit(1);

  if (practice.length === 0) {
    return Response.json({ error: "Practice not found. Check the code and try again." }, { status: 404 });
  }

  // Get patient profile
  const profile = await db
    .select({ id: patientProfiles.id })
    .from(patientProfiles)
    .where(eq(patientProfiles.userId, user.id))
    .limit(1);

  if (profile.length === 0) {
    return Response.json({ error: "No patient profile found. Complete your profile first." }, { status: 400 });
  }

  // Check if already linked
  const existing = await db
    .select({ id: patientPracticeLinks.id, status: patientPracticeLinks.status })
    .from(patientPracticeLinks)
    .where(
      and(
        eq(patientPracticeLinks.patientProfileId, profile[0].id),
        eq(patientPracticeLinks.practiceId, practice[0].id),
      ),
    )
    .limit(1);

  if (existing.length > 0 && existing[0].status === "active") {
    return Response.json({ error: "Already linked to this practice" }, { status: 409 });
  }

  // Re-activate or create link
  if (existing.length > 0) {
    await db
      .update(patientPracticeLinks)
      .set({ status: "active", linkedAt: new Date(), linkedBy: user.id })
      .where(eq(patientPracticeLinks.id, existing[0].id));
  } else {
    await db.insert(patientPracticeLinks).values({
      patientProfileId: profile[0].id,
      practiceId: practice[0].id,
      linkedBy: user.id,
      status: "active",
    });
  }

  await logAudit({
    userId: user.id,
    action: "link_practice",
    resourceType: "practice",
    resourceId: practice[0].id,
    ipAddress: getClientIp(request),
  });

  return Response.json({ success: true, practiceName: practice[0].name });
}

// DELETE — revoke a practice link
export async function DELETE(request: Request) {
  const user = await getSession();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { linkId } = await request.json();

  if (!linkId) {
    return Response.json({ error: "Link ID is required" }, { status: 400 });
  }

  // Get patient profile
  const profile = await db
    .select({ id: patientProfiles.id })
    .from(patientProfiles)
    .where(eq(patientProfiles.userId, user.id))
    .limit(1);

  if (profile.length === 0) {
    return Response.json({ error: "No patient profile" }, { status: 400 });
  }

  // Verify ownership and revoke
  const link = await db
    .select({ id: patientPracticeLinks.id, patientProfileId: patientPracticeLinks.patientProfileId })
    .from(patientPracticeLinks)
    .where(eq(patientPracticeLinks.id, linkId))
    .limit(1);

  if (link.length === 0 || link[0].patientProfileId !== profile[0].id) {
    return Response.json({ error: "Link not found" }, { status: 404 });
  }

  await db
    .update(patientPracticeLinks)
    .set({ status: "revoked" })
    .where(eq(patientPracticeLinks.id, linkId));

  await logAudit({
    userId: user.id,
    action: "revoke_practice",
    resourceType: "practice",
    resourceId: linkId,
    ipAddress: getClientIp(request),
  });

  return Response.json({ success: true });
}
