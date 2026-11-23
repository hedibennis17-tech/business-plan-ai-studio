"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Step3Data } from "@/lib/schemas";

type Props = {
  defaultValues?: Partial<Step3Data>;
  onChange: (data: Step3Data) => void;
  onValidChange?: (valid: boolean) => void;
};

export default function Step3({ defaultValues, onChange, onValidChange }: Props) {
  const { register, watch, formState: { errors, isValid } } = useForm<Step3Data>({
    defaultValues,
    mode: "onChange",
  });

  const values = watch();
  useEffect(() => { onChange(values as Step3Data); }, [JSON.stringify(values)]);
  useEffect(() => { onValidChange?.(isValid); }, [isValid]);

  const field = (name: string, label: string, placeholder: string, required = false, hint?: string) => (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1">
        {label} {required ? <span className="text-red-400">*</span> : <span className="text-slate-500 font-normal">(optionnel)</span>}
      </label>
      {hint && <p className="text-xs text-slate-500 mb-1">{hint}</p>}
      <textarea
        {...register(name as keyof Step3Data)}
        rows={3}
        placeholder={placeholder}
        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition resize-none"
      />
    </div>
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Analyse du marché</h2>
        <p className="text-sm text-slate-400">Décrivez le marché dans lequel vous évoluez. Soyez précis — ces données seront au cœur de votre plan d'affaires.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Industrie / Secteur <span className="text-red-400">*</span>
        </label>
        <input
          {...register("industry", { required: "Requis" })}
          placeholder="Ex. : Restauration rapide santé, Logiciels SaaS B2B, Commerce en ligne de vêtements..."
          className={`w-full bg-slate-700/50 border rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition
            ${errors.industry ? "border-red-500" : "border-slate-600"}`}
        />
        {errors.industry && <p className="mt-1 text-xs text-red-400">{errors.industry.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {field("marketSize", "Taille du marché", "Ex. : Le marché de la livraison alimentaire au Canada est estimé à 8 milliards$ en 2024...", false, "En valeur ($) ou en nombre de clients potentiels")}
        {field("marketPotential", "Potentiel de croissance", "Ex. : Croissance annuelle de 12% prévue jusqu'en 2027, portée par...", false)}
        {field("estimatedDemand", "Demande estimée", "Ex. : On estime 50 000 travailleurs dans notre zone cible cherchant des repas sains à emporter...", false)}
        {field("sources", "Sources et hypothèses", "Ex. : Statistiques Canada 2023, Rapport Deloitte 2024, sondage terrain de 50 personnes...", false, "Citez vos sources ou expliquez comment vous avez estimé ces chiffres")}
      </div>

      {field("trends", "Tendances du marché", "Ex. : Montée en puissance de la livraison sans contact, préférence pour les produits locaux, essor du télétravail...", false)}
      {field("opportunities", "Opportunités identifiées", "Ex. : Pas de concurrent direct dans le segment santé à Laval, subventions gouvernementales disponibles...", false)}
      {field("risks", "Risques du marché", "Ex. : Hausse des coûts de livraison, entrée de grands acteurs comme Uber Eats, ralentissement économique...", false)}
    </div>
  );
}
