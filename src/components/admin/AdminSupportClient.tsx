"use client";

import { useState } from "react";

type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

interface Ticket {
  id: string;
  subject: string;
  status: TicketStatus;
  priority: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  user: { name: string | null; email: string };
  messages: Array<{ content: string; isAdmin: boolean; createdAt: string | Date }>;
  _count: { messages: number };
}

const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: "Ouvert",
  IN_PROGRESS: "En cours",
  RESOLVED: "Résolu",
  CLOSED: "Fermé",
};

const STATUS_COLORS: Record<TicketStatus, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-500",
};

export default function AdminSupportClient({
  initialTickets,
  canRespond,
}: {
  initialTickets: Ticket[];
  canRespond: boolean;
}) {
  const [tickets, setTickets] = useState(initialTickets);
  const [filter, setFilter] = useState<"ALL" | TicketStatus>("ALL");
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [reply, setReply] = useState("");
  const [newStatus, setNewStatus] = useState<TicketStatus | "">("");
  const [loading, setLoading] = useState(false);

  const filtered = filter === "ALL" ? tickets : tickets.filter((t) => t.status === filter);

  async function sendReply() {
    if (!selected || (!reply.trim() && !newStatus)) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/support", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: selected.id, message: reply.trim() || undefined, status: newStatus || undefined }),
      });
      if (!res.ok) throw new Error("Erreur");
      // Mise à jour locale
      const updatedStatus = (newStatus || (reply.trim() ? "IN_PROGRESS" : selected.status)) as TicketStatus;
      const updatedTickets = tickets.map((t) =>
        t.id === selected.id
          ? {
              ...t,
              status: updatedStatus,
              updatedAt: new Date(),
              _count: { messages: t._count.messages + (reply.trim() ? 1 : 0) },
              messages: reply.trim()
                ? [{ content: reply.trim(), isAdmin: true, createdAt: new Date() }]
                : t.messages,
            }
          : t
      );
      setTickets(updatedTickets);
      setSelected({ ...selected, status: updatedStatus });
      setReply("");
      setNewStatus("");
    } catch {
      alert("Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-4 h-[600px]">
      {/* Liste */}
      <div className="w-1/2 bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col">
        {/* Filtres */}
        <div className="flex gap-1 p-3 border-b border-gray-100 overflow-x-auto">
          {(["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
                filter === s ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-600"
              }`}
            >
              {s === "ALL" ? "Tous" : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
        {/* Tickets */}
        <div className="overflow-y-auto flex-1">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">Aucun ticket</p>
          ) : (
            filtered.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelected(t)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selected?.id === t.id ? "bg-blue-50 border-l-2 border-l-blue-500" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${STATUS_COLORS[t.status]}`}>
                        {STATUS_LABELS[t.status]}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate">{t.subject}</p>
                    <p className="text-xs text-gray-500 truncate">{t.user.name ?? t.user.email}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">{new Date(t.updatedAt).toLocaleDateString("fr-CA")}</p>
                    <p className="text-xs text-gray-400">{t._count.messages} msg</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Détail */}
      <div className="flex-1 bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400 text-sm">Sélectionnez un ticket</p>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{selected.subject}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[selected.status]}`}>
                  {STATUS_LABELS[selected.status]}
                </span>
                <span className="text-xs text-gray-400">{selected.user.name ?? selected.user.email}</span>
                <span className="text-xs text-gray-400">#{selected.id.slice(-6).toUpperCase()}</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {selected.messages.map((m, i) => (
                <div key={i} className={`flex ${m.isAdmin ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-xl p-3 text-sm ${
                    m.isAdmin ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
                  }`}>
                    {m.isAdmin && <p className="text-xs opacity-70 mb-1 font-medium">Admin</p>}
                    <p>{m.content}</p>
                    <p className={`text-xs mt-1 ${m.isAdmin ? "opacity-70" : "text-gray-400"}`}>
                      {new Date(m.createdAt).toLocaleString("fr-CA")}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Zone réponse */}
            {canRespond && (
              <div className="p-4 border-t border-gray-100 space-y-2">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={2}
                  placeholder="Répondre au client…"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <div className="flex items-center gap-2">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as TicketStatus | "")}
                    className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none"
                  >
                    <option value="">Changer statut…</option>
                    {(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as TicketStatus[]).map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                  <button
                    onClick={sendReply}
                    disabled={loading || (!reply.trim() && !newStatus)}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
                  >
                    {loading ? "Envoi…" : "Envoyer"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
