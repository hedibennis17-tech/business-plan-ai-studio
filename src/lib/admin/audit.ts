// Audit Log — enregistrement des actions admin sensibles
import { executeRaw } from "@/lib/admin/db";
import { randomUUID } from "crypto";

export async function logAdminAction({
  adminId,
  adminEmail,
  adminRole,
  action,
  targetType,
  targetId,
  details,
  ipAddress,
}: {
  adminId: string;
  adminEmail: string;
  adminRole: string;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}) {
  try {
    const id = randomUUID();
    await executeRaw(
      `INSERT INTO "AdminAuditLog" ("id", "adminId", "adminEmail", "adminRole", "action", "targetType", "targetId", "details", "ipAddress", "createdAt")
       VALUES ($1, $2, $3, $4::"Role", $5, $6, $7, $8::jsonb, $9, NOW())`,
      [
        id,
        adminId,
        adminEmail,
        adminRole,
        action,
        targetType ?? null,
        targetId ?? null,
        details ? JSON.stringify(details) : null,
        ipAddress ?? null,
      ]
    );
  } catch (err) {
    // Ne pas bloquer l'action si le log échoue
    console.error("[AdminAuditLog] Erreur lors du log:", err);
  }
}

export const AUDIT_ACTIONS = {
  USER_SUSPEND: "USER_SUSPEND",
  USER_REACTIVATE: "USER_REACTIVATE",
  USER_ROLE_CHANGE: "USER_ROLE_CHANGE",
  USER_DELETE: "USER_DELETE",
  PLAN_DELETE: "PLAN_DELETE",
  SETTINGS_CHANGE: "SETTINGS_CHANGE",
  ADMIN_LOGIN: "ADMIN_LOGIN",
} as const;
