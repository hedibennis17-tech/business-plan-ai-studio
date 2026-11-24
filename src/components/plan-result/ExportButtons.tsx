"use client";

/**
 * Phase 5 — Boutons d'export PDF + DOCX
 * Client component avec states de téléchargement
 */

import { useState } from "react";

interface ExportButtonsProps {
  planId: string;
}

export default function ExportButtons({ planId }: ExportButtonsProps) {
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingDocx, setLoadingDocx] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport(format: "pdf" | "docx") {
    const setLoading = format === "pdf" ? setLoadingPdf : setLoadingDocx;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/plans/${planId}/export?format=${format}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erreur lors de l'export");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="?([^"]+)"?/);
      a.download = match?.[1] ?? `business-plan.${format}`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Buttons row */}
      <div style={{
        display: "flex",
        gap: "0.75rem",
        flexWrap: "wrap",
        alignItems: "center",
      }}>
        {/* PDF Button */}
        <button
          onClick={() => handleExport("pdf")}
          disabled={loadingPdf || loadingDocx}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.6rem 1.25rem",
            background: loadingPdf ? "rgba(23,63,53,0.5)" : "var(--primary, #173F35)",
            color: "white",
            border: "none",
            borderRadius: "0.625rem",
            fontWeight: 600,
            fontSize: "0.875rem",
            cursor: loadingPdf || loadingDocx ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            boxShadow: "0 2px 8px rgba(23,63,53,0.2)",
          }}
        >
          {loadingPdf ? (
            <>
              <span style={{
                display: "inline-block",
                width: "14px",
                height: "14px",
                border: "2px solid rgba(255,255,255,0.3)",
                borderTopColor: "white",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }} />
              Génération PDF…
            </>
          ) : (
            <>
              <span style={{ fontSize: "1rem" }}>📄</span>
              Télécharger PDF
            </>
          )}
        </button>

        {/* DOCX Button */}
        <button
          onClick={() => handleExport("docx")}
          disabled={loadingPdf || loadingDocx}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.6rem 1.25rem",
            background: "var(--surface)",
            color: "var(--primary, #173F35)",
            border: "1.5px solid var(--border, #d6e0dc)",
            borderRadius: "0.625rem",
            fontWeight: 600,
            fontSize: "0.875rem",
            cursor: loadingPdf || loadingDocx ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            opacity: loadingPdf || loadingDocx ? 0.6 : 1,
          }}
        >
          {loadingDocx ? (
            <>
              <span style={{
                display: "inline-block",
                width: "14px",
                height: "14px",
                border: "2px solid rgba(23,63,53,0.2)",
                borderTopColor: "var(--primary, #173F35)",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }} />
              Génération Word…
            </>
          ) : (
            <>
              <span style={{ fontSize: "1rem" }}>📝</span>
              Télécharger Word
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          marginTop: "0.75rem",
          padding: "0.625rem 0.875rem",
          background: "rgba(220,38,38,0.08)",
          border: "1px solid rgba(220,38,38,0.2)",
          borderRadius: "0.5rem",
          color: "#dc2626",
          fontSize: "0.8rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}>
          <span>⚠️</span>
          {error}
        </div>
      )}

      {/* Spinner keyframe inline */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
