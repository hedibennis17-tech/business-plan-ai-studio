/**
 * Phase 4 — Page résultat du business plan
 * /plan/[id] — Server Component avec vérification ownership
 */

import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import GenerateButton from "@/components/plan-result/GenerateButton";
import SectionViewer from "@/components/plan-result/SectionViewer";
import type { GeneratedSections } from "@/lib/generationEngine";

export const instant = false;

type Props = { params: Promise<{ id: string }> };

export default async function PlanResultPage({ params }: Props) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const plan = await prisma.businessPlan.findFirst({
    where: { id, user: { email: session.user.email } },
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
    },
  });

  if (!plan) notFound();

  const hasGenerated = plan.generationStatus === "GENERATED" && plan.generatedSections;
  const isGenerating = plan.generationStatus === "GENERATING";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a
                href="/dashboard"
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                ← Dashboard
              </a>
              <div className="h-5 w-px bg-gray-300" />
              <h1 className="text-xl font-bold text-gray-900 truncate max-w-sm">
                {plan.title}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={`/questionnaire/${plan.id}`}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                ✏️ Modifier le questionnaire
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Statut génération */}
        <div className="mb-8">
          {isGenerating && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              <h2 className="text-lg font-semibold text-blue-800">
                Génération en cours…
              </h2>
              <p className="mt-2 text-sm text-blue-600">
                L&apos;IA analyse vos réponses et rédige votre business plan. Cela prend généralement 1-2 minutes.
              </p>
              <p className="mt-1 text-xs text-blue-500">
                Rafraîchissez la page dans quelques instants.
              </p>
            </div>
          )}

          {!hasGenerated && !isGenerating && (
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="max-w-2xl">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl shrink-0">
                    🚀
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Générer votre business plan
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                      L&apos;IA va analyser toutes vos réponses et créer un plan d&apos;affaires professionnel,
                      structuré et personnalisé en 17 sections. Les prévisions financières
                      sont calculées par un moteur déterministe indépendant de l&apos;IA.
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <span className="text-green-500">✓</span>
                        17 sections professionnelles
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-green-500">✓</span>
                        Calculs financiers vérifiables
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-green-500">✓</span>
                        Adapté à votre projet
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-green-500">✓</span>
                        Sections régénérables
                      </div>
                    </div>

                    <div className="mt-6">
                      <GenerateButton
                        planId={plan.id}
                        generationStatus={plan.generationStatus}
                        generationCount={plan.generationCount ?? 0}
                        completedSteps={plan.completedSteps ?? []}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Résultat */}
        {hasGenerated && (
          <>
            {/* Bannière succès + régénérer */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-green-200 bg-green-50 p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-semibold text-green-800">Business plan généré</p>
                  <p className="text-xs text-green-600">
                    {plan.generationFinished
                      ? `Généré le ${new Date(plan.generationFinished).toLocaleDateString("fr-CA")} à ${new Date(plan.generationFinished).toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" })}`
                      : "Génération terminée"}
                    {" · "}Modèle : {plan.generationVersion ?? "Claude"}
                  </p>
                </div>
              </div>
              <GenerateButton
                planId={plan.id}
                generationStatus={plan.generationStatus}
                generationCount={plan.generationCount ?? 0}
                completedSteps={plan.completedSteps ?? []}
              />
            </div>

            {/* Visionneuse par sections */}
            <SectionViewer
              planId={plan.id}
              sections={plan.generatedSections as unknown as GeneratedSections}
              financials={plan.financialAssumptions}
              generationVersion={plan.generationVersion}
              generationFinished={plan.generationFinished}
            />
          </>
        )}
      </div>
    </div>
  );
}
