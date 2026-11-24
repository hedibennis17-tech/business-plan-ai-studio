import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/admin/rbac";
import AdminPlansClient from "@/components/admin/AdminPlansClient";

export const instant = false;

export default async function AdminPlansPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string; page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !hasPermission(session.user.role, "admin.finance.view")) {
    redirect("/admin?error=unauthorized");
  }

  const sp = await searchParams;
  const page = parseInt(sp.page ?? "1", 10);
  const pageSize = 25;
  const q = sp.q ?? "";
  const filter = sp.filter ?? "active";

  let where: Record<string, unknown> = {};
  if (filter === "active")   where = { isDeleted: false, isArchived: false };
  if (filter === "archived") where = { isArchived: true, isDeleted: false };
  if (filter === "deleted")  where = { isDeleted: true };

  if (q) {
    where = {
      ...where,
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { user: { email: { contains: q, mode: "insensitive" } } },
      ],
    };
  }

  const [plans, total] = await Promise.all([
    prisma.businessPlan.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        status: true,
        generationStatus: true,
        generationCount: true,
        isPaid: true,
        isArchived: true,
        isDeleted: true,
        archivedAt: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { id: true, email: true, name: true } },
        payments: { select: { status: true, amount: true }, orderBy: { createdAt: "desc" }, take: 1 },
      },
    }),
    prisma.businessPlan.count({ where }),
  ]);

  const counts = await Promise.all([
    prisma.businessPlan.count({ where: { isDeleted: false, isArchived: false } }),
    prisma.businessPlan.count({ where: { isArchived: true, isDeleted: false } }),
    prisma.businessPlan.count({ where: { isDeleted: true } }),
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Plans d&apos;affaires</h1>
        <p className="text-gray-500 mt-1">Gestion et modération des plans</p>
      </div>

      {/* Onglets */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {[
          { key: "active", label: "Actifs", count: counts[0] },
          { key: "archived", label: "Archivés", count: counts[1] },
          { key: "deleted", label: "Supprimés", count: counts[2] },
        ].map((tab) => (
          <a
            key={tab.key}
            href={`/admin/plans?filter=${tab.key}`}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              filter === tab.key
                ? "border-green-700 text-green-800"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
              filter === tab.key ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
            }`}>
              {tab.count}
            </span>
          </a>
        ))}
      </div>

      <AdminPlansClient
        plans={plans as Parameters<typeof AdminPlansClient>[0]["plans"]}
        total={total}
        page={page}
        pageSize={pageSize}
        filter={filter}
        q={q}
      />
    </div>
  );
}
