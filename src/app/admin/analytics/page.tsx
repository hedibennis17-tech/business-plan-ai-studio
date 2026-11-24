export const instant = false;
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/admin/rbac";


export default async function AdminAnalyticsPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role ?? "";

  if (!hasPermission(role, "admin.analytics.view")) {
    redirect("/admin?error=unauthorized");
  }

  // Stats des 30 derniers jours
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalUsers,
    newUsersMonth,
    totalPlans,
    newPlansMonth,
    paidPlans,
    generatedPlans,
    plansByStep,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.businessPlan.count(),
    prisma.businessPlan.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.businessPlan.count({ where: { isPaid: true } }),
    prisma.businessPlan.count({ where: { generationStatus: "GENERATED" } }),
    prisma.businessPlan.groupBy({
      by: ["currentStep"],
      _count: { currentStep: true },
      orderBy: { currentStep: "asc" },
    }),
  ]);

  const totalRevenue = paidPlans * 499;
  const conversionRate = totalPlans > 0 ? Math.round((paidPlans / totalPlans) * 100) : 0;
  const aiAdoptionRate = totalPlans > 0 ? Math.round((generatedPlans / totalPlans) * 100) : 0;

  return (
    <div style={{ padding: 32, maxWidth: 1100 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--primary)", margin: 0 }}>Analytique</h1>
        <p style={{ color: "var(--text-muted)", marginTop: 6, fontSize: 14 }}>Vue d&apos;ensemble des métriques clés</p>
      </div>

      {/* KPIs principaux */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        {[
          { label: "Utilisateurs total", value: totalUsers, sub: `+${newUsersMonth} / 30j`, color: "var(--primary)", icon: "👥" },
          { label: "Plans créés", value: totalPlans, sub: `+${newPlansMonth} / 30j`, color: "#2563EB", icon: "📋" },
          { label: "Revenu total (CAD)", value: `${totalRevenue.toLocaleString("fr-CA")} $`, sub: `${paidPlans} plan(s) payé(s)`, color: "var(--accent)", icon: "💰" },
          { label: "Taux conversion", value: `${conversionRate}%`, sub: "gratuit → payant", color: "#059669", icon: "🎯" },
          { label: "Adoption IA", value: `${aiAdoptionRate}%`, sub: `${generatedPlans} plans générés`, color: "#7C3AED", icon: "🤖" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            style={{
              background: "var(--surface)",
              borderRadius: 10,
              padding: 20,
              border: "1px solid var(--border)",
              borderTop: `3px solid ${kpi.color}`,
            }}
          >
            <div style={{ fontSize: 20, marginBottom: 8 }}>{kpi.icon}</div>
            <div style={{ fontSize: typeof kpi.value === "string" && kpi.value.length > 6 ? 18 : 26, fontWeight: 700, color: "var(--text)" }}>
              {kpi.value}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{kpi.label}</div>
            <div style={{ fontSize: 11, color: kpi.color, marginTop: 6, fontWeight: 500 }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Distribution par étape */}
      <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)", padding: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--primary)", margin: "0 0 20px" }}>
          Distribution des plans par étape actuelle
        </h2>
        {plansByStep.map((s: { currentStep: number; _count: { currentStep: number } }) => {
          const pct = totalPlans > 0 ? Math.round((s._count.currentStep / totalPlans) * 100) : 0;
          return (
            <div key={s.currentStep} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>Étape {s.currentStep}</span>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{s._count.currentStep} plan{s._count.currentStep !== 1 ? "s" : ""} ({pct}%)</span>
              </div>
              <div style={{ background: "var(--primary-muted)", borderRadius: 4, height: 8, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: "#173F35",
                    borderRadius: 4,
                    transition: "width 0.3s",
                  }}
                />
              </div>
            </div>
          );
        })}
        {plansByStep.length === 0 && (
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Aucune donnée</p>
        )}
      </div>
    </div>
  );
}
