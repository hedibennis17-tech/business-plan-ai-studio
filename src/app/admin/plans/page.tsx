export const instant = false;
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/admin/rbac";


export default async function AdminPlansPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; page?: string };
}) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role ?? "";

  if (!hasPermission(role, "admin.plans.view")) {
    redirect("/admin?error=unauthorized");
  }

  const page = parseInt(searchParams.page ?? "1", 10);
  const pageSize = 20;
  const q = searchParams.q ?? "";
  const filterStatus = searchParams.status ?? "";

  const where = {
    ...(q ? {
      OR: [
        { title: { contains: q, mode: "insensitive" as const } },
        { user: { email: { contains: q, mode: "insensitive" as const } } },
      ],
    } : {}),
    ...(filterStatus ? { generationStatus: filterStatus } : {}),
  };

  const [plans, total] = await Promise.all([
    prisma.businessPlan.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        status: true,
        generationStatus: true,
        generationCount: true,
        isPaid: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { email: true, name: true } },
      },
    }),
    prisma.businessPlan.count({ where }),
  ]);

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#173F35", margin: 0 }}>
          Plans d&apos;affaires
        </h1>
        <p style={{ color: "#6B7280", marginTop: 6, fontSize: 14 }}>
          {total} plan{total !== 1 ? "s" : ""} au total
        </p>
      </div>

      {/* Filtres */}
      <form method="GET" style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <input
          name="q"
          defaultValue={q}
          placeholder="Titre ou email..."
          style={{
            flex: 1,
            minWidth: 200,
            padding: "8px 14px",
            border: "1px solid #D1D5DB",
            borderRadius: 8,
            fontSize: 13,
          }}
        />
        <select
          name="status"
          defaultValue={filterStatus}
          style={{ padding: "8px 14px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 13, background: "#fff" }}
        >
          <option value="">Tous les statuts IA</option>
          <option value="GENERATING">En cours</option>
          <option value="GENERATED">Généré</option>
          <option value="GENERATION_FAILED">Échec</option>
        </select>
        <button
          type="submit"
          style={{ padding: "8px 20px", background: "#173F35", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer" }}
        >
          Filtrer
        </button>
      </form>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E7EB", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F9FAFB" }}>
              {["Plan", "Propriétaire", "Statut plan", "Statut IA", "Générations", "Payé", "Date"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#6B7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    borderBottom: "1px solid #E5E7EB",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {plans.map((plan: { id: string; title: string; status: string; generationStatus: string | null; generationCount: number; isPaid: boolean; createdAt: Date; updatedAt: Date; user: { email: string; name: string | null } }) => (
              <tr key={plan.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{plan.title}</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF" }}>{plan.id.slice(0, 8)}...</div>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ fontSize: 13, color: "#374151" }}>{plan.user.name ?? "(sans nom)"}</div>
                  <div style={{ fontSize: 12, color: "#6B7280" }}>{plan.user.email}</div>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <StatusBadge status={plan.status} />
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <AIStatusBadge status={plan.generationStatus} />
                </td>
                <td style={{ padding: "14px 16px", fontSize: 13, color: "#374151", textAlign: "center" }}>
                  {plan.generationCount}
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{
                    padding: "2px 8px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 600,
                    background: plan.isPaid ? "#D1FAE5" : "#F3F4F6",
                    color: plan.isPaid ? "#065F46" : "#6B7280",
                  }}>
                    {plan.isPaid ? "✓ Payé" : "Gratuit"}
                  </span>
                </td>
                <td style={{ padding: "14px 16px", fontSize: 12, color: "#6B7280" }}>
                  {new Intl.DateTimeFormat("fr-CA", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(plan.createdAt))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {plans.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: "#9CA3AF", fontSize: 14 }}>
            Aucun plan trouvé
          </div>
        )}
      </div>

      {/* Pagination */}
      {Math.ceil(total / pageSize) > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
          {Array.from({ length: Math.ceil(total / pageSize) }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/admin/plans?q=${q}&status=${filterStatus}&page=${p}`}
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
                fontWeight: p === page ? 600 : 400,
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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    DRAFT: { bg: "#F3F4F6", color: "#6B7280", label: "Brouillon" },
    IN_PROGRESS: { bg: "#FEF3C7", color: "#92400E", label: "En cours" },
    COMPLETE: { bg: "#D1FAE5", color: "#065F46", label: "Complet" },
    GENERATED: { bg: "#EDE9FE", color: "#5B21B6", label: "Généré" },
    GENERATION_FAILED: { bg: "#FEE2E2", color: "#991B1B", label: "Échec" },
  };
  const s = map[status] ?? { bg: "#F3F4F6", color: "#6B7280", label: status };
  return (
    <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

function AIStatusBadge({ status }: { status: string | null }) {
  if (!status) return <span style={{ fontSize: 12, color: "#9CA3AF" }}>—</span>;
  const map: Record<string, { bg: string; color: string }> = {
    GENERATING: { bg: "#FEF3C7", color: "#92400E" },
    GENERATED: { bg: "#D1FAE5", color: "#065F46" },
    GENERATION_FAILED: { bg: "#FEE2E2", color: "#991B1B" },
  };
  const s = map[status] ?? { bg: "#F3F4F6", color: "#6B7280" };
  return (
    <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color }}>
      {status}
    </span>
  );
}
