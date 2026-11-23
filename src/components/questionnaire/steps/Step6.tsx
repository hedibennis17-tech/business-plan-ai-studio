"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Step6Data } from "@/lib/schemas";

type Props = {
  defaultValues?: Partial<Step6Data>;
  onChange: (data: Step6Data) => void;
  onValidChange?: (valid: boolean) => void;
};

export default function Step6({ defaultValues, onChange, onValidChange }: Props) {
  const { register, watch, formState: { isValid } } = useForm<Step6Data>({ defaultValues, mode: "onChange" });
  const values = watch();
  useEffect(() => { onChange(values as Step6Data); }, [JSON.stringify(values)]);
  useEffect(() => { onValidChange?.(isValid); }, [isValid]);

  const field = (name: keyof Step6Data, label: string, placeholder: string, rows = 3) => (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1">
        {label} <span className="text-slate-500 font-normal">(optionnel)</span>
      </label>
      <textarea {...register(name)} rows={rows} placeholder={placeholder}
        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition resize-none"
      />
    </div>
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Marketing et ventes</h2>
        <p className="text-sm text-slate-400">Comment allez-vous attirer et fidéliser vos clients ?</p>
      </div>

      {field("commercializationStrategy", "Stratégie de commercialisation", "Ex. : Lancement avec phase bêta gratuite pour 50 clients, puis abonnement mensuel + ventes à l'unité...")}
      {field("salesChannels", "Canaux de vente", "Ex. : Application mobile (iOS/Android), site web, partenariats avec entreprises locales...", 2)}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {field("digitalMarketing", "Marketing numérique", "Ex. : Instagram, TikTok, Google Ads ciblés (Laval, Montréal-Nord), SEO local, email marketing...")}
        {field("advertising", "Publicité", "Ex. : Flyers dans gyms et bureaux, publicité radio locale, commandites d'événements sportifs...")}
        {field("partnerships", "Partenariats", "Ex. : Restaurants certifiés santé, entreprises pour programmes d'avantages employés, cliniques sportives...")}
        {field("pricingPolicy", "Politique tarifaire", "Ex. : Repas 15–28$, abonnement mensuel 99$ (10% de rabais), frais de livraison offerts dès 25$...")}
      </div>

      {field("salesForecast", "Prévisions de ventes", "Ex. : Mois 1 : 50 commandes/sem, Mois 6 : 200 commandes/sem, An 1 : 150 000$ de CA...", 2)}
      {field("acquisitionStrategy", "Stratégie d'acquisition clients", "Ex. : Referral program (20$ crédit pour chaque ami invité), partenariat avec influenceurs santé locaux, période d'essai gratuite...")}
    </div>
  );
}
