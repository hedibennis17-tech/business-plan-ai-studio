export const instant = false;
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { hasPermission, ROLE_LABELS } from "@/lib/admin/rbac";
import { queryRaw } from "@/lib/admin/db";


interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  adminRole: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  details: unknown;
  ipAddress: string | null;
  createdAt: Date;
}

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: { page?: string; action?: string };
}) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role ?? "";

  if (!hasPermission(role, "admin.audit.view")) {
    redirect("/admin?error=unauthorized");
  }

  const page = parseInt(searchParams.page ?? "1", 10);
  const pageSize = 30;
  const filterAction = searchParams.action ?? "";
  const offset = (page - 1) * pageSize;

  let logs: AuditLog[];
  let totalCount: number;

  if (filterAction) {
    [logs, [{ count: totalCount }]] = await Promise.all([
      queryRaw<AuditLog>(
        `SELECT * FROM "AdminAuditLog" WHERE action = $1 ORDER BY "createdAt" DESC LIMIT $2 OFFSET $3`,
        [filterAction, pageSize, offset]
      ),
      queryRaw<{ count: number }>(
        `SELECT COUNT(*)::int as count FROM "AdminAuditLog" WHERE action = $1`,
        [filterAction]
      ),
    ]);
  } else {
    [logs, [{ count: totalCount }]] = await Promise.all([
      queryRaw<AuditLog>(
        `SELECT * FROM "AdminAuditLog" ORDER BY "createdAt" DESC LIMIT $1 OFFSET $2`,
        [pageSize, offset]
      ),
      queryRaw<{ count: number }>(`SELECT COUNT(*)::int as count FROM "AdminAuditLog"`),
    ]);
  }

  const totalPages = Math.ceil((totalCount ?? 0) / pageSize);

  const ACTION_COLORS: Record<string, string> = {
    USER_SUSPEND: "#DC2626",
    USER_REACTIVATE: "#059669",
    USER_ROLE_CHANGE: "#2563EB",
    USER_DELETE: "#7C3AED",
    PLAN_DELETE: "#D97706",
    SETTINGS_CHANGE: "#6B7280",
    ADMIN_LOGIN: "#173F35",
  };

  return (
    <div style={{ padding: 32, maxWidth: 1100 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--primary)", margin: 0 }}>Audit Logs</h1>
        <p style={{ color: "var(--text-muted)", marginTop: 6, fontSize: 14 }}>
          {totalCount ?? 0} action{(totalCount ?? 0) !== 1 ? "s" : ""} enregistrée{(totalCount ?? 0) !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filtre */}
      <form method="GET" style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <select
          name="action"
          defaultValue={filterAction}
          style={{ padding: "8px 14px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 13, background: "var(--surface)" }}
        >
          <option value="">Toutes les actions</option>
          <option value="USER_ROLE_CHANGE">Changement de rôle</option>
          <option value="USER_SUSPEND">Suspension</option>
          <option value="USER_REACTIVATE">Réactivation</option>
          <option value="USER_DELETE">Suppression utilisateur</option>
          <option value="PLAN_DELETE">Suppression plan</option>
          <option value="SETTINGS_CHANGE">Paramètres</option>
        </select>
        <button type="submit" style={{ padding: "8px 20px", background: "#173F35", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>
          Filtrer
        </button>
      </form>

      <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F9FAFB" }}>
              {["Date", "Admin", "Rôle", "Action", "Cible", "IP"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", borderBottom: "1px solid var(--border)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                  {new Intl.DateTimeFormat("fr-CA", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(log.createdAt))}
                </td>
                <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-secondary)" }}>{log.adminEmail}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)" }}>
                    {ROLE_LABELS[log.adminRole] ?? log.adminRole}
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{
                    padding: "2px 8px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 600,
                    background: (ACTION_COLORS[log.action] ?? "#6B7280") + "20",
                    color: ACTION_COLORS[log.action] ?? "#6B7280",
                  }}>
                    {log.action}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-secondary)" }}>
                  {log.targetType && log.targetId ? `${log.targetType}: ${log.targetId.slice(0, 8)}...` : "—"}
                </td>
                <td style={{ padding: "12px 16px", fontSize: 11, color: "var(--text-muted)" }}>
                  {log.ipAddress ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)", fontSize: 14 }}>Aucun log d&apos;audit</div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/admin/audit-logs?action=${filterAction}&page=${p}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: 8,
                border: "1px solid",
                borderColor: p === page ? "#173F35" : "#D1D5DB",
                background: p === page ? "#173F35" : "#fff",
                color: p === page ? "#fff" : "#374151",
                fontSize: 13,
                textDecoration: "none",
              }}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
