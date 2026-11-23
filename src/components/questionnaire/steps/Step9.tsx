"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import type { Step9Data } from "@/lib/schemas";

type Props = {
  defaultValues?: Partial<Step9Data>;
  onChange: (data: Step9Data) => void;
  onValidChange?: (valid: boolean) => void;
};

function MoneyInput({ label, name, register, placeholder, hint }: {
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
          {...(register as (n: string, o?: object) => object)(name, { valueAsNumber: true, min: 0 })}
          placeholder={placeholder ?? "0"}
          min={0}
          step={500}
          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-7 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition"
        />
      </div>
    </div>
  );
}

export default function Step9({ defaultValues, onChange, onValidChange }: Props) {
  const { register, watch, control, formState: { isValid } } = useForm<Step9Data>({
    defaultValues: { products: [], ...defaultValues },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({ control, name: "products" });
  const values = watch();

  useEffect(() => { onChange(values as Step9Data); }, [JSON.stringify(values)]);
  useEffect(() => { onValidChange?.(isValid); }, [isValid]);

  // Calculs automatiques
  const revenue1 = values.revenueYear1 || 0;
  const revenue2 = values.revenueYear2 || 0;
  const revenue3 = values.revenueYear3 || 0;
  const totalExpenses = (values.variableCosts || 0) + (values.fixedCosts || 0) + (values.salariesTotal || 0) +
    (values.rent || 0) + (values.insurance || 0) + (values.marketingBudget || 0) + (values.adminFees || 0);
  const grossMargin1 = revenue1 - totalExpenses;

  // Revenu depuis les produits
  const productsRevenue = (values.products || []).reduce((sum, p) => sum + (p.price || 0) * (p.volume || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Prévisions financières</h2>
        <p className="text-sm text-slate-400">Estimez vos revenus et dépenses sur 3 ans. Les hypothèses doivent être clairement identifiées.</p>
        <div className="mt-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 text-xs text-amber-400">
          ⚠ Les chiffres manquants ne seront pas inventés par l'IA. Indiquez vos hypothèses de base, même approximatives.
        </div>
      </div>

      {/* Chiffre d'affaires prévisionnel */}
      <div>
        <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wide mb-3">📈 Chiffre d'affaires prévisionnel</h3>
        <div className="grid grid-cols-3 gap-4">
          <MoneyInput label="An 1" name="revenueYear1" register={register} placeholder="150000" />
          <MoneyInput label="An 2" name="revenueYear2" register={register} placeholder="300000" />
          <MoneyInput label="An 3" name="revenueYear3" register={register} placeholder="500000" />
        </div>
      </div>

      {/* Produits/services détaillés */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wide">🛍 Produits / Services</h3>
          <button
            type="button"
            onClick={() => append({ name: "", price: 0, volume: 0 })}
            className="text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/50 rounded-lg px-3 py-1.5 transition"
          >
            + Ajouter
          </button>
        </div>

        {fields.length === 0 && (
          <p className="text-xs text-slate-500 text-center py-4 border border-dashed border-slate-700 rounded-lg">
            Ajoutez vos produits ou services pour calculer automatiquement les revenus
          </p>
        )}

        {fields.map((f, i) => (
          <div key={f.id} className="grid grid-cols-12 gap-2 mb-2 items-end">
            <div className="col-span-5">
              {i === 0 && <label className="block text-xs text-slate-400 mb-1">Produit / Service</label>}
              <input
                {...register(`products.${i}.name`)}
                placeholder="Ex. : Repas livré"
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
            <div className="col-span-3">
              {i === 0 && <label className="block text-xs text-slate-400 mb-1">Prix ($)</label>}
              <input
                type="number"
                {...register(`products.${i}.price`, { valueAsNumber: true, min: 0 })}
                placeholder="22"
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
            <div className="col-span-3">
              {i === 0 && <label className="block text-xs text-slate-400 mb-1">Volume/an</label>}
              <input
                type="number"
                {...register(`products.${i}.volume`, { valueAsNumber: true, min: 0 })}
                placeholder="5000"
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
            <div className="col-span-1">
              {i === 0 && <div className="mb-1 h-4" />}
              <button type="button" onClick={() => remove(i)}
                className="w-full h-9 flex items-center justify-center text-slate-500 hover:text-red-400 transition rounded-lg hover:bg-red-500/10"
              >×</button>
            </div>
          </div>
        ))}

        {productsRevenue > 0 && (
          <div className="mt-2 text-right text-xs text-slate-400">
            Revenu calculé : <span className="text-emerald-400 font-semibold">{productsRevenue.toLocaleString("fr-CA")} $/an</span>
          </div>
        )}
      </div>

      {/* Dépenses */}
      <div>
        <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wide mb-3">💸 Dépenses annuelles (An 1)</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <MoneyInput label="Coûts variables" name="variableCosts" register={register} hint="Matières premières, coût de livraison..." />
          <MoneyInput label="Dépenses fixes" name="fixedCosts" register={register} hint="Charges récurrentes incompressibles" />
          <MoneyInput label="Salaires totaux" name="salariesTotal" register={register} />
          <MoneyInput label="Loyer" name="rent" register={register} />
          <MoneyInput label="Assurances" name="insurance" register={register} />
          <MoneyInput label="Budget marketing" name="marketingBudget" register={register} />
          <MoneyInput label="Frais administratifs" name="adminFees" register={register} hint="Comptabilité, logiciels, fournitures..." />
          <MoneyInput label="Investissements" name="investments" register={register} hint="Achats d'équipements, R&D..." />
          <MoneyInput label="Besoin de trésorerie" name="cashNeeds" register={register} hint="Réserve de liquidités nécessaire" />
        </div>

        {totalExpenses > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
              <div className="text-xs text-slate-400">Total dépenses (An 1)</div>
              <div className="text-lg font-bold text-red-400">{totalExpenses.toLocaleString("fr-CA")} $</div>
            </div>
            <div className={`border rounded-xl p-3 ${grossMargin1 >= 0 ? "bg-emerald-500/10 border-emerald-500/30" : "bg-red-500/10 border-red-500/30"}`}>
              <div className="text-xs text-slate-400">Résultat An 1 (estimé)</div>
              <div className={`text-lg font-bold ${grossMargin1 >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {grossMargin1 >= 0 ? "+" : ""}{grossMargin1.toLocaleString("fr-CA")} $
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hypothèses */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Hypothèses et notes <span className="text-slate-500 font-normal">(optionnel)</span>
        </label>
        <p className="text-xs text-amber-400/80 mb-1">Expliquez comment vous avez estimé ces chiffres. L'IA utilisera ces hypothèses dans le plan.</p>
        <textarea {...register("assumptions")} rows={4}
          placeholder="Ex. : CA An 1 basé sur 150 commandes/sem × 22$/commande × 52 sem. Croissance de 100% An 2 basée sur expansion géographique à Montréal-Nord. Coûts variables = 40% du CA (benchmark industrie)..."
          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition resize-none"
        />
      </div>
    </div>
  );
}
