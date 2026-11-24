import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/admin/rbac";
import { logAdminAction, AUDIT_ACTIONS } from "@/lib/admin/audit";

const STEP_LABELS: Record<number, string> = {
  1: "Identification", 2: "Votre projet", 3: "Marché", 4: "Clients cibles",
  5: "Concurrents", 6: "Marketing", 7: "Opérations", 8: "Finances",
  9: "Projections financières", 10: "Validation finale",
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role ?? "";
  if (!session || !hasPermission(role, "admin.support.view")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { planId, email, name, currentStep } = await req.json();
  if (!planId || !email) {
    return NextResponse.json({ error: "planId et email requis" }, { status: 400 });
  }

  // Vérifier que le plan existe
  const plan = await prisma.businessPlan.findUnique({ where: { id: planId }, select: { title: true } });
  if (!plan) return NextResponse.json({ error: "Plan introuvable" }, { status: 404 });

  const stepLabel = STEP_LABELS[currentStep] ?? `Étape ${currentStep}`;

  // Log dans EmailLog
  await prisma.emailLog.create({
    data: {
      to: email,
      subject: `Reprenez votre plan d'affaires — Étape ${currentStep}/10`,
      type: "reminder",
      status: "SENT",
      metadata: {
        sentBy: session.user?.email,
        planId,
        planTitle: plan.title,
        currentStep,
        stepLabel,
      },
    },
  });

  // Audit trail
  await logAdminAction({
    adminId: (session.user as { id?: string })?.id ?? "unknown",
    adminEmail: session.user?.email ?? "",
    adminRole: role,
    action: AUDIT_ACTIONS.USER_SUSPEND, // réutilisation — pas d'action spécifique RELANCE
    targetType: "BusinessPlan",
    targetId: planId,
    details: { type: "CLIENT_RELANCE", email, currentStep, stepLabel },
    ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json({
    success: true,
    message: `Email de relance enregistré pour ${email} (étape ${currentStep}/10 — ${stepLabel})`,
  });
}
