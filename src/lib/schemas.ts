/**
 * Business Plan AI Studio — Schémas de validation Zod (v4)
 * Phase 2.6 : Auth | Phase 3 : Questionnaire 10 étapes
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
    .max(128, "Mot de passe trop long"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export function formatZodError(error: z.ZodError): string {
  const firstIssue = error.issues[0]; // v4 : .issues (pas .errors)
  return firstIssue?.message ?? "Données invalides";
}

// ─── Phase 3 — Questionnaire 10 étapes ─────────────────────────────────────

// Étape 1 — Profil de l'entreprise
export const step1Schema = z.object({
  companyName: z
    .string()
    .trim()
    .min(1, "Le nom de l'entreprise est requis")
    .max(200, "Nom trop long"),
  sector: z
    .string()
    .trim()
    .min(1, "Le secteur d'activité est requis")
    .max(200, "Secteur trop long"),
  legalForm: z
    .string()
    .trim()
    .min(1, "La forme juridique est requise")
    .max(100, "Forme juridique trop longue"),
  province: z
    .string()
    .trim()
    .min(1, "La province est requise")
    .max(100),
  city: z
    .string()
    .trim()
    .min(1, "La ville est requise")
    .max(100),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  launchDate: z.string().trim().max(50).optional().or(z.literal("")),
  isExisting: z.boolean(),
  website: z
    .string()
    .trim()
    .max(300)
    .optional()
    .or(z.literal("")),
});

// Étape 2 — Présentation du projet
export const step2Schema = z.object({
  description: z
    .string()
    .trim()
    .min(10, "La description doit contenir au moins 10 caractères")
    .max(2000),
  problem: z.string().trim().min(10, "Décrivez le problème (min. 10 caractères)").max(1000),
  solution: z.string().trim().min(10, "Décrivez la solution (min. 10 caractères)").max(1000),
  mission: z.string().trim().max(500).optional().or(z.literal("")),
  vision: z.string().trim().max(500).optional().or(z.literal("")),
  shortTermGoals: z.string().trim().max(1000).optional().or(z.literal("")),
  mediumTermGoals: z.string().trim().max(1000).optional().or(z.literal("")),
  longTermGoals: z.string().trim().max(1000).optional().or(z.literal("")),
  valueProposition: z
    .string()
    .trim()
    .min(10, "La proposition de valeur est requise (min. 10 caractères)")
    .max(1000),
  competitiveAdvantage: z.string().trim().max(1000).optional().or(z.literal("")),
});

// Étape 3 — Analyse du marché
export const step3Schema = z.object({
  industry: z.string().trim().min(1, "L'industrie est requise").max(200),
  marketSize: z.string().trim().max(500).optional().or(z.literal("")),
  marketPotential: z.string().trim().max(500).optional().or(z.literal("")),
  trends: z.string().trim().max(1000).optional().or(z.literal("")),
  estimatedDemand: z.string().trim().max(500).optional().or(z.literal("")),
  opportunities: z.string().trim().max(1000).optional().or(z.literal("")),
  risks: z.string().trim().max(1000).optional().or(z.literal("")),
  sources: z.string().trim().max(500).optional().or(z.literal("")),
});

// Étape 4 — Clientèle cible
export const step4Schema = z.object({
  clientType: z.enum(["B2C", "B2B", "B2B2C", "mixte"], {
    error: "Type de client invalide",
  }),
  clientProfile: z.string().trim().min(10, "Décrivez votre clientèle (min. 10 caractères)").max(1000),
  geographicZone: z.string().trim().min(1, "La zone géographique est requise").max(300),
  needs: z.string().trim().max(1000).optional().or(z.literal("")),
  behaviors: z.string().trim().max(1000).optional().or(z.literal("")),
  segments: z.string().trim().max(1000).optional().or(z.literal("")),
  existingClients: z.boolean(),
});

// Étape 5 — Concurrence et positionnement
export const step5Schema = z.object({
  directCompetitors: z.string().trim().max(1000).optional().or(z.literal("")),
  indirectCompetitors: z.string().trim().max(1000).optional().or(z.literal("")),
  competitorProducts: z.string().trim().max(1000).optional().or(z.literal("")),
  priceComparison: z.string().trim().max(500).optional().or(z.literal("")),
  strengths: z.string().trim().max(1000).optional().or(z.literal("")),
  weaknesses: z.string().trim().max(1000).optional().or(z.literal("")),
  differentiation: z
    .string()
    .trim()
    .min(10, "Décrivez votre différenciation (min. 10 caractères)")
    .max(1000),
});

// Étape 6 — Marketing et ventes
export const step6Schema = z.object({
  commercializationStrategy: z.string().trim().max(1000).optional().or(z.literal("")),
  salesChannels: z.string().trim().max(500).optional().or(z.literal("")),
  digitalMarketing: z.string().trim().max(1000).optional().or(z.literal("")),
  advertising: z.string().trim().max(500).optional().or(z.literal("")),
  partnerships: z.string().trim().max(500).optional().or(z.literal("")),
  pricingPolicy: z.string().trim().max(500).optional().or(z.literal("")),
  salesForecast: z.string().trim().max(500).optional().or(z.literal("")),
  acquisitionStrategy: z.string().trim().max(1000).optional().or(z.literal("")),
});

// Étape 7 — Plan opérationnel et RH
export const step7Schema = z.object({
  dailyOperations: z.string().trim().max(1000).optional().or(z.literal("")),
  equipments: z.string().trim().max(1000).optional().or(z.literal("")),
  suppliers: z.string().trim().max(500).optional().or(z.literal("")),
  partners: z.string().trim().max(500).optional().or(z.literal("")),
  employeeCount: z.number().int().min(0).max(10000).optional(),
  functions: z.string().trim().max(1000).optional().or(z.literal("")),
  salaries: z.string().trim().max(500).optional().or(z.literal("")),
  processes: z.string().trim().max(1000).optional().or(z.literal("")),
});

// Étape 8 — Investissements et financement
export const step8Schema = z.object({
  initialInvestment: z.number().min(0).optional(),
  equipmentCosts: z.number().min(0).optional(),
  startupFees: z.number().min(0).optional(),
  workingCapital: z.number().min(0).optional(),
  personalFunding: z.number().min(0).optional(),
  loans: z.string().trim().max(500).optional().or(z.literal("")),
  grants: z.string().trim().max(500).optional().or(z.literal("")),
  investors: z.string().trim().max(500).optional().or(z.literal("")),
  amountSought: z.number().min(0).optional(),
  confirmedFunding: z.string().trim().max(500).optional().or(z.literal("")),
  plannedFunding: z.string().trim().max(500).optional().or(z.literal("")),
});

// Étape 9 — Prévisions financières
export const step9Schema = z.object({
  revenueYear1: z.number().min(0).optional(),
  revenueYear2: z.number().min(0).optional(),
  revenueYear3: z.number().min(0).optional(),
  products: z
    .array(
      z.object({
        name: z.string().trim().max(200),
        price: z.number().min(0),
        volume: z.number().int().min(0),
      })
    )
    .max(20)
    .optional(),
  variableCosts: z.number().min(0).optional(),
  fixedCosts: z.number().min(0).optional(),
  salariesTotal: z.number().min(0).optional(),
  rent: z.number().min(0).optional(),
  insurance: z.number().min(0).optional(),
  marketingBudget: z.number().min(0).optional(),
  adminFees: z.number().min(0).optional(),
  investments: z.number().min(0).optional(),
  cashNeeds: z.number().min(0).optional(),
  assumptions: z.string().trim().max(2000).optional().or(z.literal("")),
});

// Étape 10 — Validation et finalisation
export const step10Schema = z.object({
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  confirmed: z.boolean(),
});

// Map stepNumber → schema
export const stepSchemas = {
  1: step1Schema,
  2: step2Schema,
  3: step3Schema,
  4: step4Schema,
  5: step5Schema,
  6: step6Schema,
  7: step7Schema,
  8: step8Schema,
  9: step9Schema,
  10: step10Schema,
} as const;

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Step4Data = z.infer<typeof step4Schema>;
export type Step5Data = z.infer<typeof step5Schema>;
export type Step6Data = z.infer<typeof step6Schema>;
export type Step7Data = z.infer<typeof step7Schema>;
export type Step8Data = z.infer<typeof step8Schema>;
export type Step9Data = z.infer<typeof step9Schema>;
export type Step10Data = z.infer<typeof step10Schema>;
