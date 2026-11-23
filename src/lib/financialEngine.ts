/**
 * Phase 4 — Moteur financier déterministe
 * Les calculs financiers ne sont PAS délégués à Claude.
 * Toutes les formules sont vérifiables et reproductibles.
 */

import type { Step8Data, Step9Data } from "./schemas";

export interface FinancialYear {
  year: number;
  label: string;
  revenue: number;
  variableCosts: number;
  grossMargin: number;
  grossMarginPct: number;
  fixedCosts: number;
  salaries: number;
  rent: number;
  insurance: number;
  marketing: number;
  admin: number;
  totalOperatingExpenses: number;
  ebitda: number;
  ebitdaPct: number;
  depreciation: number; // hypothèse 10 % des investissements initiaux / 3 ans
  ebit: number;
  netResult: number; // avant impôts (taux d'imposition à préciser par l'entrepreneur)
}

export interface BreakevenAnalysis {
  fixedCostTotal: number;
  contributionMarginPct: number; // (revenue - variableCosts) / revenue
  breakevenRevenue: number;
  breakevenMonths: number;
  safetyMarginYear1: number; // revenue année 1 - seuil
}

export interface FundingNeed {
  initialInvestment: number;
  workingCapitalNeeded: number;
  personalFunding: number;
  confirmedLoans: number;
  confirmedGrants: number;
  confirmedInvestors: number;
  totalConfirmedFunding: number;
  fundingGap: number; // si positif, il manque de l'argent
}

export interface FinancialReport {
  assumptions: FinancialAssumptions;
  years: FinancialYear[];
  breakeven: BreakevenAnalysis;
  funding: FundingNeed;
  warnings: string[];
  flags: string[]; // données incohérentes
}

export interface FinancialAssumptions {
  revenueGrowthRate: number; // % croissance Y2/Y3 si non fourni
  variableCostRate: number; // % du CA
  taxNote: string; // jamais inventé, toujours une note
  depreciationRate: number; // %
  inflationRate: number; // hypothèse opérations
}

/** Arrondit à 2 décimales pour éviter les flottants */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Calcule les prévisions financières sur 3 ans à partir des données
 * du questionnaire. Ne jamais inventer de taux d'imposition.
 */
