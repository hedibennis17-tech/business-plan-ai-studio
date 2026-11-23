"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import StepProgress from "./StepProgress";
import SaveIndicator from "./SaveIndicator";
import Step1 from "./steps/Step1";
import Step2 from "./steps/Step2";
import Step3 from "./steps/Step3";
import Step4 from "./steps/Step4";
import Step5 from "./steps/Step5";
import Step6 from "./steps/Step6";
import Step7 from "./steps/Step7";
import Step8 from "./steps/Step8";
import Step9 from "./steps/Step9";
import Step10 from "./steps/Step10";
import { useAutoSave } from "@/hooks/useAutoSave";

type Plan = {
  id: string;
  title: string;
  status: string;
  currentStep: number;
  completedSteps: number[];
  step1Data?: Record<string, unknown> | null;
  step2Data?: Record<string, unknown> | null;
  step3Data?: Record<string, unknown> | null;
  step4Data?: Record<string, unknown> | null;
  step5Data?: Record<string, unknown> | null;
  step6Data?: Record<string, unknown> | null;
  step7Data?: Record<string, unknown> | null;
  step8Data?: Record<string, unknown> | null;
  step9Data?: Record<string, unknown> | null;
  step10Data?: Record<string, unknown> | null;
};

type Props = { initialPlan: Plan };

export default function QuestionnaireWizard({ initialPlan }: Props) {
  const router = useRouter();
  const [plan, setPlan] = useState<Plan>(initialPlan);
  const [currentStep, setCurrentStep] = useState(initialPlan.currentStep || 1);
  const [stepData, setStepData] = useState<Record<string, unknown>>({});
  const [isStepValid, setIsStepValid] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const stepDataRef = useRef<Record<string, unknown>>({});

  const { scheduleSave, flushSave, saveStatus } = useAutoSave(plan.id, currentStep);

  const handleDataChange = useCallback(
    (data: Record<string, unknown>) => {
      setStepData(data);
      stepDataRef.current = data;
      scheduleSave(data);
    },
    [scheduleSave]
  );

  const saveAndNavigate = useCallback(
    async (targetStep: number) => {
      setIsSaving(true);
      await flushSave();
      setIsSaving(false);

      // Recharger les données du plan depuis le serveur
      const res = await fetch(`/api/plans/${plan.id}`);
      if (res.ok) {
        const { plan: updated } = await res.json();
        setPlan(updated);
      }

      setCurrentStep(targetStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [flushSave, plan.id]
  );

  const handleNext = useCallback(async () => {
    if (currentStep < 10) {
      await saveAndNavigate(currentStep + 1);
    }
  }, [currentStep, saveAndNavigate]);

  const handlePrev = useCallback(async () => {
    if (currentStep > 1) {
      await saveAndNavigate(currentStep - 1);
    }
  }, [currentStep, saveAndNavigate]);

  const handleNavigate = useCallback(
    async (step: number) => {
      if (step === currentStep) return;
      await saveAndNavigate(step);
    },
    [currentStep, saveAndNavigate]
  );

  const handleFinalize = useCallback(async () => {
    setIsSaving(true);
    await flushSave();
    setIsSaving(false);
    router.push("/dashboard");
  }, [flushSave, router]);

  const stepProps = {
    onChange: handleDataChange,
    onValidChange: setIsStepValid,
  };

  const getStepDefault = (n: number) =>
    (plan[`step${n}Data` as keyof Plan] as Record<string, unknown> | null | undefined) ?? undefined;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-slate-500 hover:text-slate-300 text-xl transition flex-shrink-0"
            >
              ←
            </button>
            <span className="text-sm font-medium text-white truncate">{plan.title}</span>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <SaveIndicator status={saveStatus} />
            <span className="text-xs text-slate-500 hidden sm:block">
              {plan.completedSteps.length}/10 étapes
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Progression */}
        <div className="mb-8">
          <StepProgress
            currentStep={currentStep}
            completedSteps={plan.completedSteps}
            onNavigate={handleNavigate}
          />
        </div>

        {/* Formulaire de l'étape courante */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 md:p-8 mb-6">
          {currentStep === 1 && (
            <Step1 {...stepProps} defaultValues={getStepDefault(1)} />
          )}
          {currentStep === 2 && (
            <Step2 {...stepProps} defaultValues={getStepDefault(2)} />
          )}
          {currentStep === 3 && (
            <Step3 {...stepProps} defaultValues={getStepDefault(3)} />
          )}
          {currentStep === 4 && (
            <Step4 {...stepProps} defaultValues={getStepDefault(4)} />
          )}
          {currentStep === 5 && (
            <Step5 {...stepProps} defaultValues={getStepDefault(5)} />
          )}
          {currentStep === 6 && (
            <Step6 {...stepProps} defaultValues={getStepDefault(6)} />
          )}
          {currentStep === 7 && (
            <Step7 {...stepProps} defaultValues={getStepDefault(7)} />
          )}
          {currentStep === 8 && (
            <Step8 {...stepProps} defaultValues={getStepDefault(8)} />
          )}
          {currentStep === 9 && (
            <Step9 {...stepProps} defaultValues={getStepDefault(9)} />
          )}
          {currentStep === 10 && (
            <Step10
              {...stepProps}
              defaultValues={getStepDefault(10)}
              planData={plan}
              onNavigateToStep={handleNavigate}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 1 || isSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition text-sm font-medium"
          >
            ← Précédent
          </button>

          <div className="text-xs text-slate-500 hidden sm:block">
            {isSaving ? "Sauvegarde..." : `Étape ${currentStep} / 10`}
          </div>

          {currentStep < 10 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900 font-semibold hover:from-amber-400 hover:to-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm shadow-lg"
            >
              {isSaving ? "Sauvegarde..." : "Suivant →"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalize}
              disabled={isSaving || !isStepValid}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-white font-semibold hover:from-emerald-400 hover:to-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm shadow-lg"
            >
              {isSaving ? "Sauvegarde..." : "✓ Finaliser le questionnaire"}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
