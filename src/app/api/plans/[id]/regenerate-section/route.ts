/**
 * Phase 4 — API Régénération d'une section
 * POST /api/plans/[id]/regenerate-section
 * Body: { sectionKey: keyof GeneratedSections }
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/ratelimit";
import { regenerateSection } from "@/lib/generationEngine";
import type { GeneratedSections, PlanData } from "@/lib/generationEngine";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

const VALID_SECTIONS: (keyof GeneratedSections)[] = [
  "coverPage", "executiveSummary", "companyPresentation", "projectDescription",
  "marketAnalysis", "targetCustomers", "competitionAnalysis", "valueProposition",
  "marketingStrategy", "operationalPlan", "humanResources", "investmentsFinancing",
  "financialProjections", "profitabilityAnalysis", "riskAnalysis", "actionPlan", "conclusion",
];

const bodySchema = z.object({
  sectionKey: z.enum(VALID_SECTIONS as [string, ...string[]]),
});

export async function POST(req: NextRequest, { params }: Params) {
  const rl = await checkRateLimit(req, "api");
  if (rl) return rl;

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;

  const body = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Section invalide" }, { status: 400 });
  }
  const { sectionKey } = parsed.data;

  const plan = await prisma.businessPlan.findFirst({
    where: { id, user: { email: session.user.email } },
    select: {
      id: true, title: true, generationStatus: true, generationCount: true,
      generatedSections: true, financialAssumptions: true,
      step1Data: true, step2Data: true, step3Data: true, step4Data: true,
      step5Data: true, step6Data: true, step7Data: true, step8Data: true,
      step9Data: true, step10Data: true,
    },
  });

  if (!plan) return NextResponse.json({ error: "Plan introuvable" }, { status: 404 });
  if (plan.generationStatus !== "GENERATED") {
    return NextResponse.json({ error: "Le plan n'a pas encore été généré." }, { status: 409 });
  }
  if ((plan.generationCount ?? 0) >= 10) {
    return NextResponse.json({ error: "Limite de régénérations atteinte." }, { status: 429 });
  }

  const planData: PlanData = {
    id: plan.id, title: plan.title,
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

  try {
    const newContent = await regenerateSection(
      planData,
      sectionKey as keyof GeneratedSections,
      (plan.financialAssumptions as object) as never
    );

    const existingSections = (plan.generatedSections as Record<string, string>) ?? {};
    const updatedSections = { ...existingSections, [sectionKey]: newContent };

    await prisma.businessPlan.update({
      where: { id },
      data: {
        generatedSections: updatedSections as never,
        generationCount: { increment: 1 },
        generationFinished: new Date(),
      },
    });

    return NextResponse.json({ success: true, sectionKey, content: newContent });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: "Échec de la régénération.", detail: errorMessage }, { status: 500 });
  }
}
