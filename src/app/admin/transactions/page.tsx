export const instant = false;

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/admin/rbac";
import AdminTransactionsClient from "@/components/admin/AdminTransactionsClient";

export default async function AdminTransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role ?? "";
  if (!session || !hasPermission(role, "admin.finance.view")) {
    redirect("/dashboard?error=unauthorized");
  }

  const params = await searchParams;
  const statusFilter = params.status ?? "ALL";
  const search = params.search ?? "";
  const page = parseInt(params.page ?? "1");
  const pageSize = 25;

  // KPIs globaux
  const [totalRevenue, totalCount, completedCount, refundedCount, failedCount] = await Promise.all([
    prisma.payment.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amount: true },
    }),
    prisma.payment.count(),
    prisma.payment.count({ where: { status: "COMPLETED" } }),
    prisma.payment.count({ where: { status: "REFUNDED" } }),
    prisma.payment.count({ where: { status: "FAILED" } }),
  ]);

  // Revenus du mois en cours
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const revenueThisMonth = await prisma.payment.aggregate({
    where: { status: "COMPLETED", createdAt: { gte: startOfMonth } },
    _sum: { amount: true },
  });

  // Filtres
  const whereClause: Record<string, unknown> = {};
  if (statusFilter !== "ALL") whereClause.status = statusFilter;
  if (search) {
    whereClause.OR = [
      { user: { email: { contains: search, mode: "insensitive" } } },
      { user: { name: { contains: search, mode: "insensitive" } } },
      { stripeSessionId: { contains: search, mode: "insensitive" } },
    ];
  }

  const [payments, totalFiltered] = await Promise.all([
    prisma.payment.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, email: true } },
        businessPlan: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.payment.count({ where: whereClause }),
  ]);

  const kpis = {
    totalRevenue: (totalRevenue._sum.amount ?? 0) / 100,
    revenueThisMonth: (revenueThisMonth._sum.amount ?? 0) / 100,
    totalCount,
    completedCount,
    refundedCount,
    failedCount,
  };

  return (
    <AdminTransactionsClient
      kpis={kpis}
      payments={payments.map((p: typeof payments[number]) => ({
        id: p.id,
        stripeSessionId: p.stripeSessionId,
        stripePaymentIntentId: p.stripePaymentIntentId ?? null,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        createdAt: p.createdAt,
        user: p.user,
        planTitle: p.businessPlan.title,
      }))}
      totalFiltered={totalFiltered}
      page={page}
      pageSize={pageSize}
      statusFilter={statusFilter}
      search={search}
    />
  );
}
