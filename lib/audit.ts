// ─────────────────────────────────────────────
// TRACE — Audit Logging (HIPAA requirement)
// Every PHI access must be logged
// ─────────────────────────────────────────────

import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";

type AuditAction =
  | "login"
  | "logout"
  | "guest_login"
  | "register"
  | "view_trace"
  | "create_trace"
  | "share_trace"
  | "view_patient"
  | "view_patient_list"
  | "link_practice"
  | "revoke_practice"
  | "create_practice"
  | "invite_member";

type ResourceType = "trace" | "patient" | "practice" | "user";

export async function logAudit(params: {
  userId: string | null;
  action: AuditAction;
  resourceType?: ResourceType;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      userId: params.userId,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      metadata: params.metadata ?? {},
      ipAddress: params.ipAddress,
    });
  } catch (err) {
    // Audit logging should never crash the app — log and continue
    console.error("[audit] Failed to write audit log:", err);
  }
}

// Helper to extract IP from request headers
export function getClientIp(request: Request): string | undefined {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    undefined
  );
}
