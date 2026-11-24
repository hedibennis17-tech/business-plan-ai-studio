"use client";

import { useState } from "react";

interface Plan {
  id: string;
  title: string;
  status: string;
  generationStatus: string | null;
  generationCount: number;
  isPaid: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  archivedAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user: { id: string; email: string | null; name: string | null };
  payments: { status: string; amount: number }[];
}

interface Props {
  plans: Plan[];
  total: number;
  page: number;
  pageSize: number;
  filter: string;
  q: string;
}

export default function AdminPlansClient({ plans: initialPlans, total, page, pageSize, filter, q }: Props) {
  const [plans, setPlans] = useState(initialPlans);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.ceil(total / pageSize);

  async function handleAction(planId: string, action: "archive" | "unarchive" | "delete" | "restore") {
    setLoading(planId + action);
    setError(null);
    try {
      const res = await fetch("/api/admin/plans", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, action }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erreur");
        return;
      }
      // Retirer de la liste courante (le filtre actif ne les montrera plus)
      setPlans((prev) => prev.filter((p) => p.id !== planId));
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(null);
    }
  }

  const STATUS_LABELS: Record<string, { bg: string; color: string; label: string }> = {
    DRAFT: { bg: "bg-gray-100", color: "text-gray-600", label: "Brouillon" },
    IN_PROGRESS: { bg: "bg-yellow-100", color: "text-yellow-800", label: "En cours" },
    COMPLETE: { bg: "bg-green-100", color: "text-green-800", label: "Complet" },
  };

  const GEN_LABELS: Record<string, { bg: string; color: string }> = {
    GENERATING: { bg: "bg-yellow-100", color: "text-yellow-800" },
    GENERATED: { bg: "bg-purple-100", color: "text-purple-800" },
    GENERATION_FAILED: { bg: "bg-red-100", color: "text-red-800" },
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {/* Barre de recherche */}
      <form method="GET" className="flex gap-2 mb-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Titre ou email..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input type="hidden" name="filter" value={filter} />
        <button
          type="submit"
          className="px-4 py-2 bg-green-800 text-white text-sm rounded-lg hover:bg-green-700"
        >
          Chercher
        </button>
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <tr>
              {["Plan", "Propriétaire", "Statut", "IA", "Paiement", "Date", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left border-b border-gray-200">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => {
              const s = STATUS_LABELS[plan.status] ?? { bg: "bg-gray-100", color: "text-gray-600", label: plan.status };
              const g = plan.generationStatus ? GEN_LABELS[plan.generationStatus] : null;
              const lastPayment = plan.payments[0];
              const busy = loading?.startsWith(plan.id);

              return (
                <tr key={plan.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 truncate max-w-[180px]">{plan.title}</div>
                    <div className="text-xs text-gray-400">{plan.id.slice(0, 8)}…</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-700">{plan.user.name ?? "(sans nom)"}</div>
                    <div className="text-xs text-gray-400">{plan.user.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.color}`}>
                      {s.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {g ? (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${g.bg} ${g.color}`}>
                        {plan.generationStatus}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {plan.isPaid ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        ✓ {lastPayment ? `${(lastPayment.amount / 100).toFixed(2)} $` : "Payé"}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">Gratuit</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Intl.DateTimeFormat("fr-CA", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(plan.createdAt))}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {!plan.isDeleted && !plan.isArchived && (
                        <button
                          onClick={() => handleAction(plan.id, "archive")}
                          disabled={!!busy}
                          className="px-2 py-1 text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 rounded hover:bg-yellow-100 disabled:opacity-50"
                        >
                          {busy && loading === plan.id + "archive" ? "…" : "Archiver"}
                        </button>
                      )}
                      {plan.isArchived && !plan.isDeleted && (
                        <button
                          onClick={() => handleAction(plan.id, "unarchive")}
                          disabled={!!busy}
                          className="px-2 py-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 disabled:opacity-50"
                        >
                          {busy && loading === plan.id + "unarchive" ? "…" : "Restaurer"}
                        </button>
                      )}
                      {!plan.isDeleted && (
                        <button
                          onClick={() => {
                            if (confirm(`Supprimer définitivement le plan "${plan.title}" ? (soft delete — données conservées)`)) {
                              handleAction(plan.id, "delete");
                            }
                          }}
                          disabled={!!busy}
                          className="px-2 py-1 text-xs bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 disabled:opacity-50"
                        >
                          {busy && loading === plan.id + "delete" ? "…" : "Supprimer"}
                        </button>
                      )}
                      {plan.isDeleted && (
                        <button
                          onClick={() => handleAction(plan.id, "restore")}
                          disabled={!!busy}
                          className="px-2 py-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 disabled:opacity-50"
                        >
                          {busy && loading === plan.id + "restore" ? "…" : "Restaurer"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {plans.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            Aucun plan dans cette catégorie
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/admin/plans?filter=${filter}&q=${q}&page=${p}`}
              className={`w-9 h-9 flex items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                p === page
                  ? "bg-green-800 text-white border-green-800"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