export function computeFinancials(
  step8: Partial<Step8Data>,
  step9: Partial<Step9Data>
): FinancialReport {
  const warnings: string[] = [];
  const flags: string[] = [];

  // ── Revenus ──────────────────────────────────────────────────────────────
  const revY1 = step9.revenueYear1 ?? 0;
  const revY2 = step9.revenueYear2 ?? 0;
  const revY3 = step9.revenueYear3 ?? 0;

  if (revY1 === 0) warnings.push("Aucun chiffre d'affaires année 1 fourni.");
  if (revY2 > 0 && revY2 < revY1) flags.push("CA année 2 inférieur à l'année 1 — vérifier la cohérence.");
  if (revY3 > 0 && revY3 < revY2) flags.push("CA année 3 inférieur à l'année 2 — vérifier la cohérence.");

  // Estimer Y2/Y3 si absent (croissance 20 % par défaut — hypothèse à valider)
  const growthNote = "Croissance estimée à 20 %/an (hypothèse par défaut, à valider par l'entrepreneur).";
  let estimatedY2 = revY2;
  let estimatedY3 = revY3;
  const isY2Estimated = revY2 === 0 && revY1 > 0;
  const isY3Estimated = revY3 === 0 && revY1 > 0;

  if (isY2Estimated) { estimatedY2 = round2(revY1 * 1.2); warnings.push(growthNote); }
  if (isY3Estimated) { estimatedY3 = round2((estimatedY2 || revY1) * 1.2); }

  // ── Coûts variables ───────────────────────────────────────────────────────
  const varCosts = step9.variableCosts ?? 0;
  const varCostRate = revY1 > 0 ? varCosts / revY1 : 0;
  if (varCostRate > 0.9) flags.push("Coûts variables > 90 % du CA en Y1 — marges très faibles.");

  // ── Charges fixes annuelles ───────────────────────────────────────────────
  const salaries = step9.salariesTotal ?? 0;
  const rent = step9.rent ?? 0;
  const insurance = step9.insurance ?? 0;
  const marketing = step9.marketingBudget ?? 0;
  const admin = step9.adminFees ?? 0;
  const otherFixed = step9.fixedCosts ?? 0;

  if (salaries === 0) warnings.push("Masse salariale non renseignée — charges opérationnelles incomplètes.");

  // ── Investissements (pour amortissement) ─────────────────────────────────
  const initInvestment = (() => {
    const v = step8.initialInvestment;
    if (typeof v === "string") return parseFloat(v) || 0;
    return (v as number) ?? 0;
  })();
  const depreciation = round2((initInvestment * 0.1) / 3); // ~3,3 %/an pendant 3 ans

  // ── Calcul par année ──────────────────────────────────────────────────────
  const revenues = [revY1, estimatedY2, estimatedY3];
  const years: FinancialYear[] = revenues.map((rev, i) => {
    const vc = round2(rev * varCostRate);
    const gm = round2(rev - vc);
    const gmPct = rev > 0 ? round2((gm / rev) * 100) : 0;
    const totalFixed = round2(salaries + rent + insurance + marketing + admin + otherFixed);
    const ebitda = round2(gm - totalFixed);
    const ebitdaPct = rev > 0 ? round2((ebitda / rev) * 100) : 0;
    const ebit = round2(ebitda - depreciation);
    return {
      year: i + 1,
      label: `Année ${i + 1}${i === 1 && isY2Estimated ? " (estimée)" : ""}${i === 2 && isY3Estimated ? " (estimée)" : ""}`,
      revenue: rev,
      variableCosts: vc,
      grossMargin: gm,
      grossMarginPct: gmPct,
      fixedCosts: otherFixed,
      salaries,
      rent,
      insurance,
      marketing,
      admin,
      totalOperatingExpenses: totalFixed,
      ebitda,
      ebitdaPct,
      depreciation,
      ebit,
      netResult: ebit, // avant impôts — taux à confirmer
    };
  });

  // ── Seuil de rentabilité (Année 1) ────────────────────────────────────────
  const fixedCostTotal = years[0].totalOperatingExpenses + depreciation;
  const contributionMarginPct = revY1 > 0
    ? round2(((revY1 - years[0].variableCosts) / revY1) * 100) / 100
    : 0;
  const breakevenRevenue = contributionMarginPct > 0
    ? round2(fixedCostTotal / contributionMarginPct)
    : 0;
  const breakevenMonths = breakevenRevenue > 0 && revY1 > 0
    ? round2((breakevenRevenue / revY1) * 12)
    : 0;
  const safetyMarginYear1 = round2(revY1 - breakevenRevenue);

  if (breakevenMonths > 12) flags.push("Le seuil de rentabilité dépasse 12 mois en Y1 — risque de trésorerie élevé.");

  // ── Besoin de financement ─────────────────────────────────────────────────
  const toNum = (v: unknown): number => {
    if (typeof v === "number") return v;
    if (typeof v === "string") return parseFloat(v) || 0;
    return 0;
  };

  const workingCapitalNeeded = toNum(step9.cashNeeds) || round2((years[0].totalOperatingExpenses) / 6);
  const personalFunding = toNum(step8.personalFunding);
  const confirmedLoans = toNum(step8.loans);
  const confirmedGrants = toNum(step8.grants);
  const confirmedInvestors = toNum(step8.investors);
  const totalConfirmedFunding = round2(personalFunding + confirmedLoans + confirmedGrants + confirmedInvestors);
  const totalNeeded = round2(initInvestment + workingCapitalNeeded);
  const fundingGap = round2(totalNeeded - totalConfirmedFunding);

  if (fundingGap > 0) warnings.push(`Besoin de financement non couvert : ${fundingGap.toLocaleString("fr-CA")} $ à trouver.`);

  const assumptions: FinancialAssumptions = {
    revenueGrowthRate: 20,
    variableCostRate: round2(varCostRate * 100),
    taxNote: "Résultat net avant impôts. Le taux d'imposition applicable dépend de la juridiction et de la structure juridique — à confirmer avec un comptable.",
    depreciationRate: 10,
    inflationRate: 2.5,
  };

  return {
    assumptions,
    years,
    breakeven: {
      fixedCostTotal,
      contributionMarginPct,
      breakevenRevenue,
      breakevenMonths,
      safetyMarginYear1,
    },
    funding: {
      initialInvestment: initInvestment,
      workingCapitalNeeded,
      personalFunding,
      confirmedLoans,
      confirmedGrants,
      confirmedInvestors,
      totalConfirmedFunding,
      fundingGap,
    },
    warnings,
    flags,
  };
}

/** Formate un montant en dollars canadiens */
export function formatCAD(n: number): string {
  return new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(n);
}
