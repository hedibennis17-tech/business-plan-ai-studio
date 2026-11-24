"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

interface Ticket {
  id: string;
  subject: string;
  status: TicketStatus;
  priority: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  messages: Array<{ content: string; createdAt: string | Date }>;
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

export default function SupportClient({ initialTickets }: { initialTickets: Ticket[] }) {
  const router = useRouter();
  const [tickets, setTickets] = useState(initialTickets);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function createTicket() {
    if (!subject.trim() || !message.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTickets([data.ticket, ...tickets]);
      setSubject("");
      setMessage("");
      setShowForm(false);
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Bouton nouveau ticket */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          + Nouveau ticket
        </button>
      )}

      {/* Formulaire création */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Nouveau ticket de support</h2>
          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Décrivez brièvement votre problème"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Détaillez votre problème…"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={createTicket}
                disabled={loading || !subject.trim() || !message.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
              >
                {loading ? "Envoi…" : "Envoyer"}
              </button>
              <button
                onClick={() => { setShowForm(false); setError(""); }}
                className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste tickets */}
      {tickets.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <p className="text-4xl mb-3">📬</p>
          <p className="text-gray-500">Aucun ticket de support pour l&apos;instant</p>
          <p className="text-sm text-gray-400 mt-1">Créez un ticket si vous avez besoin d&apos;aide</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <div key={t.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[t.status]}`}>
                      {STATUS_LABELS[t.status]}
                    </span>
                    <span className="text-xs text-gray-400">#{t.id.slice(-6).toUpperCase()}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 truncate">{t.subject}</h3>
                  {t.messages[0] && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{t.messages[0].content}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400">
                    {new Date(t.updatedAt).toLocaleDateString("fr-CA")}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{t._count.messages} message{t._count.messages > 1 ? "s" : ""}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
