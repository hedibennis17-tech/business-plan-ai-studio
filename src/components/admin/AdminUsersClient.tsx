"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/admin/rbac";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  isGoogle: boolean;
  planCount: number;
}

export default function AdminUsersClient({
  users,
  total,
  page,
  pageSize,
  query,
  filterRole,
  canSuspend,
  canChangeRole,
}: {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
  query: string;
  filterRole: string;
  canSuspend: boolean;
  canChangeRole: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [search, setSearch] = useState(query);

  const totalPages = Math.ceil(total / pageSize);

  function navigate(params: Record<string, string>) {
    const sp = new URLSearchParams();
    if (search) sp.set("q", search);
    if (filterRole) sp.set("role", filterRole);
    sp.set("page", "1");
    Object.entries(params).forEach(([k, v]) => sp.set(k, v));
    router.push(`/admin/users?${sp.toString()}`);
  }

  async function changeRole(userId: string, newRole: string) {
    setLoading(userId);
    setMessage(null);
    const res = await fetch("/api/admin/users/role", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: newRole }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage({ type: "ok", text: `Rôle mis à jour → ${ROLE_LABELS[newRole] ?? newRole}` });
      router.refresh();
    } else {
      setMessage({ type: "err", text: data.error ?? "Erreur" });
    }
    setLoading(null);
  }

  return (
    <>
      {/* Barre de recherche */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && navigate({ q: search })}
          placeholder="Rechercher par email ou nom..."
          style={{
            flex: 1,
            minWidth: 200,
            padding: "8px 14px",
            border: "1px solid #D1D5DB",
            borderRadius: 8,
            fontSize: 13,
          }}
        />
        <select
          value={filterRole}
          onChange={(e) => navigate({ role: e.target.value })}
          style={{
            padding: "8px 14px",
            border: "1px solid #D1D5DB",
            borderRadius: 8,
            fontSize: 13,
            background: "var(--surface)",
          }}
        >
          <option value="">Tous les rôles</option>
          <option value="USER">Utilisateur</option>
          <option value="ADMIN">Admin</option>
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="SUPPORT">Support</option>
          <option value="FINANCE">Finance</option>
        </select>
        <button
          onClick={() => navigate({ q: search })}
          style={{
            padding: "8px 20px",
            background: "#173F35",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Rechercher
        </button>
      </div>

      {message && (
        <div
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            marginBottom: 16,
            background: message.type === "ok" ? "#D1FAE5" : "#FEE2E2",
            color: message.type === "ok" ? "#065F46" : "#991B1B",
            fontSize: 13,
          }}
        >
          {message.text}
        </div>
      )}

      {/* Table */}
      <div
        style={{
          background: "var(--surface)",
          borderRadius: 12,
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F9FAFB" }}>
              {["Utilisateur", "Rôle", "Plans", "Inscription", "Auth", "Actions"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
                    {user.name || "(sans nom)"}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{user.email}</div>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  {canChangeRole ? (
                    <select
                      value={user.role}
                      disabled={loading === user.id}
                      onChange={(e) => changeRole(user.id, e.target.value)}
                      style={{
                        padding: "4px 8px",
                        border: `1px solid ${ROLE_COLORS[user.role] ?? "#D1D5DB"}`,
                        borderRadius: 6,
                        fontSize: 12,
                        color: ROLE_COLORS[user.role] ?? "#374151",
                        fontWeight: 600,
                        background: "var(--surface)",
                        cursor: "pointer",
                      }}
                    >
                      <option value="USER">Utilisateur</option>
                      <option value="ADMIN">Admin</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                      <option value="SUPPORT">Support</option>
                      <option value="FINANCE">Finance</option>
                    </select>
                  ) : (
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 10px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 600,
                        background: (ROLE_COLORS[user.role] ?? "#6B7280") + "20",
                        color: ROLE_COLORS[user.role] ?? "#6B7280",
                      }}
                    >
                      {ROLE_LABELS[user.role] ?? user.role}
                    </span>
                  )}
                </td>
                <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--text-secondary)" }}>
                  {user.planCount}
                </td>
                <td style={{ padding: "14px 16px", fontSize: 12, color: "var(--text-muted)" }}>
                  {new Intl.DateTimeFormat("fr-CA", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }).format(new Date(user.createdAt))}
                </td>
                <td style={{ padding: "14px 16px", fontSize: 12 }}>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 20,
                      background: user.isGoogle ? "#EFF6FF" : "#F0FDF4",
                      color: user.isGoogle ? "#1D4ED8" : "#166534",
                      fontWeight: 500,
                    }}
                  >
                    {user.isGoogle ? "Google" : "Email"}
                  </span>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  {loading === user.id && (
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Mise à jour...</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)", fontSize: 14 }}>
            Aucun utilisateur trouvé
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => navigate({ page: String(p) })}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                border: "1px solid",
                borderColor: p === page ? "#173F35" : "#D1D5DB",
                background: p === page ? "#173F35" : "#fff",
                color: p === page ? "#fff" : "#374151",
                fontSize: 13,
                cursor: "pointer",
                fontWeight: p === page ? 600 : 400,
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
