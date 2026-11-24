import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/admin/rbac";

export const dynamic = "force-dynamic";

export default async function AdminAIControlPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role ?? "";

  if (!hasPermission(role, "admin.ai.view")) {
    redirect("/admin?error=unauthorized");
  }

  const [
    totalGenerations,
    successfulGenerations,
    failedGenerations,
    generatingNow,
    recentFailed,
    topGenerators,
  ] = await Promise.all([
    prisma.businessPlan.count({ where: { generationCount: { gt: 0 } } }),
    prisma.businessPlan.count({ where: { generationStatus: "GENERATED" } }),
    prisma.businessPlan.count({ where: { generationStatus: "GENERATION_FAILED" } }),
    prisma.businessPlan.count({ where: { generationStatus: "GENERATING" } }),
    prisma.businessPlan.findMany({
      where: { generationStatus: "GENERATION_FAILED" },
      orderBy: { updatedAt: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        generationError: true,
        updatedAt: true,
        user: { select: { email: true } },
      },
    }),
    prisma.businessPlan.groupBy({
      by: ["userId"],
      _sum: { generationCount: true },
      orderBy: { _sum: { generationCount: "desc" } },
      take: 5,
    }),
  ]);

  const successRate = totalGenerations > 0
    ? Math.round((successfulGenerations / totalGenerations) * 100)
    : 0;

  return (
    <div style={{ padding: 32, maxWidth: 1100 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#173F35", margin: 0 }}>
          Contrôle IA
        </h1>
        <p style={{ color: "#6B7280", marginTop: 6, fontSize: 14 }}>
          Suivi des générations Claude AI
        </p>
      </div>

      {/* KPIs IA */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Total générations", value: totalGenerations, color: "#173F35", icon: "🤖" },
          { label: "Réussies", value: successfulGenerations, color: "#059669", icon: "✅" },
          { label: "Échouées", value: failedGenerations, color: "#DC2626", icon: "❌" },
          { label: "En cours", value: generatingNow, color: "#D97706", icon: "⚡" },
          { label: "Taux de succès", value: `${successRate}%`, color: "#2563EB", icon: "📊" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            style={{
              background: "#fff",
              borderRadius: 10,
              padding: 16,
              border: "1px solid #E5E7EB",
              borderTop: `3px solid ${kpi.color}`,
            }}
          >
            <div style={{ fontSize: 20, marginBottom: 8 }}>{kpi.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#111827" }}>{kpi.value}</div>
            <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Modèle actif */}
      <div
        style={{
          background: "#F0FDF4",
          border: "1px solid #A7F3D0",
          borderRadius: 10,
          padding: 20,
          marginBottom: 28,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <span style={{ fontSize: 28 }}>🧠</span>
        <div>
          <div style={{ fontWeight: 600, color: "#065F46", fontSize: 15 }}>Modèle actif : claude-opus-4-5</div>
          <div style={{ fontSize: 13, color: "#047857", marginTop: 2 }}>
            Configuré via ANTHROPIC_API_KEY — clé non affichée (variable d&apos;environnement Vercel)
          </div>
        </div>
      </div>

      {/* Générations échouées récentes */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E7EB", padding: 20, marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: "#173F35", margin: "0 0 16px" }}>
          Échecs récents ({recentFailed.length})
        </h2>
        {recentFailed.length === 0 ? (
          <p style={{ color: "#6B7280", fontSize: 13 }}>Aucun échec récent 🎉</p>
        ) : (
          recentFailed.map((plan: { id: string; title: string; generationError: string | null; updatedAt: Date; user: { email: string } }) => (
            <div
              key={plan.id}
              style={{
                borderBottom: "1px solid #FEE2E2",
                paddingBottom: 12,
                marginBottom: 12,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{plan.title}</span>
                <span style={{ fontSize: 11, color: "#9CA3AF" }}>
                  {new Intl.DateTimeFormat("fr-CA", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(plan.updatedAt))}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "#6B7280" }}>{plan.user.email}</div>
              {plan.generationError && (
                <div
                  style={{
                    marginTop: 6,
                    padding: "6px 10px",
                    background: "#FEF2F2",
                    border: "1px solid #FCA5A5",
                    borderRadius: 6,
                    fontSize: 11,
                    color: "#991B1B",
                    fontFamily: "monospace",
                  }}
                >
                  {plan.generationError.slice(0, 200)}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
