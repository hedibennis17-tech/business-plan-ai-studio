"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Plan = {
  id: string;
  title: string;
  status: string;
  currentStep: number;
  completedSteps: number[];
};

type Props = {
  existingPlan?: Plan | null;
};

export default function StartPlanButton({ existingPlan }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClick = async () => {
    setLoading(true);
    setError("");

    try {
      if (existingPlan) {
        router.push(`/questionnaire/${existingPlan.id}`);
        return;
      }

      // Créer un nouveau plan
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Mon plan d'affaires" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la création du plan");
      }

      const { plan } = await res.json();
      router.push(`/questionnaire/${plan.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
      setLoading(false);
    }
  };

  const label = existingPlan
    ? `Continuer l'étape ${existingPlan.currentStep}`
    : "Commencer mon plan";

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          background: "var(--qc-blue)",
          color: "white",
          padding: "0.75rem 1.5rem",
          borderRadius: "0.625rem",
          fontWeight: 700,
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: "0.9rem",
          boxShadow: "0 4px 14px rgba(0,61,165,0.25)",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.375rem",
          opacity: loading ? 0.7 : 1,
          transition: "opacity 0.2s",
        }}
      >
        {loading ? "Chargement..." : <>{label} <span>→</span></>}
      </button>
      {error && (
        <p style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "0.5rem" }}>{error}</p>
      )}
    </div>
  );
}
