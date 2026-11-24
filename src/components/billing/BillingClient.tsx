"use client";

import { useState } from "react";

interface Plan {
  id: string;
  title: string;
  isPaid: boolean;
  paidAt: Date | null;
  status: string;
  generationStatus: string | null;
  payments: Array<{ status: string; amount: number; currency: string; createdAt: Date }>;
}

const PRICE_CAD = 499;

export default function BillingClient({ plans }: { plans: Plan[] }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function startCheckout(planId: string) {
    setLoading(planId);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      if (data.url) window.location.href = data.url;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur lors du paiement");
    } finally {
      setLoading(null);
    }
  }

  const paidPlans = plans.filter((p) => p.isPaid);
  const unpaidPlans = plans.filter((p) => !p.isPaid && p.generationStatus === "GENERATED");

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">{error}</div>
      )}

      {/* Plans payés */}
      {paidPlans.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Plans débloqués</h2>
          <div className="space-y-3">
            {paidPlans.map((plan) => (
              <div key={plan.id} className="bg-white border border-green-200 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-sm">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Payé</span>
                    {plan.paidAt && (
                      <span className="text-xs text-gray-400">{new Date(plan.paidAt).toLocaleDateString("fr-CA")}</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900">{plan.title}</h3>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <a
                    href={`/api/plans/${plan.id}/export?format=pdf`}
                    className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                  >
                    PDF
                  </a>
                  <a
                    href={`/api/plans/${plan.id}/export?format=docx`}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                  >
                    Word
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Plans à payer */}
      {unpaidPlans.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Plans disponibles au paiement</h2>
          <div className="space-y-3">
            {unpaidPlans.map((plan) => {
              const lastPayment = plan.payments[0];
              const isPending = lastPayment?.status === "PENDING";
              return (
                <div key={plan.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{plan.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Plan complet généré · 17 sections · Export PDF + Word
                      </p>
                      {isPending && (
                        <p className="text-xs text-yellow-600 mt-1">⏳ Paiement en attente de confirmation…</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xl font-bold text-gray-900">{PRICE_CAD} $</p>
                      <p className="text-xs text-gray-400">CAD · paiement unique</p>
                    </div>
                  </div>

                  <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-2 mb-3 text-sm text-gray-700">
                      {["✓ Plan complet 17 sections", "✓ Export PDF professionnel", "✓ Export Word modifiable", "✓ Accès à vie"].map((f) => (
                        <span key={f}>{f}</span>
                      ))}
                    </div>
                    <button
                      onClick={() => startCheckout(plan.id)}
                      disabled={loading === plan.id || isPending}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-sm text-sm"
                    >
                      {loading === plan.id
                        ? "Redirection vers le paiement…"
                        : isPending
                        ? "Vérification en cours…"
                        : `Payer ${PRICE_CAD} $ CAD — Accès immédiat`}
                    </button>
                    <p className="text-xs text-center text-gray-400 mt-2">🔒 Paiement sécurisé par Stripe · Aucune carte enregistrée</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Aucun plan généré */}
      {plans.length === 0 || (paidPlans.length === 0 && unpaidPlans.length === 0) && (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-sm">
          <p className="text-4xl mb-3">📋</p>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucun plan prêt au paiement</h3>
          <p className="text-gray-500 text-sm">
            Complétez le questionnaire et générez votre plan d&apos;affaires pour accéder au paiement.
          </p>
          <a href="/dashboard" className="inline-block mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
            Créer mon plan
          </a>
        </div>
      )}
    </div>
  );
}
