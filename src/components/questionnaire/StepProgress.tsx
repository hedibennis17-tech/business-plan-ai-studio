"use client";

const STEP_LABELS = ["Profil", "Projet", "Marché", "Clientèle", "Concurrence", "Marketing", "Opérations", "Financement", "Prévisions", "Validation"];
const STEP_ICONS = ["profile", "project", "market", "clients", "market", "project", "profile", "finance", "finance", "validation"];

type Props = { currentStep: number; completedSteps: number[]; onNavigate?: (step: number) => void };

export default function StepProgress({ currentStep, completedSteps, onNavigate }: Props) {
  return (
    <div className="questionnaire-step-progress" aria-label="Progression du questionnaire">
      {STEP_LABELS.map((label, i) => {
        const step = i + 1;
        const isCompleted = completedSteps.includes(step);
        const isCurrent = step === currentStep;
        const isClickable = isCompleted || step <= currentStep;
        return (
          <button
            key={step}
            type="button"
            onClick={() => isClickable && onNavigate?.(step)}
            disabled={!isClickable}
            title={label}
            className={`${isCurrent ? "current" : ""} ${isCompleted ? "completed" : ""}`}
          >
            <span className="questionnaire-step-icon">
              <img src={`/icons/${STEP_ICONS[i]}.png`} alt="" width={30} height={30} />
              {isCompleted && <span className="questionnaire-step-check">✓</span>}
            </span>
            <span className="questionnaire-step-number">{String(step).padStart(2, "0")}</span>
            <span className="questionnaire-step-label">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
