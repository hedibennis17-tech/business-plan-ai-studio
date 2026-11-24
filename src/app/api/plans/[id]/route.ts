/**
 * API Plan individuel — avec protection contenu premium
 * GET    /api/plans/[id]  → retourne plan (sections masquées si non payé)
 * DELETE /api/plans/[id]  → supprime le plan (si propriétaire)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// Sections autorisées en aperçu pour les non-payants (max 2)
const PREVIEW_SECTIONS = ["executiveSummary", "company"];

async function getPlanForUser(planId: string, userEmail: string) {
  return prisma.businessPlan.findFirst({
    where: { id: planId, user: { email: userEmail } },
    select: {
      id: true,
      title: true,
      status: true,
      currentStep: true,
      completedSteps: true,
      generationStatus: true,
      generationStarted: true,
      generationFinished: true,
      generationError: true,
      generationVersion: true,
      generationCount: true,
      generatedSections: true,
      financialAssumptions: true,
      isPaid: true,
      paidAt: true,
      step1Data: true,
      step2Data: true,
      step3Data: true,
      step4Data: true,
      step5Data: true,
      step6Data: true,
      step7Data: true,
      step8Data: true,
      step9Data: true,
      step10Data: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

  try {
    const plan = await getPlanForUser(id, session.user.email);
    if (!plan) return NextResponse.json({ error: "Plan introuvable" }, { status: 404 });

    // Protection contenu — masquer les sections générées si non payé
    if (!plan.isPaid && plan.generatedSections) {
      const sections = plan.generatedSections as Record<string, unknown>;
      const previewOnly: Record<string, unknown> = {};
      for (const key of PREVIEW_SECTIONS) {
        if (sections[key]) previewOnly[key] = sections[key];
      }
      return NextResponse.json({
        plan: {
          ...plan,
          generatedSections: previewOnly,
          _preview: true,
          _previewSections: PREVIEW_SECTIONS,
          _totalSections: Object.keys(sections).length,
        },
      });
    }

    return NextResponse.json({ plan });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error("[GET /api/plans/id]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

  try {
    const plan = await prisma.businessPlan.findFirst({
      where: { id, user: { email: session.user.email } },
      select: { id: true },
    });
    if (!plan) return NextResponse.json({ error: "Plan introuvable" }, { status: 404 });

    await prisma.businessPlan.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error("[DELETE /api/plans/id]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
