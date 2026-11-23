"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Step4Data } from "@/lib/schemas";

type Props = {
  defaultValues?: Partial<Step4Data>;
  onChange: (data: Step4Data) => void;
  onValidChange?: (valid: boolean) => void;
};

const CLIENT_TYPES = [
  { value: "B2C", label: "B2C", desc: "Particuliers / Consommateurs" },
  { value: "B2B", label: "B2B", desc: "Entreprises / Organisations" },
  { value: "B2B2C", label: "B2B2C", desc: "Entreprises + Consommateurs finaux" },
  { value: "mixte", label: "Mixte", desc: "Combinaison B2C et B2B" },
];

export default function Step4({ defaultValues, onChange, onValidChange }: Props) {
  const { register, watch, setValue, formState: { errors, isValid } } = useForm<Step4Data>({
    defaultValues: { existingClients: false, clientType: "B2C", ...defaultValues },
    mode: "onChange",
  });

  const values = watch();
  useEffect(() => { onChange(values as Step4Data); }, [JSON.stringify(values)]);
  useEffect(() => { onValidChange?.(isValid); }, [isValid]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Clientèle cible</h2>
        <p className="text-sm text-gray-500">Définissez précisément vos clients idéaux. Plus vous êtes précis, plus votre plan sera crédible.</p>
      </div>

      {/* Type de client */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Type de clientèle <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CLIENT_TYPES.map(({ value, label, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue("clientType", value as Step4Data["clientType"], { shouldValidate: true })}
              className={`border-2 rounded-xl p-3 text-left transition
                ${watch("clientType") === value
                  ? "border-amber-500 bg-amber-500/10"
                  : "border-gray-300 hover:border-gray-300"
                }`}
            >
              <div className="text-sm font-bold text-gray-900">{label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Profil client */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Profil des clients <span className="text-red-400">*</span>
        </label>
        <p className="text-xs text-gray-400 mb-1">
          {watch("clientType") === "B2C"
            ? "Âge, sexe, revenus, style de vie, habitudes..."
            : "Taille d'entreprise, secteur, rôle décideur, budget..."}
        </p>
        <textarea
          {...register("clientProfile", { required: "Requis", minLength: { value: 10, message: "Min. 10 caractères" } })}
          rows={3}
          placeholder={
            watch("clientType") === "B2C"
              ? "Ex. : Travailleurs de 25–45 ans, revenus moyens à élevés, soucieux de leur santé, peu de temps pour cuisiner..."
              : "Ex. : PME de 10–50 employés dans le secteur des services professionnels, budget IT de 20 000$+/an..."
          }
          className={`w-full bg-white border rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700/30 transition resize-none
            ${errors.clientProfile ? "border-red-500" : "border-gray-300"}`}
        />
        {errors.clientProfile && <p className="mt-1 text-xs text-red-400">{errors.clientProfile.message}</p>}
      </div>

      {/* Zone géographique */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Zone géographique <span className="text-red-400">*</span>
        </label>
        <input
          {...register("geographicZone", { required: "Requis" })}
          placeholder="Ex. : Grand Montréal, Province de Québec, Canada et USA, International..."
          className={`w-full bg-white border rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700/30 transition
            ${errors.geographicZone ? "border-red-500" : "border-gray-300"}`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Besoins <span className="text-gray-400 font-normal">(optionnel)</span></label>
          <textarea
            {...register("needs")}
            rows={3}
            placeholder="Quels problèmes veulent-ils résoudre ? Quels désirs cherchent-ils à satisfaire ?"
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700/30 transition resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Comportements <span className="text-gray-400 font-normal">(optionnel)</span></label>
          <textarea
            {...register("behaviors")}
            rows={3}
            placeholder="Comment achètent-ils ? Où ? À quelle fréquence ? Par quels canaux ?"
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700/30 transition resize-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Segments de clientèle <span className="text-gray-400 font-normal">(optionnel)</span></label>
        <textarea
          {...register("segments")}
          rows={2}
          placeholder="Ex. : Segment 1 — Familles avec enfants (40%), Segment 2 — Jeunes professionnels (60%)..."
          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700/30 transition resize-none"
        />
      </div>

      {/* Clientèle existante */}
      <div className="flex items-center gap-3 bg-gray-100/30 rounded-xl p-4 border border-gray-200">
        <input
          type="checkbox"
          {...register("existingClients")}
          id="existingClients"
          className="w-5 h-5 rounded accent-amber-500"
        />
        <label htmlFor="existingClients" className="text-sm text-gray-700 cursor-pointer">
          J'ai déjà des clients ou des clients potentiels identifiés (prospects, lettres d'intention, pré-ventes...)
        </label>
      </div>
    </div>
  );
}
