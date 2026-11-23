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
  const progress = Math.round((completedSteps.length / 10) * 100);

  return (
    <div className="w-full">
      {/* Barre de progression */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-300">
          Étape {currentStep} sur 10
        </span>
        <span className="text-sm font-semibold text-amber-400">{progress}% complété</span>
      </div>

      <div className="w-full bg-slate-700 rounded-full h-2 mb-6">
        <div
          className="bg-gradient-to-r from-amber-500 to-amber-400 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Étapes numérotées */}
      <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
        {STEP_LABELS.map((label, i) => {
          const step = i + 1;
          const isCompleted = completedSteps.includes(step);
          const isCurrent = step === currentStep;
          const isClickable = isCompleted || step === currentStep;

          return (
            <button
              key={step}
              onClick={() => isClickable && onNavigate?.(step)}
              disabled={!isClickable}
              className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all min-w-[60px]
                ${isCurrent ? "bg-amber-500/20 border border-amber-500/50" : ""}
                ${isCompleted && !isCurrent ? "cursor-pointer hover:bg-slate-700/50" : ""}
                ${!isClickable ? "opacity-40 cursor-not-allowed" : ""}
              `}
              title={label}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                  ${isCompleted
                    ? "bg-amber-500 border-amber-500 text-slate-900"
                    : isCurrent
                    ? "bg-transparent border-amber-400 text-amber-400"
                    : "bg-transparent border-slate-600 text-slate-500"
                  }
                `}
              >
                {isCompleted ? "✓" : step}
              </div>
              <span
                className={`text-[10px] font-medium leading-tight text-center
                  ${isCurrent ? "text-amber-400" : isCompleted ? "text-slate-300" : "text-slate-500"}
                `}
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
