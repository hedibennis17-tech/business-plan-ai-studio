"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Step8Data } from "@/lib/schemas";

type Props = {
  defaultValues?: Partial<Step8Data>;
  onChange: (data: Step8Data) => void;
  onValidChange?: (valid: boolean) => void;
};

function MoneyInput({
  label, name, register, placeholder, hint
}: {
  label: string; name: string; register: ReturnType<typeof useForm>["register"];
  placeholder?: string; hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1">
        {label} <span className="text-slate-500 font-normal">(optionnel)</span>
      </label>
      {hint && <p className="text-xs text-slate-500 mb-1">{hint}</p>}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
        <input
          type="number"
          {...(register as (name: string, opts?: object) => object)(name, { valueAsNumber: true, min: 0 })}
          placeholder={placeholder ?? "0"}
          min={0}
          step={100}
          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-7 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition"
        />
      </div>
    </div>
  );
}

export default function Step8({ defaultValues, onChange, onValidChange }: Props) {
  const { register, watch, formState: { isValid } } = useForm<Step8Data>({ defaultValues, mode: "onChange" });
  const values = watch();
  useEffect(() => { onChange(values as Step8Data); }, [JSON.stringify(values)]);
  useEffect(() => { onValidChange?.(isValid); }, [isValid]);

  // Calcul total investissement
  const total =
    (values.initialInvestment || 0) +
    (values.equipmentCosts || 0) +
    (values.startupFees || 0) +
    (values.workingCapital || 0);

  const totalFinancing =
    (values.personalFunding || 0) +
    (values.amountSought || 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Investissements et financement</h2>
        <p className="text-sm text-slate-400">Estimez vos besoins financiers de départ et vos sources de financement.</p>
      </div>

      {/* Besoins */}
      <div>
        <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wide mb-3">💸 Besoins de financement</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MoneyInput label="Investissement initial total" name="initialInvestment" register={register} placeholder="50000" hint="Montant global nécessaire pour lancer" />
          <MoneyInput label="Équipements" name="equipmentCosts" register={register} placeholder="15000" />
          <MoneyInput label="Frais de démarrage" name="startupFees" register={register} placeholder="5000" hint="Enregistrement, licences, frais légaux..." />
          <MoneyInput label="Fonds de roulement" name="workingCapital" register={register} placeholder="20000" hint="Trésorerie pour les 3–6 premiers mois" />
        </div>

        {total > 0 && (
          <div className="mt-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex justify-between items-center">
            <span className="text-sm text-slate-300">Total estimé des besoins</span>
            <span className="text-lg font-bold text-amber-400">{total.toLocaleString("fr-CA")} $</span>
          </div>
        )}
      </div>

      {/* Sources */}
      <div>
        <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wide mb-3">💰 Sources de financement</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MoneyInput label="Apport personnel" name="personalFunding" register={register} placeholder="20000" hint="Vos propres économies investies" />
          <MoneyInput label="Montant recherché" name="amountSought" register={register} placeholder="30000" hint="Ce que vous cherchez à obtenir" />
        </div>

        {totalFinancing > 0 && (
          <div className="mt-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex justify-between items-center">
            <span className="text-sm text-slate-300">Total financement estimé</span>
            <span className="text-lg font-bold text-emerald-400">{totalFinancing.toLocaleString("fr-CA")} $</span>
          </div>
        )}
      </div>

      {/* Détails textuels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Prêts envisagés <span className="text-slate-500 font-normal">(optionnel)</span>
          </label>
          <textarea {...register("loans")} rows={2}
            placeholder="Ex. : Prêt BDC 25 000$ sur 5 ans, marge de crédit Desjardins 10 000$..."
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Subventions envisagées <span className="text-slate-500 font-normal">(optionnel)</span>
          </label>
          <textarea {...register("grants")} rows={2}
            placeholder="Ex. : Programme Démarrage Entreprise (MESI) 10 000$, subvention REQ 5 000$..."
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Investisseurs <span className="text-slate-500 font-normal">(optionnel)</span>
          </label>
          <textarea {...register("investors")} rows={2}
            placeholder="Ex. : Fonds d'investissement local (en discussion), investisseur providentiel (ami de la famille)..."
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Financements confirmés <span className="text-slate-500 font-normal">(optionnel)</span>
          </label>
          <textarea {...register("confirmedFunding")} rows={2}
            placeholder="Ex. : Apport personnel de 20 000$ (confirmé), prêt BDC de 15 000$ (approuvé)..."
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition resize-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Financements planifiés (non confirmés) <span className="text-slate-500 font-normal">(optionnel)</span>
        </label>
        <p className="text-xs text-amber-400/80 mb-1">⚠ Important : distinguez clairement le financement confirmé du financement envisagé.</p>
        <textarea {...register("plannedFunding")} rows={2}
          placeholder="Ex. : Subvention MESI (demande en cours), investisseur angélique (en négociation)..."
          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition resize-none"
        />
      </div>
    </div>
  );
}
