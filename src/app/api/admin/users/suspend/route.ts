/**
 * POST /api/admin/users/suspend
 * Body: { userId, reason }
 * Suspend un utilisateur (admin uniquement)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/admin/rbac";
import { logAdminAction } from "@/lib/admin/audit";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !hasPermission(session.user.role, "admin.users.suspend")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { userId, reason } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId requis" }, { status: 400 });

  // Empêcher auto-suspension
  if (userId === session.user.id) {
    return NextResponse.json({ error: "Impossible de vous suspendre vous-même" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, isSuspended: true } });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  if (user.isSuspended) return NextResponse.json({ error: "Utilisateur déjà suspendu" }, { status: 409 });

  await prisma.user.update({
    where: { id: userId },
    data: { isSuspended: true, suspendedAt: new Date(), suspendedReason: reason ?? "Suspendu par un administrateur" },
  });

  await logAdminAction({
    adminId: session.user.id,
    adminEmail: session.user.email ?? "",
    adminRole: session.user.role,
    action: "USER_SUSPEND",
    targetType: "USER",
    targetId: userId,
    details: { reason, targetEmail: user.email },
  });

  return NextResponse.json({ success: true });
}
