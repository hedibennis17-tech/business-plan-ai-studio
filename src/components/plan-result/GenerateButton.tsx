"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  planId: string;
  generationStatus: string | null;
  generationCount: number;
  completedSteps: number[];
}

const MAX_GENERATIONS = 5;

const REQUIRED_STEPS = [1, 2, 3, 8, 9];

export default function GenerateButton({
  planId,
  generationStatus,
  generationCount,
  completedSteps,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const missingSteps = REQUIRED_STEPS.filter((s) => !completedSteps.includes(s));
  const canGenerate =
    missingSteps.length === 0 &&
    generationStatus !== "GENERATING" &&
    generationCount < MAX_GENERATIONS;

  const isGenerating = generationStatus === "GENERATING" || loading;
  const hasGenerated = generationStatus === "GENERATED";
  const hasFailed = generationStatus === "GENERATION_FAILED";

  async function handleGenerate() {
    setShowConfirm(false);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/plans/${planId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erreur lors de la génération");
        setLoading(false);
        return;
      }

      // Succès — recharger la page pour afficher le résultat
      router.refresh();
    } catch {
      setError("Erreur réseau. Vérifiez votre connexion et réessayez.");
      setLoading(false);
    }
  }

  if (missingSteps.length > 0) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-medium text-amber-800">
          Questionnaire incomplet
        </p>
        <p className="mt-1 text-sm text-amber-700">
          Complétez les étapes suivantes avant de générer :{" "}
          {missingSteps.map((s) => `Étape ${s}`).join(", ")}
        </p>
        <a
          href={`/questionnaire/${planId}`}
          className="mt-3 inline-block rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          Compléter le questionnaire →
        </a>
      </div>
    );
  }

  if (generationCount >= MAX_GENERATIONS) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-700">
          Limite de {MAX_GENERATIONS} générations atteinte pour ce plan.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {hasFailed && !error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">
            La dernière génération a échoué. Réessayez.
          </p>
        </div>
      )}

      {isGenerating && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <div>
              <p className="text-sm font-medium text-blue-800">
                Génération en cours…
              </p>
              <p className="text-xs text-blue-600 mt-0.5">
                L&apos;IA rédige votre plan d&apos;affaires. Cela peut prendre 1-2 minutes.
              </p>
            </div>
          </div>
        </div>
      )}

      {showConfirm && !isGenerating && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-800 mb-2">
            Confirmer la génération ?
          </p>
          <p className="text-xs text-gray-600 mb-3">
            {hasGenerated
              ? `Cette action remplacera le plan existant. Il vous reste ${MAX_GENERATIONS - generationCount} génération(s).`
              : `L'IA va analyser vos réponses et générer un business plan complet. Cette opération utilise votre quota (${generationCount + 1}/${MAX_GENERATIONS}).`}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleGenerate}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Confirmer
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {!showConfirm && !isGenerating && (
        <button
          onClick={() => setShowConfirm(true)}
          disabled={!canGenerate}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
        >
          <span>✨</span>
          {hasGenerated ? "Régénérer le plan" : "Générer mon business plan"}
        </button>
      )}

      {generationCount > 0 && (
        <p className="text-xs text-gray-500">
          {generationCount}/{MAX_GENERATIONS} génération(s) utilisée(s)
        </p>
      )}
    </div>
  );
}
