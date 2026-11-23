"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Step5Data } from "@/lib/schemas";

type Props = {
  defaultValues?: Partial<Step5Data>;
  onChange: (data: Step5Data) => void;
  onValidChange?: (valid: boolean) => void;
};

export default function Step5({ defaultValues, onChange, onValidChange }: Props) {
  const { register, watch, formState: { errors, isValid } } = useForm<Step5Data>({
    defaultValues,
    mode: "onChange",
  });

  const values = watch();
  useEffect(() => { onChange(values as Step5Data); }, [JSON.stringify(values)]);
  useEffect(() => { onValidChange?.(isValid); }, [isValid]);

  const textArea = (name: keyof Step5Data, label: string, placeholder: string, required = false) => (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1">
        {label} {required ? <span className="text-red-400">*</span> : <span className="text-slate-500 font-normal">(optionnel)</span>}
      </label>
      <textarea
        {...register(name, required ? { required: "Requis", minLength: { value: 10, message: "Min. 10 caractères" } } : {})}
        rows={3}
        placeholder={placeholder}
        className={`w-full bg-slate-700/50 border rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition resize-none
          ${(errors[name] as { message?: string })?.message ? "border-red-500" : "border-slate-600"}`}
      />
      {(errors[name] as { message?: string })?.message && (
        <p className="mt-1 text-xs text-red-400">{(errors[name] as { message?: string }).message}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Concurrence et positionnement</h2>
        <p className="text-sm text-slate-400">Analysez vos concurrents et expliquez comment vous vous positionnez par rapport à eux.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {textArea("directCompetitors", "Concurrents directs", "Ex. : Uber Eats, DoorDash — livraison rapide dans la région de Laval. Part de marché estimée : 35%...")}
        {textArea("indirectCompetitors", "Concurrents indirects", "Ex. : Supermarchés avec rayons traiteur, cuisines fantômes, services de boîtes repas (Goodfood)...")}
        {textArea("competitorProducts", "Produits / services concurrents", "Ex. : Uber Eats offre livraison en 30 min, large choix, mais pas de focus santé ni de produits locaux...")}
        {textArea("priceComparison", "Comparaison des prix", "Ex. : Concurrents : 12–25$ + frais livraison. Notre positionnement : 15–28$ tout inclus...")}
        {textArea("strengths", "Nos forces vs la concurrence", "Ex. : Service personnalisé, partenaires locaux certifiés, livraison garantie, meilleur rapport qualité-prix santé...")}
        {textArea("weaknesses", "Nos faiblesses vs la concurrence", "Ex. : Notoriété encore faible, flotte de livraison limitée au départ, budget marketing inférieur...")}
      </div>

      {textArea("differentiation", "Notre différenciation", "Ex. : Nous sommes le seul service de livraison 100% local et santé certifié au Québec, avec garantie remboursement 30 min. Notre app intègre les informations nutritionnelles complètes...", true)}
    </div>
  );
}
