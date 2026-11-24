/**
 * POST /api/admin/users/reactivate
 * Body: { userId }
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/admin/rbac";
import { logAdminAction } from "@/lib/admin/audit";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !hasPermission(session.user.role, "admin.users.reactivate")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId requis" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, isSuspended: true } });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  if (!user.isSuspended) return NextResponse.json({ error: "Utilisateur non suspendu" }, { status: 409 });

  await prisma.user.update({
    where: { id: userId },
    data: { isSuspended: false, suspendedAt: null, suspendedReason: null },
  });

  await logAdminAction({
    adminId: session.user.id,
    adminEmail: session.user.email ?? "",
    adminRole: session.user.role,
    action: "USER_REACTIVATE",
    targetType: "USER",
    targetId: userId,
    details: { targetEmail: user.email },
  });

  return NextResponse.json({ success: true });
}
