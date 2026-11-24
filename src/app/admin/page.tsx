export const instant = false;
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/admin/rbac";


async function getAdminStats() {
  const [
    totalUsers,
    totalPlans,
    generatedPlans,
    paidPlans,
    recentUsers,
    plansByStatus,
    usersThisMonth,
    plansThisMonth,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.businessPlan.count(),
    prisma.businessPlan.count({ where: { generationStatus: "GENERATED" } }),
    prisma.businessPlan.count({ where: { isPaid: true } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
    prisma.businessPlan.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    prisma.user.count({
      where: {
        createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
    }),
    prisma.businessPlan.count({
      where: {
        createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
    }),
  ]);

  const totalRevenue = paidPlans * 499; // 499$ CAD par plan

  return {
    totalUsers,
    totalPlans,
    generatedPlans,
    paidPlans,
    totalRevenue,
    recentUsers,
    plansByStatus,
    usersThisMonth,
    plansThisMonth,
  };
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role ?? "";

  if (!hasPermission(role, "admin.dashboard")) {
    redirect("/dashboard?error=unauthorized");
  }

  const stats = await getAdminStats();

  return (
    <div style={{ padding: 32, maxWidth: 1200 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#173F35", margin: 0 }}>
          Tableau de bord Admin
        </h1>
        <p style={{ color: "#6B7280", marginTop: 6, fontSize: 14 }}>
          Vue d&apos;ensemble en temps réel — données de production
        </p>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 20,
          marginBottom: 32,
        }}
      >
        <KpiCard
          label="Utilisateurs total"
          value={stats.totalUsers}
          sub={`+${stats.usersThisMonth} ce mois`}
          color="#173F35"
          icon="👥"
        />
        <KpiCard
          label="Plans créés"
          value={stats.totalPlans}
          sub={`+${stats.plansThisMonth} ce mois`}
          color="#2563EB"
          icon="📋"
        />
        <KpiCard
          label="Plans générés (IA)"
          value={stats.generatedPlans}
          sub={`${stats.totalPlans > 0 ? Math.round((stats.generatedPlans / stats.totalPlans) * 100) : 0}% du total`}
          color="#059669"
          icon="🤖"
        />
        <KpiCard
          label="Plans payés"
          value={stats.paidPlans}
          sub={`${stats.totalRevenue.toLocaleString("fr-CA")} $ CAD`}
          color="#D6A84F"
          icon="💰"
        />
      </div>

      {/* Contenu en 2 colonnes */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Nouveaux utilisateurs */}
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 24,
            border: "1px solid #E5E7EB",
          }}
        >
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "#173F35", margin: "0 0 16px" }}>
            Derniers inscrits
          </h2>
          {stats.recentUsers.map((user: { id: string; name: string | null; email: string; role: string; createdAt: Date }) => (
            <div
              key={user.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 0",
                borderBottom: "1px solid #F3F4F6",
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>
                  {user.name || "(sans nom)"}
                </div>
                <div style={{ fontSize: 12, color: "#6B7280" }}>{user.email}</div>
              </div>
              <div style={{ fontSize: 11, color: "#9CA3AF" }}>
                {new Intl.DateTimeFormat("fr-CA", { day: "2-digit", month: "short" }).format(new Date(user.createdAt))}
              </div>
            </div>
          ))}
        </div>

        {/* Plans par statut */}
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 24,
            border: "1px solid #E5E7EB",
          }}
        >
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "#173F35", margin: "0 0 16px" }}>
            Plans par statut
          </h2>
          {stats.plansByStatus.map((s: { status: string; _count: { status: number } }) => (
            <div
              key={s.status}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 0",
                borderBottom: "1px solid #F3F4F6",
              }}
            >
              <span style={{ fontSize: 13, color: "#374151" }}>{s.status}</span>
              <span
                style={{
                  background: "#F3F4F6",
                  borderRadius: 20,
                  padding: "2px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#173F35",
                }}
              >
                {s._count.status}
              </span>
            </div>
          ))}
          {stats.plansByStatus.length === 0 && (
            <p style={{ color: "#9CA3AF", fontSize: 13 }}>Aucun plan pour l&apos;instant</p>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  color,
  icon,
}: {
  label: string;
  value: number;
  sub: string;
  color: string;
  icon: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: 20,
        border: "1px solid #E5E7EB",
        borderTop: `3px solid ${color}`,
      }}
    >
      <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#111827" }}>
        {value.toLocaleString("fr-CA")}
      </div>
      <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{label}</div>
      <div style={{ fontSize: 11, color: color, marginTop: 6, fontWeight: 500 }}>{sub}</div>
    </div>
  );
}
