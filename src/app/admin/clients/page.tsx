export const instant = false;
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/admin/rbac";
import AdminClientsClient from "@/components/admin/AdminClientsClient";

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; payment?: string; page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (!session || !hasPermission(role ?? "", "admin.users.view")) redirect("/dashboard");

  const params = await searchParams;
  const q = params.q ?? "";
  const statusFilter = params.status ?? "";
  const paymentFilter = params.payment ?? "";
  const page = parseInt(params.page ?? "1");
  const pageSize = 20;

  const where = {
    ...(q ? {
      OR: [
        { user: { name: { contains: q, mode: "insensitive" as const } } },
        { user: { email: { contains: q, mode: "insensitive" as const } } },
        { title: { contains: q, mode: "insensitive" as const } },
      ],
    } : {}),
    ...(statusFilter ? { generationStatus: statusFilter } : {}),
    ...(paymentFilter === "paid" ? { isPaid: true } : paymentFilter === "unpaid" ? { isPaid: false } : {}),
  };

  const [clients, total] = await Promise.all([
    prisma.businessPlan.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        currentStep: true,
        status: true,
        generationStatus: true,
        generationError: true,
        isPaid: true,
        paidAt: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.businessPlan.count({ where }),
  ]);

  const canContact = hasPermission(role ?? "", "admin.support.view");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Suivi clients</h1>
        <p className="text-gray-500 text-sm mt-1">{total} plan(s) au total</p>
      </div>
      <AdminClientsClient
        clients={clients}
        total={total}
        page={page}
        pageSize={pageSize}
        canContact={canContact}
      />
    </div>
  );
}
