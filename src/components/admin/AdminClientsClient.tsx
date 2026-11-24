"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

type Client = {
  id: string;
  title: string;
  currentStep: number;
  status: string;
  generationStatus: string | null;
  generationError: string | null;
  isPaid: boolean;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user: { id: string; name: string | null; email: string };
};

const STEP_LABELS: Record<number, string> = {
  1: "Identification", 2: "Projet", 3: "Marché", 4: "Clients",
  5: "Concurrents", 6: "Marketing", 7: "Opérations", 8: "Finances",
  9: "Projections", 10: "Validation",
};

function StatusBadge({ status }: { status: string | null }) {
  const map: Record<string, string> = {
    GENERATED: "bg-green-100 text-green-800",
    GENERATING: "bg-blue-100 text-blue-800",
    GENERATION_FAILED: "bg-red-100 text-red-800",
    DRAFT: "bg-gray-100 text-gray-700",
  };
  const label: Record<string, string> = {
    GENERATED: "Généré", GENERATING: "En cours", GENERATION_FAILED: "Échec", DRAFT: "Brouillon",
  };
  const cls = map[status ?? "DRAFT"] ?? "bg-gray-100 text-gray-700";
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{label[status ?? "DRAFT"] ?? status}</span>;
}

function PaymentBadge({ isPaid }: { isPaid: boolean }) {
  return isPaid
    ? <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Payé</span>
    : <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Non payé</span>;
}

export default function AdminClientsClient({
  clients, total, page, pageSize, canContact,
}: {
  clients: Client[];
  total: number;
  page: number;
  pageSize: number;
  canContact: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [relancingId, setRelancingId] = useState<string | null>(null);
  const [relanceResult, setRelanceResult] = useState<Record<string, string>>({});

  function applyFilters(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => v ? params.set(k, v) : params.delete(k));
    params.delete("page");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  async function handleRelance(client: Client) {
    setRelancingId(client.id);
    try {
      const res = await fetch("/api/admin/clients/relance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: client.id, email: client.user.email, name: client.user.name, currentStep: client.currentStep }),
      });
      const data = await res.json();
      setRelanceResult(prev => ({ ...prev, [client.id]: res.ok ? "✅ Email envoyé" : `❌ ${data.error}` }));
    } catch {
      setRelanceResult(prev => ({ ...prev, [client.id]: "❌ Erreur réseau" }));
    } finally {
      setRelancingId(null);
    }
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === "Enter" && applyFilters({ q })}
          placeholder="Rechercher client ou plan..."
          className="border rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#173F35]"
        />
        <select
          defaultValue={searchParams.get("status") ?? ""}
          onChange={e => applyFilters({ status: e.target.value })}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#173F35]"
        >
          <option value="">Tous statuts</option>
          <option value="DRAFT">Brouillon</option>
          <option value="GENERATING">En génération</option>
          <option value="GENERATED">Généré</option>
          <option value="GENERATION_FAILED">Échec</option>
        </select>
        <select
          defaultValue={searchParams.get("payment") ?? ""}
          onChange={e => applyFilters({ payment: e.target.value })}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#173F35]"
        >
          <option value="">Tous paiements</option>
          <option value="paid">Payé</option>
          <option value="unpaid">Non payé</option>
        </select>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">Client</th>
              <th className="px-4 py-3 text-left">Plan</th>
              <th className="px-4 py-3 text-center">Progression</th>
              <th className="px-4 py-3 text-center">Génération</th>
              <th className="px-4 py-3 text-center">Paiement</th>
              <th className="px-4 py-3 text-left">Dernière activité</th>
              {canContact && <th className="px-4 py-3 text-center">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clients.length === 0 && (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400">Aucun client trouvé</td></tr>
            )}
            {clients.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{c.user.name ?? "—"}</div>
                  <div className="text-gray-400 text-xs">{c.user.email}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-800 max-w-[180px] truncate">{c.title}</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-semibold text-[#173F35]">{c.currentStep}/10</span>
                    <span className="text-xs text-gray-400">{STEP_LABELS[c.currentStep]}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-[#173F35] h-1.5 rounded-full"
                        style={{ width: `${(c.currentStep / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <StatusBadge status={c.generationStatus} />
                  {c.generationError && (
                    <div className="text-xs text-red-500 mt-1 max-w-[120px] truncate" title={c.generationError}>
                      {c.generationError}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <PaymentBadge isPaid={c.isPaid} />
                  {c.paidAt && (
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(c.paidAt).toLocaleDateString("fr-CA")}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {new Date(c.updatedAt).toLocaleString("fr-CA", { dateStyle: "short", timeStyle: "short" })}
                </td>
                {canContact && (
                  <td className="px-4 py-3 text-center">
                    {!c.isPaid && c.currentStep >= 3 && (
                      <button
                        onClick={() => handleRelance(c)}
                        disabled={relancingId === c.id}
                        className="px-3 py-1.5 bg-[#173F35] text-white text-xs rounded-lg hover:bg-[#1f5447] disabled:opacity-50 transition-colors"
                      >
                        {relancingId === c.id ? "Envoi..." : "Relancer"}
                      </button>
                    )}
                    {relanceResult[c.id] && (
                      <div className="text-xs mt-1">{relanceResult[c.id]}</div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex gap-2 justify-center">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => applyFilters({ page: String(p) })}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                p === page ? "bg-[#173F35] text-white" : "bg-white border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
