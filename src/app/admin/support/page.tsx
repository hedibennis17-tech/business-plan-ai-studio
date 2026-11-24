import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { supportTicket } from "@/lib/prisma-ext";
import { hasPermission } from "@/lib/admin/rbac";
import AdminSupportClient from "@/components/admin/AdminSupportClient";

export const instant = false;

export default async function AdminSupportPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !hasPermission(session.user.role, "admin.support.view")) {
    redirect("/admin");
  }

  const [tickets, stats] = await Promise.all([
    supportTicket.findMany({
      include: {
        user: { select: { name: true, email: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1, include: { user: { select: { name: true, isAdmin: false } } } },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
    }),
    supportTicket.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const statMap = Object.fromEntries(stats.map((s: any) => [s.status, s._count?._all ?? s._count?.status ?? 0]));

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Support</h1>
        <p className="text-gray-500 mt-1">Gestion des tickets de support client</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Ouverts", key: "OPEN", color: "text-blue-600", bg: "bg-blue-50" },
          { label: "En cours", key: "IN_PROGRESS", color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Résolus", key: "RESOLVED", color: "text-green-600", bg: "bg-green-50" },
          { label: "Fermés", key: "CLOSED", color: "text-gray-600", bg: "bg-gray-50" },
        ].map((s) => (
          <div key={s.key} className={`${s.bg} rounded-xl p-4`}>
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{statMap[s.key] ?? 0}</p>
          </div>
        ))}
      </div>

      <AdminSupportClient
        initialTickets={tickets as Parameters<typeof AdminSupportClient>[0]["initialTickets"]}
        canRespond={hasPermission(session.user.role, "admin.support.respond")}
      />
    </div>
  );
}
