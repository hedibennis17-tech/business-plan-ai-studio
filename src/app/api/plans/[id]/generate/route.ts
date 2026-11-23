/**
 * Phase 4 — API Génération du business plan
 * POST /api/plans/[id]/generate
 *
 * Sécurité :
 * - Vérification ownership avant génération
 * - Idempotence : refuse si déjà GENERATING
 * - Limite : max 5 générations par plan
 * - ANTHROPIC_API_KEY uniquement côté serveur
 * - Les données utilisateur ne sont jamais exécutées comme instructions
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/ratelimit";
import { generateBusinessPlan } from "@/lib/generationEngine";
import type { PlanData } from "@/lib/generationEngine";

type Params = { params: Promise<{ id: string }> };

const MAX_GENERATIONS_PER_PLAN = 5;

export async function POST(req: NextRequest, { params }: Params) {
  // Rate limiting
  const rl = await checkRateLimit(req, "api");
  if (rl) return rl;

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;

  // Vérification ownership + données
  const plan = await prisma.businessPlan.findFirst({
    where: { id, user: { email: session.user.email } },
    select: {
      id: true,
      title: true,
      status: true,
      generationStatus: true,
      generationCount: true,
      completedSteps: true,
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
    },
  });

  if (!plan) {
    return NextResponse.json({ error: "Plan introuvable" }, { status: 404 });
  }

  // Idempotence : refuser si déjà en cours
  if (plan.generationStatus === "GENERATING") {
    return NextResponse.json(
      { error: "Génération déjà en cours pour ce plan." },
      { status: 409 }
    );
  }

  // Contrôle des coûts : max 5 générations
  if ((plan.generationCount ?? 0) >= MAX_GENERATIONS_PER_PLAN) {
    return NextResponse.json(
      { error: `Limite de ${MAX_GENERATIONS_PER_PLAN} générations atteinte pour ce plan.` },
      { status: 429 }
    );
  }

  // Vérification : au moins les étapes 1-9 doivent être renseignées
  const minStepsCompleted = [1, 2, 3, 8, 9].every(
    (s) => plan.completedSteps?.includes(s)
  );
  if (!minStepsCompleted) {
    return NextResponse.json(
      {
        error: "Le questionnaire est incomplet. Les étapes 1, 2, 3, 8 et 9 sont requises.",
        completedSteps: plan.completedSteps,
      },
      { status: 422 }
    );
  }

  // Marquer comme GENERATING
  await prisma.businessPlan.update({
    where: { id },
    data: {
      generationStatus: "GENERATING",
      generationStarted: new Date(),
      generationError: null,
      status: "GENERATING" as never, // étendu côté enum
    },
  });

  try {
    const planData: PlanData = {
      id: plan.id,
      title: plan.title,
      step1Data: (plan.step1Data as object) ?? {},
      step2Data: (plan.step2Data as object) ?? {},
      step3Data: (plan.step3Data as object) ?? {},
      step4Data: (plan.step4Data as object) ?? {},
      step5Data: (plan.step5Data as object) ?? {},
      step6Data: (plan.step6Data as object) ?? {},
      step7Data: (plan.step7Data as object) ?? {},
      step8Data: (plan.step8Data as object) ?? {},
      step9Data: (plan.step9Data as object) ?? {},
      step10Data: (plan.step10Data as object) ?? {},
    };

    const { sections, financials } = await generateBusinessPlan(planData);

    // Sauvegarder le résultat
    await prisma.businessPlan.update({
      where: { id },
      data: {
        generationStatus: "GENERATED",
        generationFinished: new Date(),
        generationVersion: process.env.ANTHROPIC_MODEL ?? "claude-opus-4-5",
        generationCount: { increment: 1 },
        generatedSections: sections as never,
        financialAssumptions: financials as never,
        status: "GENERATED" as never,
      },
    });

    return NextResponse.json({
      success: true,
      sections,
      financials,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";

    // Marquer comme GENERATION_FAILED
    await prisma.businessPlan.update({
      where: { id },
      data: {
        generationStatus: "GENERATION_FAILED",
        generationError: errorMessage,
        status: "GENERATION_FAILED" as never,
      },
    });

    console.error("[generate] Erreur génération:", errorMessage);

    return NextResponse.json(
      { error: "Échec de la génération. Réessayez.", detail: errorMessage },
      { status: 500 }
    );
  }
}

/** GET — retourne le résultat de la génération existante */
export async function GET(req: NextRequest, { params }: Params) {
  const rl = await checkRateLimit(req, "api");
  if (rl) return rl;

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;

  const plan = await prisma.businessPlan.findFirst({
    where: { id, user: { email: session.user.email } },
    select: {
      id: true,
      generationStatus: true,
      generationStarted: true,
      generationFinished: true,
      generationError: true,
      generationVersion: true,
      generationCount: true,
      generatedSections: true,
      financialAssumptions: true,
    },
  });

  if (!plan) {
    return NextResponse.json({ error: "Plan introuvable" }, { status: 404 });
  }

  return NextResponse.json({ plan });
}
