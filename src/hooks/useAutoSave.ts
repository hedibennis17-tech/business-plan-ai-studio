/**
 * Phase 3 — Hook sauvegarde automatique
 * Debounce 2s puis PATCH /api/plans/[id]/step
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useAutoSave(planId: string, step: number, delay = 2000) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestDataRef = useRef<unknown>(null);

  const save = useCallback(
    async (data: unknown) => {
      setSaveStatus("saving");
      try {
        const res = await fetch(`/api/plans/${planId}/step`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ step, data }),
        });

        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          console.error("[autoSave] Error:", json.error);
          setSaveStatus("error");
          return false;
        }

        setSaveStatus("saved");
        // Revenir à idle après 2.5s
        setTimeout(() => setSaveStatus("idle"), 2500);
        return true;
      } catch (err) {
        console.error("[autoSave] Network error:", err);
        setSaveStatus("error");
        return false;
      }
    },
    [planId, step]
  );

  const scheduleSave = useCallback(
    (data: unknown) => {
      latestDataRef.current = data;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        save(latestDataRef.current);
      }, delay);
    },
    [save, delay]
  );

  // Flush immédiat (avant navigation)
  const flushSave = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (latestDataRef.current !== null) {
      return save(latestDataRef.current);
    }
    return true;
  }, [save]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { scheduleSave, flushSave, saveStatus };
}
