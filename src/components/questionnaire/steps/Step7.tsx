"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Step7Data } from "@/lib/schemas";

type Props = {
  defaultValues?: Partial<Step7Data>;
  onChange: (data: Step7Data) => void;
  onValidChange?: (valid: boolean) => void;
};

export default function Step7({ defaultValues, onChange, onValidChange }: Props) {
  const { register, watch, formState: { isValid } } = useForm<Step7Data>({ defaultValues, mode: "onChange" });
  const values = watch();
  useEffect(() => { onChange(values as Step7Data); }, [JSON.stringify(values)]);
  useEffect(() => { onValidChange?.(isValid); }, [isValid]);

  const textarea = (name: keyof Step7Data, label: string, placeholder: string, rows = 3) => (
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
        <h2 className="text-xl font-semibold text-white mb-1">Plan opérationnel et ressources humaines</h2>
        <p className="text-sm text-slate-400">Comment votre entreprise fonctionnera-t-elle au quotidien ?</p>
      </div>

      {textarea("dailyOperations", "Fonctionnement quotidien", "Ex. : Réception des commandes via app → dispatch aux livreurs → livraison en 30 min → suivi client. Horaires : 10h–22h, 7j/7...")}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {textarea("equipments", "Équipements et infrastructures", "Ex. : Vélos électriques (×5), app mobile (iOS/Android), logiciel de dispatch, cuisine partagée...")}
        {textarea("suppliers", "Fournisseurs clés", "Ex. : 10 restaurants partenaires certifiés, fournisseur d'emballages biodégradables, prestataire app mobile...")}
        {textarea("partners", "Partenaires stratégiques", "Ex. : Ville de Laval (subvention mobilité verte), Desjardins (financement), Chambre de commerce...")}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Nombre d'employés <span className="text-slate-500 font-normal">(optionnel)</span>
          </label>
          <input
            type="number"
            {...register("employeeCount", { valueAsNumber: true, min: 0 })}
            placeholder="Ex. : 3"
            min={0}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition"
          />
        </div>
        <div className="md:col-span-2">
          {textarea("functions", "Fonctions et rôles", "Ex. : Fondateur/Gestionnaire (temps plein), 3 livreurs (temps partiel), 1 représentant commercial (temps partiel)...", 2)}
        </div>
      </div>

      {textarea("salaries", "Salaires et rémunération", "Ex. : Fondateur : 45 000$/an, Livreurs : 18$/h + pourboires, Commercial : 20$/h + commission 5%...", 2)}
      {textarea("processes", "Processus et organisation", "Ex. : Réunion hebdomadaire chaque lundi matin, rapport de performance quotidien, formation des livreurs à l'embauche...")}
    </div>
  );
}
