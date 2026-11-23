/**
 * Phase 2.6 — Schémas de validation Zod (v4)
 * Validation côté serveur pour toutes les entrées utilisateur.
 * Ne jamais considérer la validation frontend comme suffisante.
 */

import { z } from "zod";

// ─── Authentification ───────────────────────────────────────────────────────

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .regex(/^[\p{L}\p{M}\s'\-\.]+$/u, "Le nom contient des caractères invalides"),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Adresse courriel invalide")
    .max(254, "Adresse courriel trop longue"),

  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(128, "Le mot de passe ne peut pas dépasser 128 caractères")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre"
    ),

  phone: z
    .string()
    .trim()
    .max(20, "Numéro de téléphone trop long")
    .regex(/^[\d\s\-\+\(\)\.]*$/, "Numéro de téléphone invalide")
    .optional()
    .or(z.literal("")),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Adresse courriel invalide")
    .max(254, "Adresse courriel trop longue"),

  password: z
    .string()
    .min(1, "Le mot de passe est requis")
    .max(128, "Mot de passe invalide"),
});

// ─── Types inférés ──────────────────────────────────────────────────────────

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// ─── Helper pour formater les erreurs Zod (v4 : .issues au lieu de .errors) ─

export function formatZodError(error: z.ZodError): string {
  const firstIssue = error.issues[0];
  return firstIssue?.message ?? "Données invalides";
}
