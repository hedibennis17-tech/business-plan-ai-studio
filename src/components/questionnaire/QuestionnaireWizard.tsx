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

const STEP_LABELS: Record<number, string> = {
  1: "Profil",
  2: "Projet",
  3: "Marché",
  4: "Clientèle",
  5: "Concurrence",
  6: "Marketing",
  7: "Opérations",
  8: "Financement",
  9: "Prévisions",
  10: "Validation",
};

export default function QuestionnaireWizard({ initialPlan }: Props) {
  const router = useRouter();
  const [plan, setPlan] = useState<Plan>(initialPlan);
  const [currentStep, setCurrentStep] = useState(initialPlan.currentStep || 1);
  const [stepData, setStepData] = useState<Record<string, unknown>>({});
  const [isStepValid, setIsStepValid] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

      const res = await fetch(`/api/plans/${plan.id}`);
      if (res.ok) {
        const { plan: updated } = await res.json();
        setPlan(updated);
      }

      setCurrentStep(targetStep);
      setSidebarOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [flushSave, plan.id]
  );

  const handleNext = useCallback(async () => {
    if (currentStep < 10) await saveAndNavigate(currentStep + 1);
  }, [currentStep, saveAndNavigate]);

  const handlePrev = useCallback(async () => {
    if (currentStep > 1) await saveAndNavigate(currentStep - 1);
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

  const progressPct = Math.round((plan.completedSteps.length / 10) * 100);

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg, #F7F8F6)" }}>
      {/* ── Sidebar overlay mobile ── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 40,
          }}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        style={{
          width: 260,
          background: "var(--primary, #173F35)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: sidebarOpen ? 0 : -260,
          bottom: 0,
          zIndex: 50,
          transition: "left 0.25s ease",
        }}
        className="lg:static lg:left-0"
      >
        {/* Logo */}
        <div
          style={{
            padding: "24px 20px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <button
            onClick={() => router.push("/dashboard")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "white",
              background: "none",
              border: "none",
              cursor: "pointer",
              width: "100%",
            }}
          >
            <span
              style={{
                width: 36,
                height: 36,
                background: "var(--accent, #D6A84F)",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                fontWeight: 700,
                color: "#173F35",
                flexShrink: 0,
              }}
            >
              ✦
            </span>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "white", lineHeight: 1.2 }}>
                Business Plan
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.2 }}>
                AI Studio
              </div>
            </div>
          </button>
        </div>

        {/* Titre du plan */}
        <div style={{ padding: "14px 20px 10px" }}>
          <div
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "rgba(255,255,255,0.4)",
              marginBottom: 4,
            }}
          >
            Plan en cours
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "white",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {plan.title}
          </div>
        </div>

        {/* Barre de progression */}
        <div style={{ padding: "0 20px 16px" }}>
          <div
            style={{
              height: 4,
              background: "rgba(255,255,255,0.15)",
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progressPct}%`,
                background: "var(--accent, #D6A84F)",
                borderRadius: 4,
                transition: "width 0.4s ease",
              }}
            />
          </div>
          <div
            style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 5 }}
          >
            {plan.completedSteps.length}/10 étapes complétées
          </div>
        </div>

        {/* Navigation étapes */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "4px 12px" }}>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((step) => {
            const isCompleted = plan.completedSteps.includes(step);
            const isCurrent = step === currentStep;
            return (
              <button
                key={step}
                onClick={() => handleNavigate(step)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 10px",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  marginBottom: 2,
                  background: isCurrent
                    ? "rgba(255,255,255,0.12)"
                    : "transparent",
                  transition: "background 0.15s",
                  textAlign: "left",
                }}
              >
                {/* Indicateur */}
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    flexShrink: 0,
                    background: isCompleted
                      ? "var(--accent, #D6A84F)"
                      : isCurrent
                      ? "rgba(255,255,255,0.2)"
                      : "rgba(255,255,255,0.08)",
                    color: isCompleted ? "#173F35" : "white",
                  }}
                >
                  {isCompleted ? "✓" : step}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: isCurrent ? 600 : 400,
                    color: isCurrent
                      ? "white"
                      : isCompleted
                      ? "rgba(255,255,255,0.7)"
                      : "rgba(255,255,255,0.45)",
                  }}
                >
                  {STEP_LABELS[step]}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Bas de sidebar */}
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <button
            onClick={() => router.push("/dashboard")}
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.15)",
              background: "transparent",
              color: "rgba(255,255,255,0.6)",
              fontSize: 13,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            ← Tableau de bord
          </button>
        </div>
      </aside>

      {/* ── Contenu principal ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header mobile / top bar */}
        <header
          style={{
            background: "white",
            borderBottom: "1px solid #E5E7EB",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
        >
          {/* Bouton menu mobile */}
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
            }}
            className="lg:hidden"
          >
            <span style={{ width: 20, height: 2, background: "#173F35", borderRadius: 2 }} />
            <span style={{ width: 20, height: 2, background: "#173F35", borderRadius: 2 }} />
            <span style={{ width: 20, height: 2, background: "#173F35", borderRadius: 2 }} />
          </button>

          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
            <span
              style={{
                fontSize: 12,
                color: "#6B7280",
                flexShrink: 0,
              }}
            >
              Étape {currentStep}/10
            </span>
            <span style={{ color: "#D1D5DB", fontSize: 14 }}>›</span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#173F35",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {STEP_LABELS[currentStep]}
            </span>
          </div>

          {/* Save indicator */}
          <div style={{ flexShrink: 0 }}>
            <SaveIndicator status={saveStatus} />
          </div>
        </header>

        {/* Corps */}
        <main style={{ flex: 1, padding: "24px 20px 32px", maxWidth: 780, width: "100%", margin: "0 auto" }}>
          {/* Progress dots compact */}
          <div style={{ marginBottom: 24 }}>
            <StepProgress
              currentStep={currentStep}
              completedSteps={plan.completedSteps}
              onNavigate={handleNavigate}
            />
          </div>

          {/* Carte du formulaire */}
          <div
            style={{
              background: "white",
              borderRadius: 20,
              border: "1px solid #E5E7EB",
              padding: "32px",
              marginBottom: 24,
              boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(23,63,53,0.04)",
            }}
          >
            {currentStep === 1 && <Step1 {...stepProps} defaultValues={getStepDefault(1)} />}
            {currentStep === 2 && <Step2 {...stepProps} defaultValues={getStepDefault(2)} />}
            {currentStep === 3 && <Step3 {...stepProps} defaultValues={getStepDefault(3)} />}
            {currentStep === 4 && <Step4 {...stepProps} defaultValues={getStepDefault(4)} />}
            {currentStep === 5 && <Step5 {...stepProps} defaultValues={getStepDefault(5)} />}
            {currentStep === 6 && <Step6 {...stepProps} defaultValues={getStepDefault(6)} />}
            {currentStep === 7 && <Step7 {...stepProps} defaultValues={getStepDefault(7)} />}
            {currentStep === 8 && <Step8 {...stepProps} defaultValues={getStepDefault(8)} />}
            {currentStep === 9 && <Step9 {...stepProps} defaultValues={getStepDefault(9)} />}
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 1 || isSaving}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 20px",
                borderRadius: 12,
                border: "1px solid #D1D5DB",
                background: "white",
                color: currentStep === 1 || isSaving ? "#D1D5DB" : "#374151",
                fontSize: 14,
                fontWeight: 500,
                cursor: currentStep === 1 || isSaving ? "not-allowed" : "pointer",
                transition: "all 0.15s",
              }}
            >
              ← Précédent
            </button>

            <span style={{ fontSize: 13, color: "#9CA3AF" }}>
              {isSaving ? "Sauvegarde…" : `${plan.completedSteps.length}/10 complétées`}
            </span>

            {currentStep < 10 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={isSaving}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 24px",
                  borderRadius: 12,
                  border: "none",
                  background: "var(--accent, #D6A84F)",
                  color: "#173F35",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: isSaving ? "not-allowed" : "pointer",
                  opacity: isSaving ? 0.6 : 1,
                  transition: "all 0.15s",
                  boxShadow: "0 2px 8px rgba(214,168,79,0.3)",
                }}
              >
                {isSaving ? "Sauvegarde…" : "Suivant →"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalize}
                disabled={isSaving || !isStepValid}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 24px",
                  borderRadius: 12,
                  border: "none",
                  background: isSaving || !isStepValid
                    ? "#D1D5DB"
                    : "var(--primary, #173F35)",
                  color: "white",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: isSaving || !isStepValid ? "not-allowed" : "pointer",
                  transition: "all 0.15s",
                  boxShadow:
                    isSaving || !isStepValid
                      ? "none"
                      : "0 2px 8px rgba(23,63,53,0.3)",
                }}
              >
                {isSaving ? "Sauvegarde…" : "✓ Finaliser"}
              </button>
            )}
          </div>
        </main>
      </div>

      {/* CSS pour masquer/montrer la sidebar sur desktop */}
      <style>{`
        @media (min-width: 1024px) {
          aside {
            position: sticky !important;
            top: 0 !important;
            left: 0 !important;
            height: 100vh;
          }
        }
      `}</style>
    </div>
  );
}
