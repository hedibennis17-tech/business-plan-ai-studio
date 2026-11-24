"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

interface Payment {
  id: string;
  stripeSessionId: string;
  stripePaymentIntentId: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: Date;
  user: { id: string; name: string | null; email: string };
  planTitle: string;
}

interface KPIs {
  totalRevenue: number;
  revenueThisMonth: number;
  totalCount: number;
  completedCount: number;
  refundedCount: number;
  failedCount: number;
}

const STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "En attente",
  COMPLETED: "Complété",
  FAILED: "Échoué",
  REFUNDED: "Remboursé",
};

const STATUS_COLORS: Record<PaymentStatus, { bg: string; color: string }> = {
  PENDING: { bg: "#FFF3CD", color: "#856404" },
  COMPLETED: { bg: "#D1FAE5", color: "#065F46" },
  FAILED: { bg: "#FEE2E2", color: "#991B1B" },
  REFUNDED: { bg: "#E0E7FF", color: "#3730A3" },
};

function fmt(cents: number): string {
  return `${(cents / 100).toFixed(2)} $`;
}

function fmtDate(d: Date): string {
  return new Date(d).toLocaleDateString("fr-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminTransactionsClient({
  kpis,
  payments,
  totalFiltered,
  page,
  pageSize,
  statusFilter,
  search,
}: {
  kpis: KPIs;
  payments: Payment[];
  totalFiltered: number;
  page: number;
  pageSize: number;
  statusFilter: string;
  search: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [localSearch, setLocalSearch] = useState(search);

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    params.set("page", "1");
    startTransition(() => router.push(`/admin/transactions?${params.toString()}`));
  }

  const totalPages = Math.ceil(totalFiltered / pageSize);

  const statusOptions = ["ALL", "COMPLETED", "PENDING", "FAILED", "REFUNDED"];

  return (
    <div style={{ fontFamily: "Inter, sans-serif", color: "#1A1A1A" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--primary)", margin: 0 }}>
          💳 Transactions & Paiements
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14, margin: "4px 0 0" }}>
          Historique complet des paiements Stripe
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
        <KPICard
          label="Revenu total"
          value={`${kpis.totalRevenue.toFixed(2)} $`}
          icon="💰"
          color="#173F35"
        />
        <KPICard
          label="Ce mois-ci"
          value={`${kpis.revenueThisMonth.toFixed(2)} $`}
          icon="📅"
          color="#2563EB"
        />
        <KPICard
          label="Transactions"
          value={`${kpis.completedCount} / ${kpis.totalCount}`}
          sub={`${kpis.failedCount} échoués · ${kpis.refundedCount} remboursés`}
          icon="📊"
          color="#6366F1"
        />
      </div>

      {/* Filtres */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: "16px 20px",
          marginBottom: 20,
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Chercher par email, nom, session Stripe..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && updateParams({ search: localSearch })}
          style={{
            flex: 1,
            minWidth: 220,
            padding: "8px 12px",
            border: "1px solid #D1D5DB",
            borderRadius: 6,
            fontSize: 13,
          }}
        />
        <div style={{ display: "flex", gap: 6 }}>
          {statusOptions.map((s) => (
            <button
              key={s}
              onClick={() => updateParams({ status: s === "ALL" ? "" : s })}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid",
                borderColor: statusFilter === s || (s === "ALL" && statusFilter === "ALL") ? "#173F35" : "#D1D5DB",
                background: statusFilter === s || (s === "ALL" && statusFilter === "ALL") ? "#173F35" : "#fff",
                color: statusFilter === s || (s === "ALL" && statusFilter === "ALL") ? "#fff" : "#374151",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {s === "ALL" ? "Tous" : STATUS_LABELS[s as PaymentStatus]}
            </button>
          ))}
        </div>
        {isPending && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Chargement...</span>}
      </div>

      {/* Table */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F9FAFB", borderBottom: "1px solid var(--border)" }}>
                {["Date", "Client", "Plan", "Session Stripe", "Montant", "Statut"].map((h) => (
                  <th
                    key={h}
                    style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "var(--text-muted)", fontSize: 12 }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
                    Aucune transaction trouvée
                  </td>
                </tr>
              ) : (
                payments.map((p, i) => {
                  const statusStyle = STATUS_COLORS[p.status];
                  return (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: i < payments.length - 1 ? "1px solid #F3F4F6" : "none",
                        background: i % 2 === 0 ? "#fff" : "#FAFAFA",
                      }}
                    >
                      <td style={{ padding: "12px 16px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                        {fmtDate(p.createdAt)}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: 600, color: "var(--text)" }}>
                          {p.user.name ?? "—"}
                        </div>
                        <div style={{ color: "var(--text-muted)", fontSize: 11 }}>{p.user.email}</div>
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--text-secondary)", maxWidth: 180 }}>
                        <div
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={p.planTitle}
                        >
                          {p.planTitle}
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: 11, color: "var(--text-muted)" }}>
                        {p.stripeSessionId.slice(0, 20)}...
                      </td>
                      <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--primary)", whiteSpace: "nowrap" }}>
                        {fmt(p.amount)} {p.currency.toUpperCase()}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 10px",
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 600,
                            background: statusStyle.bg,
                            color: statusStyle.color,
                          }}
                        >
                          {STATUS_LABELS[p.status]}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              padding: "12px 20px",
              borderTop: "1px solid #E5E7EB",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
              {totalFiltered} résultat{totalFiltered !== 1 ? "s" : ""} · page {page}/{totalPages}
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              {page > 1 && (
                <button
                  onClick={() => updateParams({ page: String(page - 1) })}
                  style={{
                    padding: "6px 14px",
                    border: "1px solid #D1D5DB",
                    borderRadius: 6,
                    background: "var(--surface)",
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  ← Précédent
                </button>
              )}
              {page < totalPages && (
                <button
                  onClick={() => updateParams({ page: String(page + 1) })}
                  style={{
                    padding: "6px 14px",
                    border: "1px solid #D1D5DB",
                    borderRadius: 6,
                    background: "var(--surface)",
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  Suivant →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function KPICard({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: string;
  color: string;
}) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "20px 24px",
        display: "flex",
        alignItems: "flex-start",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          background: `${color}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 700, color, marginTop: 2 }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}
