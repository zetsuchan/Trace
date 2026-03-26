// ─────────────────────────────────────────────
// TRACE — Access Control Layer
// Enforces practice-scoped data access
// ─────────────────────────────────────────────

import { db } from "@/lib/db";
import {
  practiceMembers,
  patientPracticeLinks,
  patientProfiles,
  traces,
  practices,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// ── Get the practice(s) a provider belongs to ──

export async function getUserPractices(userId: string) {
  return db
    .select({
      practiceId: practiceMembers.practiceId,
      role: practiceMembers.role,
      practiceName: practices.name,
      practiceSlug: practices.slug,
    })
    .from(practiceMembers)
    .innerJoin(practices, eq(practiceMembers.practiceId, practices.id))
    .where(eq(practiceMembers.userId, userId));
}

export async function getUserPrimaryPractice(userId: string) {
  const result = await getUserPractices(userId);
  return result[0] ?? null;
}

// ── Check if a provider can view a specific patient ──

export async function canViewPatient(
  providerUserId: string,
  patientProfileId: string,
): Promise<boolean> {
  // Get all practices the provider belongs to
  const providerPractices = await db
    .select({ practiceId: practiceMembers.practiceId })
    .from(practiceMembers)
    .where(eq(practiceMembers.userId, providerUserId));

  if (providerPractices.length === 0) return false;

  const practiceIds = providerPractices.map((p) => p.practiceId);

  // Check if the patient is linked to any of those practices
  for (const practiceId of practiceIds) {
    const link = await db
      .select({ id: patientPracticeLinks.id })
      .from(patientPracticeLinks)
      .where(
        and(
          eq(patientPracticeLinks.patientProfileId, patientProfileId),
          eq(patientPracticeLinks.practiceId, practiceId),
          eq(patientPracticeLinks.status, "active"),
        ),
      )
      .limit(1);

    if (link.length > 0) return true;
  }

  return false;
}

// ── Check if a user can view a specific trace ──

export async function canViewTrace(
  userId: string,
  userRole: string,
  traceId: string,
): Promise<boolean> {
  // Patients can view their own traces
  if (userRole === "patient") {
    const result = await db
      .select({ id: traces.id })
      .from(traces)
      .where(and(eq(traces.id, traceId), eq(traces.userId, userId)))
      .limit(1);
    return result.length > 0;
  }

  // Providers can view traces of patients in their practice
  const trace = await db
    .select({ userId: traces.userId, patientId: traces.patientId })
    .from(traces)
    .where(eq(traces.id, traceId))
    .limit(1);

  if (trace.length === 0) return false;

  // Find the patient profile for the trace's user
  if (trace[0].userId) {
    const profile = await db
      .select({ id: patientProfiles.id })
      .from(patientProfiles)
      .where(eq(patientProfiles.userId, trace[0].userId))
      .limit(1);

    if (profile.length > 0) {
      return canViewPatient(userId, profile[0].id);
    }
  }

  return false;
}

// ── Check if a user is an admin of a practice ──

export async function isPracticeAdmin(
  userId: string,
  practiceId: string,
): Promise<boolean> {
  const result = await db
    .select({ role: practiceMembers.role })
    .from(practiceMembers)
    .where(
      and(
        eq(practiceMembers.userId, userId),
        eq(practiceMembers.practiceId, practiceId),
      ),
    )
    .limit(1);

  return result.length > 0 && result[0].role === "admin";
}

// ── Check if a user is a member of a practice ──

export async function isPracticeMember(
  userId: string,
  practiceId: string,
): Promise<boolean> {
  const result = await db
    .select({ id: practiceMembers.id })
    .from(practiceMembers)
    .where(
      and(
        eq(practiceMembers.userId, userId),
        eq(practiceMembers.practiceId, practiceId),
      ),
    )
    .limit(1);

  return result.length > 0;
}

// ── Get patients linked to a practice ──

export async function getPracticePatients(practiceId: string) {
  return db
    .select({
      linkId: patientPracticeLinks.id,
      patientProfileId: patientPracticeLinks.patientProfileId,
      linkedAt: patientPracticeLinks.linkedAt,
      profileId: patientProfiles.id,
      userId: patientProfiles.userId,
      genotype: patientProfiles.genotype,
      hbfLevel: patientProfiles.hbfLevel,
      baselineSpo2: patientProfiles.baselineSpo2,
    })
    .from(patientPracticeLinks)
    .innerJoin(
      patientProfiles,
      eq(patientPracticeLinks.patientProfileId, patientProfiles.id),
    )
    .where(
      and(
        eq(patientPracticeLinks.practiceId, practiceId),
        eq(patientPracticeLinks.status, "active"),
      ),
    );
}
