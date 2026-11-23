"use client";

const STEP_LABELS = [
  "Profil",
  "Projet",
  "Marché",
  "Clientèle",
  "Concurrence",
  "Marketing",
  "Opérations",
  "Financement",
  "Prévisions",
  "Validation",
];

type Props = {
  currentStep: number;
  completedSteps: number[];
  onNavigate?: (step: number) => void;
};

export default function StepProgress({ currentStep, completedSteps, onNavigate }: Props) {
  return (
    <div style={{ width: "100%" }}>
      {/* Étapes compactes en ligne */}
      <div
        style={{
          display: "flex",
          gap: 4,
          overflowX: "auto",
          paddingBottom: 4,
        }}
      >
        {STEP_LABELS.map((label, i) => {
          const step = i + 1;
          const isCompleted = completedSteps.includes(step);
          const isCurrent = step === currentStep;
          const isClickable = isCompleted || step <= currentStep;

          return (
            <button
              key={step}
              onClick={() => isClickable && onNavigate?.(step)}
              disabled={!isClickable}
              title={label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                padding: "8px 6px",
                borderRadius: 10,
                border: isCurrent
                  ? "1px solid var(--accent, #D6A84F)"
                  : "1px solid transparent",
                background: isCurrent
                  ? "rgba(214,168,79,0.08)"
                  : "transparent",
                cursor: isClickable ? "pointer" : "not-allowed",
                opacity: !isClickable && !isCurrent ? 0.4 : 1,
                minWidth: 52,
                transition: "all 0.15s",
                flexShrink: 0,
              }}
            >
              {/* Cercle numéroté */}
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  border: isCompleted
                    ? "2px solid var(--accent, #D6A84F)"
                    : isCurrent
                    ? "2px solid var(--primary, #173F35)"
                    : "2px solid #E5E7EB",
                  background: isCompleted
                    ? "var(--accent, #D6A84F)"
                    : isCurrent
                    ? "var(--primary, #173F35)"
                    : "white",
                  color: isCompleted
                    ? "#173F35"
                    : isCurrent
                    ? "white"
                    : "#9CA3AF",
                  transition: "all 0.15s",
                }}
              >
                {isCompleted ? "✓" : step}
              </div>
              {/* Label */}
              <span
                style={{
                  fontSize: 9,
                  fontWeight: isCurrent ? 600 : 400,
                  color: isCurrent
                    ? "var(--primary, #173F35)"
                    : isCompleted
                    ? "#6B7280"
                    : "#9CA3AF",
                  textAlign: "center",
                  lineHeight: 1.2,
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
