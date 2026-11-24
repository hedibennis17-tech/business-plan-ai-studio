export const instant = false;
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/admin/rbac";


export default async function AdminEmailsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role ?? "";

  if (!hasPermission(role, "admin.emails.view")) {
    redirect("/admin?error=unauthorized");
  }

  const page = parseInt(searchParams.page ?? "1", 10);
  const pageSize = 25;

  const [logs, total, byType] = await Promise.all([
    prisma.emailLog.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.emailLog.count(),
    prisma.emailLog.groupBy({
      by: ["type"],
      _count: { type: true },
      orderBy: { _count: { type: "desc" } },
    }),
  ]);

  return (
    <div style={{ padding: 32, maxWidth: 1000 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#173F35", margin: 0 }}>E-mails envoyés</h1>
        <p style={{ color: "#6B7280", marginTop: 6, fontSize: 14 }}>{total} e-mail{total !== 1 ? "s" : ""} dans les logs</p>
      </div>

      {/* Stats par type */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        {byType.map((t: { type: string; _count: { type: number } }) => (
          <div key={t.type} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, padding: "10px 16px" }}>
            <div style={{ fontSize: 12, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{t.type}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#173F35" }}>{t._count.type}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E7EB", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F9FAFB" }}>
              {["Destinataire", "Sujet", "Type", "Statut", "Date"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", borderBottom: "1px solid #E5E7EB" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map((log: { id: string; to: string; subject: string; type: string; status: string; createdAt: Date }) => (
              <tr key={log.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#374151" }}>{log.to}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#111827" }}>{log.subject}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "#EFF6FF", color: "#1D4ED8" }}>
                    {log.type}
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{
                    padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: log.status === "sent" ? "#D1FAE5" : "#FEE2E2",
                    color: log.status === "sent" ? "#065F46" : "#991B1B",
                  }}>
                    {log.status}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", fontSize: 12, color: "#6B7280" }}>
                  {new Intl.DateTimeFormat("fr-CA", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(log.createdAt))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: "#9CA3AF", fontSize: 14 }}>Aucun log d&apos;e-mail</div>
        )}
      </div>
    </div>
  );
}
