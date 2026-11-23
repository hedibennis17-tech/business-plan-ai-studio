/**
 * Phase 3 — API Sauvegarde d'une étape
 * PATCH /api/plans/[id]/step
 * Body: { step: 1-10, data: {...} }
 *
 * Sauvegarde les données de l'étape, met à jour currentStep et completedSteps.
 * Protégée : seul le propriétaire peut modifier son plan.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/ratelimit";
import { stepSchemas, formatZodError } from "@/lib/schemas";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

const patchBodySchema = z.object({
  step: z.number().int().min(1).max(10),
  data: z.record(z.string(), z.unknown()),
  title: z.string().trim().max(200).optional(),
  autosave: z.boolean().optional(), // Si true, validation souple (données partielles OK)
});

const STEP_FIELD_MAP: Record<number, string> = {
  1: "step1Data",
  2: "step2Data",
  3: "step3Data",
  4: "step4Data",
  5: "step5Data",
  6: "step6Data",
  7: "step7Data",
  8: "step8Data",
  9: "step9Data",
  10: "step10Data",
};

export async function PATCH(req: NextRequest, { params }: Params) {
  // Rate limiting
  const rl = await checkRateLimit(req, "api");
  if (rl) return rl;

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

  // Parse body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  // Valider la structure de la requête
  const patchParsed = patchBodySchema.safeParse(body);
  if (!patchParsed.success) {
    return NextResponse.json({ error: formatZodError(patchParsed.error) }, { status: 400 });
  }

  const { step, data, title, autosave } = patchParsed.data;

  // Valider les données de l'étape avec le schéma correspondant
  // En mode autosave, on accepte les données partielles (pas de validation stricte)
  const stepSchema = stepSchemas[step as keyof typeof stepSchemas];
  let validatedData: Record<string, unknown> = data;

  if (!autosave) {
    // Validation stricte uniquement quand l'utilisateur clique "Suivant"
    const stepParsed = stepSchema.safeParse(data);
    if (!stepParsed.success) {
      return NextResponse.json(
        { error: formatZodError(stepParsed.error), field: stepParsed.error.issues[0]?.path[0] },
        { status: 400 }
      );
    }
    validatedData = stepParsed.data as Record<string, unknown>;
  }
  // En mode autosave : on sauvegarde les données telles quelles sans validation

  try {
    // Vérifier que le plan appartient à l'utilisateur
    const existing = await prisma.businessPlan.findFirst({
      where: { id, user: { email: session.user.email } },
      select: { id: true, currentStep: true, completedSteps: true, status: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Plan introuvable" }, { status: 404 });
    }

    const fieldName = STEP_FIELD_MAP[step];

    // En mode autosave, ne pas marquer l'étape comme complétée
    const completedSteps = autosave
      ? existing.completedSteps
      : Array.from(new Set([...existing.completedSteps, step]));

    // En mode autosave, garder currentStep inchangé
    const nextStep = autosave ? existing.currentStep : Math.min(step + 1, 10);
    const isComplete = completedSteps.length === 10;

    // Déterminer le nouveau statut
    let newStatus = existing.status;
    if (!autosave) {
      if (step === 10 && (data as { confirmed?: boolean }).confirmed) {
        newStatus = "READY_FOR_GENERATION";
      } else if (existing.status === "DRAFT" && completedSteps.length > 0) {
        newStatus = "IN_PROGRESS";
      }
    }

    const updateData: Record<string, unknown> = {
      [fieldName]: validatedData,
      currentStep: nextStep,
      completedSteps,
      status: newStatus,
      updatedAt: new Date(),
    };

    if (title) updateData.title = title;
    if (!autosave && isComplete && !title) updateData.status = "COMPLETE";

    const updated = await prisma.businessPlan.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        title: true,
        status: true,
        currentStep: true,
        completedSteps: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ plan: updated, savedStep: step });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error("[PATCH /api/plans/id/step]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
