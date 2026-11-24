import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/admin/rbac";
import { queryRaw } from "@/lib/admin/db";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role ?? "";

  if (!hasPermission(role, "admin.settings.view")) {
    redirect("/admin?error=unauthorized");
  }

  // Stats système
  const [userCount, planCount, emailCount, auditRows] = await Promise.all([
    prisma.user.count(),
    prisma.businessPlan.count(),
    prisma.emailLog.count(),
    queryRaw<{ count: number }>(`SELECT COUNT(*)::int as count FROM "AdminAuditLog"`),
  ]);

  const auditCountNum = auditRows[0]?.count ?? 0;

  return (
    <div style={{ padding: 32, maxWidth: 800 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#173F35", margin: 0 }}>Paramètres système</h1>
        <p style={{ color: "#6B7280", marginTop: 6, fontSize: 14 }}>Configuration de l&apos;application</p>
      </div>

      {/* Variables d'environnement — affiché sans valeurs */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E7EB", padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: "#173F35", margin: "0 0 16px" }}>
          Variables d&apos;environnement actives
        </h2>
        <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 16 }}>
          Les valeurs ne sont jamais affichées. Configurez-les dans Vercel → Environment Variables.
        </p>
        {[
          { key: "DATABASE_URL", desc: "Connexion Neon PostgreSQL" },
          { key: "NEXTAUTH_SECRET", desc: "Secret JWT NextAuth" },
          { key: "NEXTAUTH_URL", desc: "URL de base de l'application" },
          { key: "ANTHROPIC_API_KEY", desc: "Clé API Claude AI" },
          { key: "GOOGLE_CLIENT_ID", desc: "OAuth Google (ID)" },
          { key: "GOOGLE_CLIENT_SECRET", desc: "OAuth Google (Secret)" },
          { key: "RESEND_API_KEY", desc: "Service e-mail Resend" },
        ].map((env) => (
          <div
            key={env.key}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 0",
              borderBottom: "1px solid #F3F4F6",
            }}
          >
            <div>
              <span style={{ fontFamily: "monospace", fontSize: 13, color: "#111827", fontWeight: 600 }}>{env.key}</span>
              <span style={{ fontSize: 12, color: "#6B7280", marginLeft: 12 }}>{env.desc}</span>
            </div>
            <span style={{
              padding: "2px 8px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 600,
              background: "#F0FDF4",
              color: "#059669",
            }}>
              Configurée
            </span>
          </div>
        ))}
      </div>

      {/* Statistiques DB */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E7EB", padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: "#173F35", margin: "0 0 16px" }}>
          Base de données (Neon PostgreSQL)
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          {[
            { label: "Utilisateurs", value: userCount, icon: "👥" },
            { label: "Plans d'affaires", value: planCount, icon: "📋" },
            { label: "Logs e-mails", value: emailCount, icon: "✉️" },
            { label: "Logs d'audit", value: auditCountNum, icon: "🔍" },
          ].map((s) => (
            <div key={s.label} style={{ background: "#F9FAFB", borderRadius: 8, padding: "14px 16px" }}>
              <div style={{ fontSize: 18, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>{s.value.toLocaleString("fr-CA")}</div>
              <div style={{ fontSize: 12, color: "#6B7280" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Infos app */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E7EB", padding: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: "#173F35", margin: "0 0 16px" }}>
          Informations application
        </h2>
        {[
          { label: "Framework", value: "Next.js 15 (App Router)" },
          { label: "Hébergement", value: "Vercel" },
          { label: "Base de données", value: "Neon PostgreSQL (branche production)" },
          { label: "Authentification", value: "NextAuth.js (JWT)" },
          { label: "AI", value: "Anthropic Claude" },
          { label: "Design", value: "Forest Green #173F35" },
        ].map((info) => (
          <div
            key={info.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: "1px solid #F3F4F6",
              fontSize: 13,
            }}
          >
            <span style={{ color: "#6B7280" }}>{info.label}</span>
            <span style={{ color: "#111827", fontWeight: 500 }}>{info.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
