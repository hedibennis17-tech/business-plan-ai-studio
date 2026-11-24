import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/admin/rbac";

export const dynamic = "force-dynamic";

export default async function AdminDocumentsPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role ?? "";

  if (!hasPermission(role, "admin.documents.view")) {
    redirect("/admin?error=unauthorized");
  }

  const [withPdf, withDocx, withBoth] = await Promise.all([
    prisma.businessPlan.count({ where: { pdfUrl: { not: null } } }),
    prisma.businessPlan.count({ where: { docxUrl: { not: null } } }),
    prisma.businessPlan.count({ where: { pdfUrl: { not: null }, docxUrl: { not: null } } }),
  ]);

  const recentExports = await prisma.businessPlan.findMany({
    where: { OR: [{ pdfUrl: { not: null } }, { docxUrl: { not: null } }] },
    orderBy: { updatedAt: "desc" },
    take: 20,
    select: {
      id: true,
      title: true,
      pdfUrl: true,
      docxUrl: true,
      updatedAt: true,
      user: { select: { email: true, name: true } },
    },
  });

  return (
    <div style={{ padding: 32, maxWidth: 1000 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#173F35", margin: 0 }}>Documents exportés</h1>
        <p style={{ color: "#6B7280", marginTop: 6, fontSize: 14 }}>Suivi des exports PDF et Word</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "PDF générés", value: withPdf, color: "#DC2626", icon: "📄" },
          { label: "Word générés", value: withDocx, color: "#2563EB", icon: "📝" },
          { label: "Les deux formats", value: withBoth, color: "#059669", icon: "✅" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 10, padding: 20, border: "1px solid #E5E7EB", borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#111827" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E5E7EB", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F9FAFB" }}>
              {["Plan", "Utilisateur", "PDF", "Word", "Date"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", borderBottom: "1px solid #E5E7EB" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentExports.map((p: { id: string; title: string; pdfUrl: string | null; docxUrl: string | null; updatedAt: Date; user: { email: string; name: string | null } }) => (
              <tr key={p.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500, color: "#111827" }}>{p.title}</td>
                <td style={{ padding: "12px 16px", fontSize: 12, color: "#6B7280" }}>{p.user.email}</td>
                <td style={{ padding: "12px 16px" }}>
                  {p.pdfUrl ? <span style={{ color: "#059669", fontWeight: 600, fontSize: 12 }}>✓</span> : <span style={{ color: "#D1D5DB", fontSize: 12 }}>—</span>}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  {p.docxUrl ? <span style={{ color: "#2563EB", fontWeight: 600, fontSize: 12 }}>✓</span> : <span style={{ color: "#D1D5DB", fontSize: 12 }}>—</span>}
                </td>
                <td style={{ padding: "12px 16px", fontSize: 12, color: "#6B7280" }}>
                  {new Intl.DateTimeFormat("fr-CA", { day: "2-digit", month: "short" }).format(new Date(p.updatedAt))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {recentExports.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: "#9CA3AF", fontSize: 14 }}>Aucun export pour l&apos;instant</div>
        )}
      </div>
    </div>
  );
}
