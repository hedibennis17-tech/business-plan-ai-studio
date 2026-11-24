"use client";

import { useState } from "react";
import type { GeneratedSections } from "@/lib/generationEngine";

interface Props {
  planId: string;
  sections: GeneratedSections;
  financials: unknown;
  generationVersion: string | null;
  generationFinished: Date | null;
}

const SECTION_LABELS: { key: keyof GeneratedSections; label: string; icon: string }[] = [
  { key: "coverPage", label: "Page de couverture", icon: "📄" },
  { key: "executiveSummary", label: "Résumé exécutif", icon: "⚡" },
  { key: "companyPresentation", label: "Présentation de l'entreprise", icon: "🏢" },
  { key: "projectDescription", label: "Description du projet", icon: "💡" },
  { key: "marketAnalysis", label: "Analyse du marché", icon: "📊" },
  { key: "targetCustomers", label: "Clientèle cible", icon: "🎯" },
  { key: "competitionAnalysis", label: "Analyse de la concurrence", icon: "⚔️" },
  { key: "valueProposition", label: "Proposition de valeur", icon: "💎" },
  { key: "marketingStrategy", label: "Stratégie marketing", icon: "📣" },
  { key: "operationalPlan", label: "Plan opérationnel", icon: "⚙️" },
  { key: "humanResources", label: "Ressources humaines", icon: "👥" },
  { key: "investmentsFinancing", label: "Investissements et financement", icon: "💰" },
  { key: "financialProjections", label: "Prévisions financières", icon: "📈" },
  { key: "profitabilityAnalysis", label: "Analyse de rentabilité", icon: "✅" },
  { key: "riskAnalysis", label: "Analyse des risques", icon: "⚠️" },
  { key: "actionPlan", label: "Plan d'action", icon: "🗓️" },
  { key: "conclusion", label: "Conclusion", icon: "🏁" },
];

export default function SectionViewer({
  planId,
  sections,
  generationVersion,
  generationFinished,
}: Props) {
  const [activeSection, setActiveSection] = useState<keyof GeneratedSections>("executiveSummary");
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [regenError, setRegenError] = useState<string | null>(null);
  const [localSections, setLocalSections] = useState<GeneratedSections>(sections);

  async function handleRegenerate(sectionKey: keyof GeneratedSections) {
    setRegenerating(sectionKey);
    setRegenError(null);

    try {
      const res = await fetch(`/api/plans/${planId}/regenerate-section`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionKey }),
      });

      const data = await res.json();
      if (!res.ok) {
        setRegenError(data.error || "Erreur lors de la régénération");
        return;
      }

      setLocalSections((prev) => ({ ...prev, [sectionKey]: data.content }));
    } catch {
      setRegenError("Erreur réseau. Réessayez.");
    } finally {
      setRegenerating(null);
    }
  }

  const activeSectionData = SECTION_LABELS.find((s) => s.key === activeSection);

  return (
    <div className="flex gap-6 mt-6">
      {/* Sidebar navigation */}
      <aside className="w-64 shrink-0">
        <div className="sticky top-6 rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <div style={{ background: "var(--primary, #173F35)" }} className="px-4 py-3">
            <p className="text-sm font-semibold text-white">Chapitres</p>
            {generationFinished && (
              <p className="text-xs mt-0.5" style={{ color: "var(--accent, #D6A84F)" }}>
                Généré le {new Date(generationFinished).toLocaleDateString("fr-CA")}
              </p>
            )}
          </div>
          <nav className="divide-y divide-gray-100">
            {SECTION_LABELS.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={`w-full text-left px-4 py-2.5 flex items-center gap-2 text-sm transition-colors ${
                  activeSection === key
                    ? "font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                style={activeSection === key ? { background: "rgba(23,63,53,0.07)", color: "var(--primary, #173F35)" } : undefined}
              >
                <span>{icon}</span>
                <span className="truncate">{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* Section header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{activeSectionData?.icon}</span>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {activeSectionData?.label}
                </h2>
                {generationVersion && (
                  <p className="text-xs text-gray-500">Modèle : {generationVersion}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => handleRegenerate(activeSection)}
              disabled={regenerating !== null}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {regenerating === activeSection ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border border-gray-500 border-t-transparent" />
                  Régénération…
                </>
              ) : (
                <>
                  <span>🔄</span>
                  Régénérer
                </>
              )}
            </button>
          </div>

          {/* Content body */}
          <div className="px-6 py-6">
            {regenError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-700">{regenError}</p>
              </div>
            )}

            <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
              {localSections[activeSection] || (
                <span className="text-gray-400 italic">Section non disponible.</span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation prev/next */}
        <div className="mt-4 flex justify-between">
          {SECTION_LABELS.findIndex((s) => s.key === activeSection) > 0 && (
            <button
              onClick={() => {
                const idx = SECTION_LABELS.findIndex((s) => s.key === activeSection);
                setActiveSection(SECTION_LABELS[idx - 1].key);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              ← Précédent
            </button>
          )}
          <div className="flex-1" />
          {SECTION_LABELS.findIndex((s) => s.key === activeSection) < SECTION_LABELS.length - 1 && (
            <button
              onClick={() => {
                const idx = SECTION_LABELS.findIndex((s) => s.key === activeSection);
                setActiveSection(SECTION_LABELS[idx + 1].key);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="rounded-lg px-4 py-2 text-sm font-medium"
            style={{ border: "1px solid var(--primary, #173F35)", background: "rgba(23,63,53,0.06)", color: "var(--primary, #173F35)" }}
            >
              Suivant →
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
