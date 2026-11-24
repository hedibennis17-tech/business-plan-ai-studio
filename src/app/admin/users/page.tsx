import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/admin/rbac";
import AdminUsersClient from "@/components/admin/AdminUsersClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string; role?: string; page?: string };
}) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role ?? "";

  if (!hasPermission(role, "admin.users.view")) {
    redirect("/admin?error=unauthorized");
  }

  const page = parseInt(searchParams.page ?? "1", 10);
  const pageSize = 20;
  const q = searchParams.q ?? "";
  const filterRole = searchParams.role ?? "";

  const where = {
    ...(q ? {
      OR: [
        { email: { contains: q, mode: "insensitive" as const } },
        { name: { contains: q, mode: "insensitive" as const } },
      ],
    } : {}),
    ...(filterRole ? { role: filterRole as "USER" | "ADMIN" | "SUPER_ADMIN" | "SUPPORT" | "FINANCE" } : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        googleId: true,
        _count: { select: { businessPlans: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#173F35", margin: 0 }}>
          Gestion des utilisateurs
        </h1>
        <p style={{ color: "#6B7280", marginTop: 6, fontSize: 14 }}>
          {total} utilisateur{total !== 1 ? "s" : ""} au total
        </p>
      </div>

      <AdminUsersClient
        users={users.map((u: { id: string; name: string | null; email: string; role: string; createdAt: Date; googleId: string | null; _count: { businessPlans: number } }) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt.toISOString(),
          isGoogle: !!u.googleId,
          planCount: u._count.businessPlans,
        }))}
        total={total}
        page={page}
        pageSize={pageSize}
        query={q}
        filterRole={filterRole}
        canSuspend={hasPermission(role, "admin.users.suspend")}
        canChangeRole={hasPermission(role, "admin.users.role_change")}
      />
    </div>
  );
}
