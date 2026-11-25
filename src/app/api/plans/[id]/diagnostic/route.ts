/**
 * GET /api/plans/[id]/diagnostic
 * Endpoint de diagnostic complet — 10 étapes du questionnaire
 * Vérifie l'état de sauvegarde, la validation Zod, les champs manquants
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  stepSchemas,
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  step6Schema,
  step7Schema,
  step8Schema,
  step9Schema,
  step10Schema,
} from "@/lib/schemas";
import { z } from "zod";

const STEP_LABELS: Record<number, string> = {
  1: "Profil de l'entreprise",
  2: "Présentation du projet",
  3: "Analyse du marché",
  4: "Clientèle cible",
  5: "Analyse de la concurrence",
  6: "Stratégie marketing",
  7: "Opérations",
  8: "Financement",
  9: "Prévisions financières",
  10: "Validation finale",
};

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

const ALL_STEP_SCHEMAS: Record<number, z.ZodSchema> = {
  1: step1Schema,
  2: step2Schema,
  3: step3Schema,
  4: step4Schema,
  5: step5Schema,
  6: step6Schema,
  7: step7Schema,
  8: step8Schema,
  9: step9Schema,
  10: step10Schema,
};

function extractZodErrors(error: z.ZodError): {
  field: string;
  message: string;
}[] {
  return error.issues.map((issue) => ({
    field: issue.path.join(".") || "root",
    message: issue.message,
  }));
}

function getRequiredFields(schema: z.ZodSchema): string[] {
  if (!(schema instanceof z.ZodObject)) return [];
  const shape = schema.shape as Record<string, z.ZodTypeAny>;
  return Object.entries(shape)
    .filter(([, fieldSchema]) => {
      // Champ requis = pas optional, pas union avec literal("")
      const isOptional = fieldSchema instanceof z.ZodOptional;
      const isUnionWithLiteral =
        fieldSchema instanceof z.ZodUnion ||
        (fieldSchema instanceof z.ZodOptional &&
          fieldSchema._def.innerType instanceof z.ZodUnion);
      return !isOptional && !isUnionWithLiteral;
    })
    .map(([key]) => key);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Auth
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié", code: "UNAUTHENTICATED" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "ID de plan invalide", code: "INVALID_ID" },
        { status: 400 }
      );
    }

    // Récupérer le plan complet
    const plan = await prisma.businessPlan.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        status: true,
        generationStatus: true,
        isPaid: true,
        currentStep: true,
        completedSteps: true,
        createdAt: true,
        updatedAt: true,
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
      return NextResponse.json(
        { error: "Plan non trouvé ou accès refusé", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    // Analyser chaque étape
    let totalFieldsFilled = 0;
    let totalFieldsRequired = 0;
    let stepsComplete = 0;
    let stepsWithData = 0;
    const issuesSummary: string[] = [];

    interface StepDiagnostic {
      step: number;
      label: string;
      dbField: string;
      hasData: boolean;
      fieldCount: number;
      nonEmptyFields: string[];
      validationStatus: "valid" | "invalid" | "empty";
      isInCompletedSteps: boolean;
      requiredFields: string[];
      filledRequiredCount: number;
      totalRequiredCount: number;
      requiredCompletion: number;
      zodErrors: { field: string; message: string }[];
      missingRequired: string[];
      rawDataPreview: Record<string, unknown> | null;
    }

    const stepDiagnostics: StepDiagnostic[] = [];

    for (let step = 1; step <= 10; step++) {
      const fieldKey = STEP_FIELD_MAP[step];
      const rawData = plan[fieldKey as keyof typeof plan];
      const schema = ALL_STEP_SCHEMAS[step];
      const label = STEP_LABELS[step];

      // Données brutes
      const data = rawData as Record<string, unknown> | null;
      const hasData = data !== null && Object.keys(data || {}).length > 0;
      const fieldCount = hasData ? Object.keys(data!).length : 0;
      const isInCompletedSteps = (plan.completedSteps as number[]).includes(step);

      // Validation Zod
      let validationStatus: "valid" | "invalid" | "empty" = "empty";
      let zodErrors: { field: string; message: string }[] = [];
      let missingRequired: string[] = [];

      if (hasData) {
        stepsWithData++;
        const result = schema.safeParse(data);
        if (result.success) {
          validationStatus = "valid";
          stepsComplete++;
        } else {
          validationStatus = "invalid";
          zodErrors = extractZodErrors(result.error);
          missingRequired = zodErrors
            .filter((e) =>
              e.message.includes("requis") ||
              e.message.includes("required") ||
              e.message.includes("min")
            )
            .map((e) => e.field);

          issuesSummary.push(
            `Étape ${step} (${label}): ${zodErrors.length} erreur(s) — ${zodErrors.map((e) => `${e.field}: ${e.message}`).join(", ")}`
          );
        }
      } else {
        issuesSummary.push(`Étape ${step} (${label}): Aucune donnée sauvegardée`);
      }

      // Champs requis
      const requiredFields = getRequiredFields(schema);
      const filledRequired = hasData
        ? requiredFields.filter((f) => {
            const val = data![f];
            return val !== undefined && val !== null && val !== "";
          }).length
        : 0;

      totalFieldsFilled += filledRequired;
      totalFieldsRequired += requiredFields.length;

      // Données non-nulles dans le JSON
      const nonEmptyFields = hasData
        ? Object.entries(data!).filter(([, v]) => {
            if (v === null || v === undefined || v === "") return false;
            if (Array.isArray(v) && v.length === 0) return false;
            return true;
          }).map(([k]) => k)
        : [];

      stepDiagnostics.push({
        step,
        label,
        dbField: fieldKey,
        hasData,
        fieldCount,
        nonEmptyFields,
        validationStatus,
        isInCompletedSteps,
        requiredFields,
        filledRequiredCount: filledRequired,
        totalRequiredCount: requiredFields.length,
        requiredCompletion:
          requiredFields.length > 0
            ? Math.round((filledRequired / requiredFields.length) * 100)
            : 100,
        zodErrors,
        missingRequired,
        rawDataPreview: hasData
          ? Object.fromEntries(
              Object.entries(data!).map(([k, v]) => [
                k,
                typeof v === "string" && v.length > 80
                  ? v.substring(0, 80) + "…"
                  : v,
              ])
            )
          : null,
      });
    }

    // Diagnostic du workflow
    const workflowDiagnostic = {
      currentStep: plan.currentStep,
      completedSteps: plan.completedSteps,
      completedStepsCount: (plan.completedSteps as number[]).length,
      stepsWithData,
      stepsValidAndComplete: stepsComplete,
      mismatch: {
        stepsWithDataButNotCompleted: stepDiagnostics
          .filter((s) => s.hasData && !s.isInCompletedSteps)
          .map((s) => s.step),
        stepsCompletedButNoData: (plan.completedSteps as number[]).filter(
          (s) => !stepDiagnostics.find((d) => d.step === s && d.hasData)
        ),
      },
    };

    // Problèmes détectés
    const problems: string[] = [];

    if (workflowDiagnostic.mismatch.stepsWithDataButNotCompleted.length > 0) {
      problems.push(
        `⚠️ Étapes avec données mais PAS dans completedSteps: ${workflowDiagnostic.mismatch.stepsWithDataButNotCompleted.join(", ")} — l'autosauvegarde ne marque PAS les étapes comme complètes (normal), mais vérifier si flushSave() est appelé avant navigation`
      );
    }

    if (stepsWithData === 0) {
      problems.push(
        "🚨 AUCUNE étape ne contient de données — le PATCH /api/plans/[id]/step ne sauvegarde pas du tout"
      );
    }

    if (plan.currentStep === 1 && stepsWithData > 1) {
      problems.push(
        `⚠️ currentStep est 1 mais ${stepsWithData} étapes ont des données — currentStep n'avance pas (vérifier autosave: false lors de la navigation)`
      );
    }

    const stepsMissingFromDB = stepDiagnostics.filter(
      (s) => !s.hasData
    ).map((s) => s.step);

    // Résumé santé global
    const overallHealth = stepsWithData === 0
      ? "CRITICAL"
      : stepsComplete >= 8
      ? "GOOD"
      : stepsComplete >= 5
      ? "PARTIAL"
      : "POOR";

    return NextResponse.json(
      {
        _meta: {
          endpoint: "diagnostic",
          version: "1.0",
          generatedAt: new Date().toISOString(),
          planId: id,
          userId: session.user.id,
        },

        // Plan de base
        plan: {
          id: plan.id,
          title: plan.title,
          status: plan.status,
          generationStatus: plan.generationStatus,
          isPaid: plan.isPaid,
          createdAt: plan.createdAt,
          updatedAt: plan.updatedAt,
        },

        // Santé globale
        health: {
          overall: overallHealth,
          stepsWithData,
          stepsComplete,
          stepsTotal: 10,
          completionPercent: Math.round((stepsComplete / 10) * 100),
          requiredFieldsFilledPercent:
            totalFieldsRequired > 0
              ? Math.round((totalFieldsFilled / totalFieldsRequired) * 100)
              : 0,
          problems,
        },

        // Workflow
        workflow: workflowDiagnostic,

        // Détail par étape
        steps: stepDiagnostics,

        // Résumé des problèmes
        issuesSummary,

        // Instructions de test
        _testInstructions: {
          testAutoSave: `curl -X PATCH https://[votre-domaine]/api/plans/${id}/step -H "Content-Type: application/json" -d '{"step":1,"data":{"companyName":"Test","sector":"Tech","legalForm":"SARL","province":"QC","city":"Montréal","isExisting":false},"autosave":true}' --cookie "next-auth.session-token=..."`,
          testFinalSave: `curl -X PATCH https://[votre-domaine]/api/plans/${id}/step -H "Content-Type: application/json" -d '{"step":1,"data":{"companyName":"Test","sector":"Tech","legalForm":"SARL","province":"QC","city":"Montréal","isExisting":false},"autosave":false}' --cookie "next-auth.session-token=..."`,
          reRunDiagnostic: `GET /api/plans/${id}/diagnostic`,
          note: "autosave:true = soft save (ne marque pas l'étape complète). autosave:false = save final (marque complète + avance currentStep)",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[diagnostic] Error:", error);
    return NextResponse.json(
      {
        error: "Erreur interne du serveur",
        code: "INTERNAL_ERROR",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
