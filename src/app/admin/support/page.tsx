export const instant = false;
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/admin/rbac";


export default async function AdminSupportPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role ?? "";

  if (!hasPermission(role, "admin.support.view")) {
    redirect("/admin?error=unauthorized");
  }

  return (
    <div style={{ padding: 32, maxWidth: 900 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#173F35", margin: 0 }}>Support client</h1>
        <p style={{ color: "#6B7280", marginTop: 6, fontSize: 14 }}>Gestion des demandes d&apos;assistance</p>
      </div>

      {/* Info */}
      <div style={{
        background: "#F0FDF4",
        border: "1px solid #A7F3D0",
        borderRadius: 10,
        padding: 20,
        marginBottom: 28,
      }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#065F46", marginBottom: 8 }}>
          📧 Support via e-mail
        </div>
        <p style={{ fontSize: 13, color: "#047857", margin: 0 }}>
          Les demandes de support arrivent à <strong>support@businessplanstudio.ca</strong>
          . Configurez Resend ou votre client mail pour gérer les tickets ici.
        </p>
      </div>

      {/* Accès rapides */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {[
          {
            title: "Fermeture de compte",
            desc: "Les demandes de fermeture arrivent par e-mail depuis la page /dashboard/settings",
            icon: "🔒",
            color: "#DC2626",
          },
          {
            title: "Accès Premium anticipé",
            desc: "Les demandes arrivent via le formulaire /dashboard/billing (mailto CTA)",
            icon: "⭐",
            color: "#D6A84F",
          },
          {
            title: "Questions générales",
            desc: "Répondre via e-mail ou configurer un système de tickets",
            icon: "💬",
            color: "#2563EB",
          },
          {
            title: "Problèmes de génération",
            desc: "Vérifier les erreurs dans le module Contrôle IA → Échecs récents",
            icon: "🤖",
            color: "#059669",
          },
        ].map((item) => (
          <div
            key={item.title}
            style={{
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: 10,
              padding: 20,
              borderLeft: `4px solid ${item.color}`,
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 10 }}>{item.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 6 }}>{item.title}</div>
            <div style={{ fontSize: 13, color: "#6B7280" }}>{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
