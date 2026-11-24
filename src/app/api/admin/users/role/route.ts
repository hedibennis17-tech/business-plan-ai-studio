import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { hasPermission, ADMIN_ROLES } from "@/lib/admin/rbac";
import { logAdminAction, AUDIT_ACTIONS } from "@/lib/admin/audit";

const schema = z.object({
  userId: z.string().min(1),
  role: z.enum(["USER", "ADMIN", "SUPER_ADMIN", "SUPPORT", "FINANCE"]),
});

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const adminRole = (session.user as { role?: string }).role ?? "";
  if (!hasPermission(adminRole, "admin.users.role_change")) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { userId, role } = parsed.data;

  // Empêcher de modifier son propre rôle
  const adminUser = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true },
  });
  if (adminUser?.id === userId) {
    return NextResponse.json({ error: "Impossible de modifier votre propre rôle" }, { status: 400 });
  }

  // Seul SUPER_ADMIN peut attribuer SUPER_ADMIN
  if (role === "SUPER_ADMIN" && adminRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Seul un Super Admin peut attribuer ce rôle" }, { status: 403 });
  }

  const targetUser = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, role: true } });
  if (!targetUser) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  await prisma.user.update({
    where: { id: userId },
    data: { role: role as "USER" | "ADMIN" | "SUPER_ADMIN" | "SUPPORT" | "FINANCE" },
  });

  await logAdminAction({
    adminId: adminUser?.id ?? "",
    adminEmail: session.user.email!,
    adminRole,
    action: AUDIT_ACTIONS.USER_ROLE_CHANGE,
    targetType: "USER",
    targetId: userId,
    details: { previousRole: targetUser.role, newRole: role, targetEmail: targetUser.email },
    ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json({ success: true });
}
