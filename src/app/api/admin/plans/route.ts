/**
 * GET   /api/admin/plans — liste tous les plans (avec filtres)
 * PATCH /api/admin/plans — archive ou soft-delete un plan
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/admin/rbac";


export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !hasPermission(session.user.role, "admin.finance.view")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter") ?? "active"; // active | archived | deleted | all
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 25;

  let where: Record<string, unknown> = {};
  if (filter === "active")   where = { isDeleted: false, isArchived: false };
  if (filter === "archived") where = { isArchived: true, isDeleted: false };
  if (filter === "deleted")  where = { isDeleted: true };

  const [plans, total] = await Promise.all([
    prisma.businessPlan.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        payments: { select: { status: true, amount: true }, orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.businessPlan.count({ where }),
  ]);

  return NextResponse.json({ plans, total, page, totalPages: Math.ceil(total / limit) });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !hasPermission(session.user.role, "admin.finance.view")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { planId, action } = await req.json();
  if (!planId || !action) {
    return NextResponse.json({ error: "planId et action requis" }, { status: 400 });
  }

  const plan = await prisma.businessPlan.findUnique({ where: { id: planId }, select: { id: true } });
  if (!plan) return NextResponse.json({ error: "Plan introuvable" }, { status: 404 });

  let data: Record<string, unknown> = {};

  switch (action) {
    case "archive":
      data = { isArchived: true, archivedAt: new Date() };
      break;
    case "unarchive":
      data = { isArchived: false, archivedAt: null };
      break;
    case "delete":
      // Soft delete — les données restent en DB
      data = { isDeleted: true, deletedAt: new Date() };
      break;
    case "restore":
      data = { isDeleted: false, deletedAt: null, isArchived: false, archivedAt: null };
      break;
    default:
      return NextResponse.json({ error: "Action invalide" }, { status: 400 });
  }

  const updated = await prisma.businessPlan.update({
    where: { id: planId },
    data,
    select: { id: true, isArchived: true, isDeleted: true },
  });

  // Audit log
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma as any).adminAuditLog.create({
    data: {
      adminId: session.user.id,
      adminEmail: session.user.email ?? "",
      adminRole: session.user.role,
      action: `PLAN_${action.toUpperCase()}`,
      targetType: "PLAN",
      targetId: planId,
    },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }).catch((e: any) => console.error("[Admin Plans] Audit log échec:", e));

  return NextResponse.json({ success: true, plan: updated });
}
