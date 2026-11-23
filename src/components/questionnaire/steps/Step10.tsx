"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Step10Data } from "@/lib/schemas";

type PlanData = {
  step1Data?: Record<string, unknown> | null;
  step2Data?: Record<string, unknown> | null;
  step3Data?: Record<string, unknown> | null;
  step4Data?: Record<string, unknown> | null;
  step5Data?: Record<string, unknown> | null;
  step6Data?: Record<string, unknown> | null;
  step7Data?: Record<string, unknown> | null;
  step8Data?: Record<string, unknown> | null;
  step9Data?: Record<string, unknown> | null;
  completedSteps: number[];
};

type Props = {
  defaultValues?: Partial<Step10Data>;
  planData: PlanData;
  onChange: (data: Step10Data) => void;
  onValidChange?: (valid: boolean) => void;
  onNavigateToStep?: (step: number) => void;
};

const STEP_SUMMARIES = [
  { step: 1, label: "Profil de l'entreprise", key: "step1Data", fields: ["companyName", "sector", "legalForm", "province", "city"] },
  { step: 2, label: "Présentation du projet", key: "step2Data", fields: ["description", "problem", "solution", "valueProposition"] },
  { step: 3, label: "Analyse du marché", key: "step3Data", fields: ["industry", "marketSize", "opportunities"] },
  { step: 4, label: "Clientèle cible", key: "step4Data", fields: ["clientType", "clientProfile", "geographicZone"] },
  { step: 5, label: "Concurrence", key: "step5Data", fields: ["differentiation", "directCompetitors"] },
  { step: 6, label: "Marketing et ventes", key: "step6Data", fields: ["commercializationStrategy", "salesChannels"] },
  { step: 7, label: "Opérations et RH", key: "step7Data", fields: ["dailyOperations", "employeeCount"] },
  { step: 8, label: "Financement", key: "step8Data", fields: ["initialInvestment", "personalFunding", "amountSought"] },
  { step: 9, label: "Prévisions financières", key: "step9Data", fields: ["revenueYear1", "revenueYear2", "revenueYear3"] },
];

function getFirstValue(obj: Record<string, unknown> | null | undefined, keys: string[]): string {
  if (!obj) return "";
  for (const k of keys) {
    const v = obj[k];
    if (v !== undefined && v !== null && v !== "") {
      if (typeof v === "boolean") return v ? "Oui" : "Non";
      if (typeof v === "number") return `${v.toLocaleString("fr-CA")} $`;
      return String(v).substring(0, 80) + (String(v).length > 80 ? "..." : "");
    }
  }
  return "Non renseigné";
}

export default function Step10({ defaultValues, planData, onChange, onValidChange, onNavigateToStep }: Props) {
  const { register, watch, formState: { isValid } } = useForm<Step10Data>({
    defaultValues: { confirmed: false, ...defaultValues },
    mode: "onChange",
  });

  const values = watch();
  useEffect(() => { onChange(values as Step10Data); }, [JSON.stringify(values)]);
  useEffect(() => { onValidChange?.(isValid); }, [isValid]);

  const missingSteps = Array.from({ length: 9 }, (_, i) => i + 1)
    .filter((s) => !planData.completedSteps.includes(s));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Validation et finalisation</h2>
        <p className="text-sm text-gray-500">Vérifiez toutes vos réponses avant de finaliser votre questionnaire.</p>
      </div>

      {/* Alerte étapes manquantes */}
      {missingSteps.length > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/40 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-orange-400 text-lg">⚠</span>
            <span className="text-sm font-semibold text-orange-400">Étapes incomplètes</span>
          </div>
          <p className="text-xs text-gray-500 mb-3">Ces étapes n'ont pas encore été complétées. Votre plan sera moins complet sans elles.</p>
          <div className="flex flex-wrap gap-2">
            {missingSteps.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onNavigateToStep?.(s)}
                className="text-xs bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 rounded-lg px-3 py-1.5 transition"
              >
                Étape {s} →
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Résumé de toutes les étapes */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wide">📋 Résumé de votre questionnaire</h3>
        {STEP_SUMMARIES.map(({ step, label, key, fields }) => {
          const data = planData[key as keyof PlanData] as Record<string, unknown> | null | undefined;
          const isCompleted = planData.completedSteps.includes(step);
          const preview = getFirstValue(data, fields);

          return (
            <div
              key={step}
              className={`border rounded-xl p-4 transition ${isCompleted ? "border-gray-200 bg-gray-50" : "border-gray-200/50 bg-gray-50/20 opacity-60"}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className={`text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
                    ${isCompleted ? "bg-amber-500 text-slate-900" : "bg-gray-100 text-gray-500"}`}>
                    {isCompleted ? "✓" : step}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-800">{label}</div>
                    {isCompleted && (
                      <div className="text-xs text-gray-400 mt-0.5 truncate">{preview}</div>
                    )}
                    {!isCompleted && (
                      <div className="text-xs text-gray-400 mt-0.5">Non complété</div>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateToStep?.(step)}
                  className="text-xs text-amber-400/70 hover:text-amber-400 transition flex-shrink-0"
                >
                  {isCompleted ? "Modifier" : "Compléter →"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Notes finales */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes additionnelles <span className="text-gray-400 font-normal">(optionnel)</span>
        </label>
        <textarea
          {...register("notes")}
          rows={3}
          placeholder="Informations supplémentaires importantes pour votre plan d'affaires, contexte particulier, contraintes spécifiques..."
          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700/30 transition resize-none"
        />
      </div>

      {/* Validation finale */}
      <div className={`border-2 rounded-xl p-5 transition ${values.confirmed ? "border-emerald-500/50 bg-emerald-500/10" : "border-gray-300 bg-gray-50"}`}>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register("confirmed")}
            className="mt-0.5 w-5 h-5 rounded accent-emerald-500 flex-shrink-0"
          />
          <div>
            <div className="text-sm font-semibold text-gray-900">Je confirme que les informations fournies sont exactes et complètes</div>
            <div className="text-xs text-gray-500 mt-1">
              En cochant cette case, vous indiquez que votre questionnaire est prêt pour la génération du plan d'affaires professionnel.
              La génération IA sera disponible à l'étape suivante (Phase 4).
            </div>
          </div>
        </label>

        {values.confirmed && (
          <div className="mt-4 bg-emerald-500/20 rounded-lg p-3 text-center">
            <div className="text-emerald-400 font-semibold text-sm">✓ Questionnaire prêt pour génération</div>
            <div className="text-xs text-gray-500 mt-1">
              Le statut de votre plan passera à « Prêt pour génération ». La génération IA (Phase 4) sera disponible prochainement.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
