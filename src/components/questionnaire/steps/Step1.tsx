"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Step1Data } from "@/lib/schemas";

type Props = {
  defaultValues?: Partial<Step1Data>;
  onChange: (data: Step1Data) => void;
  onValidChange?: (valid: boolean) => void;
};

const LEGAL_FORMS = [
  "Entreprise individuelle",
  "Société en nom collectif (SENC)",
  "Société en commandite",
  "Société par actions (inc.)",
  "Coopérative",
  "OSBL / Organisme sans but lucratif",
  "Travailleur autonome",
  "Autre",
];

const PROVINCES = [
  "Québec", "Ontario", "Colombie-Britannique", "Alberta",
  "Manitoba", "Saskatchewan", "Nouvelle-Écosse", "Nouveau-Brunswick",
  "Terre-Neuve-et-Labrador", "Île-du-Prince-Édouard",
  "Territoires du Nord-Ouest", "Yukon", "Nunavut",
];

export default function Step1({ defaultValues, onChange, onValidChange }: Props) {
  const { register, watch, formState: { errors, isValid } } = useForm<Step1Data>({
    defaultValues: { isExisting: false, ...defaultValues },
    mode: "onChange",
  });

  const values = watch();

  useEffect(() => {
    onChange(values as Step1Data);
  }, [JSON.stringify(values)]);

  useEffect(() => {
    onValidChange?.(isValid);
  }, [isValid]);

  return (
    <div className="space-y-6 questionnaire-step">
      <div className="questionnaire-step-header">
        <img src="/icons/profile.png" alt="" className="questionnaire-step-header-icon" />
        <div>
          <span className="eyebrow">Étape 01 · Fondations</span>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Profil de l&apos;entreprise</h2>
          <p className="text-sm text-gray-500">Informations de base sur votre entreprise ou projet.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nom */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom de l&apos;entreprise <span className="text-red-400">*</span>
          </label>
          <input
            {...register("companyName", { required: "Requis" })}
            placeholder="Ex. : Café du Plateau SENC"
            className={`w-full bg-white border rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700/30 transition
              ${errors.companyName ? "border-red-500" : "border-gray-300"}`}
          />
          {errors.companyName && (
            <p className="mt-1 text-xs text-red-400">{errors.companyName.message}</p>
          )}
        </div>

        {/* Secteur */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Secteur d&apos;activité <span className="text-red-400">*</span>
          </label>
          <input
            {...register("sector", { required: "Requis" })}
            placeholder="Ex. : Restauration, Technologie, Commerce de détail"
            className={`w-full bg-white border rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700/30 transition
              ${errors.sector ? "border-red-500" : "border-gray-300"}`}
          />
          {errors.sector && (
            <p className="mt-1 text-xs text-red-400">{errors.sector.message}</p>
          )}
        </div>

        {/* Forme juridique */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Forme juridique <span className="text-red-400">*</span>
          </label>
          <select
            {...register("legalForm", { required: "Requis" })}
            className={`w-full bg-white border rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-700/30 transition
              ${errors.legalForm ? "border-red-500" : "border-gray-300"}`}
          >
            <option value="">Sélectionner...</option>
            {LEGAL_FORMS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          {errors.legalForm && (
            <p className="mt-1 text-xs text-red-400">{errors.legalForm.message}</p>
          )}
        </div>

        {/* Province */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Province <span className="text-red-400">*</span>
          </label>
          <select
            {...register("province", { required: "Requis" })}
            className={`w-full bg-white border rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-700/30 transition
              ${errors.province ? "border-red-500" : "border-gray-300"}`}
          >
            <option value="">Sélectionner...</option>
            {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Ville */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ville <span className="text-red-400">*</span>
          </label>
          <input
            {...register("city", { required: "Requis" })}
            placeholder="Ex. : Montréal, Québec, Toronto"
            className={`w-full bg-white border rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700/30 transition
              ${errors.city ? "border-red-500" : "border-gray-300"}`}
          />
        </div>

        {/* Adresse */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adresse <span className="text-gray-400 font-normal">(optionnel)</span>
          </label>
          <input
            {...register("address")}
            placeholder="Ex. : 123 rue Saint-Denis, Montréal, H2X 1Z6"
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700/30 transition"
          />
        </div>

        {/* Date de lancement */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date de création / lancement <span className="text-gray-400 font-normal">(optionnel)</span>
          </label>
          <input
            {...register("launchDate")}
            placeholder="Ex. : Mars 2025, 01/06/2025"
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700/30 transition"
          />
        </div>

        {/* Site web */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Site web <span className="text-gray-400 font-normal">(optionnel)</span>
          </label>
          <input
            {...register("website")}
            placeholder="Ex. : https://monentreprise.com"
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700/30 transition"
          />
        </div>

        {/* Type entreprise */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Type d&apos;entreprise <span className="text-red-400">*</span>
          </label>
          <div className="flex gap-4">
            {[
              { value: false, label: "Projet en démarrage", icon: "/icons/project.png", desc: "Nouvelle entreprise à lancer" },
              { value: true, label: "Entreprise existante", icon: "/icons/profile.png", desc: "Déjà en activité" },
            ].map(({ value, label, icon, desc }) => (
              <label
                key={String(value)}
                className={`flex-1 cursor-pointer border-2 rounded-xl p-4 transition
                  ${watch("isExisting") === value
                    ? "border-amber-500 bg-amber-500/10"
                    : "border-gray-300 hover:border-gray-300"
                  }`}
              >
                <input
                  type="radio"
                  {...register("isExisting")}
                  value={String(value)}
                  onChange={() => {}}
                  className="sr-only"
                  checked={watch("isExisting") === value}
                  onClick={() => {
                    // force set via native event
                  }}
                />
                <div className="text-sm font-medium text-gray-900"><img src={icon} alt="" className="questionnaire-choice-icon" />{label}</div>
                <div className="text-xs text-gray-500 mt-1">{desc}</div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
