"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Step2Data } from "@/lib/schemas";

type Props = {
  defaultValues?: Partial<Step2Data>;
  onChange: (data: Step2Data) => void;
  onValidChange?: (valid: boolean) => void;
};

type FieldName = keyof Step2Data;

export default function Step2({ defaultValues, onChange, onValidChange }: Props) {
  const { register, watch, formState: { errors, isValid } } = useForm<Step2Data>({
    defaultValues,
    mode: "onChange",
  });

  const values = watch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { onChange(values as Step2Data); }, [JSON.stringify(values)]);
  useEffect(() => { onValidChange?.(isValid); }, [isValid]);

  const field = (name: FieldName, required?: boolean) =>
    register(name, required ? { required: "Requis", minLength: { value: 10, message: "Min. 10 caractères" } } : {});

  const fieldCls = (hasError: boolean) =>
    `w-full bg-white border rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700/30 transition resize-none ${hasError ? "border-red-500" : "border-gray-300"}`;

  const Label = ({ text, name, required: req }: { text: string; name: string; required?: boolean }) => (
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {text} {req ? <span className="text-red-400">*</span> : <span className="text-gray-400 font-normal">(optionnel)</span>}
    </label>
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Présentation du projet</h2>
        <p className="text-sm text-gray-500">Décrivez votre projet, le problème qu&apos;il résout et votre proposition de valeur.</p>
      </div>

      <div>
        <Label text="Description du projet" name="description" required />
        <p className="text-xs text-gray-400 mb-1">Qu&apos;est-ce que vous faites exactement ? Pour qui ?</p>
        <textarea {...field("description", true)} rows={4}
          placeholder="Décrivez votre projet en quelques phrases claires et percutantes..."
          className={fieldCls(!!errors.description)} />
        {errors.description && <p className="mt-1 text-xs text-red-400">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label text="Problème identifié" name="problem" required />
          <textarea {...field("problem", true)} rows={3}
            placeholder="Quel problème concret résolvez-vous ?"
            className={fieldCls(!!errors.problem)} />
          {errors.problem && <p className="mt-1 text-xs text-red-400">{errors.problem.message}</p>}
        </div>
        <div>
          <Label text="Solution proposée" name="solution" required />
          <textarea {...field("solution", true)} rows={3}
            placeholder="Comment votre projet résout ce problème ?"
            className={fieldCls(!!errors.solution)} />
          {errors.solution && <p className="mt-1 text-xs text-red-400">{errors.solution.message}</p>}
        </div>
      </div>

      <div>
        <Label text="Proposition de valeur" name="valueProposition" required />
        <p className="text-xs text-gray-400 mb-1">C&apos;est ce qui vous rend unique et indispensable.</p>
        <textarea {...field("valueProposition", true)} rows={3}
          placeholder="Pourquoi un client devrait vous choisir ? Ex. : Livraison garantie en 30 min ou remboursé..."
          className={fieldCls(!!errors.valueProposition)} />
        {errors.valueProposition && <p className="mt-1 text-xs text-red-400">{errors.valueProposition.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label text="Mission" name="mission" />
          <textarea {...field("mission")} rows={2}
            placeholder="Ex. : Rendre une alimentation saine accessible à tous..."
            className={fieldCls(false)} />
        </div>
        <div>
          <Label text="Vision" name="vision" />
          <textarea {...field("vision")} rows={2}
            placeholder="Ex. : Devenir le réseau #1 dans le Grand Montréal d'ici 2027..."
            className={fieldCls(false)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label text="Objectifs à court terme (0–1 an)" name="shortTermGoals" />
          <textarea {...field("shortTermGoals")} rows={3}
            placeholder="Ex. : 200 clients actifs, 10 partenaires..."
            className={fieldCls(false)} />
        </div>
        <div>
          <Label text="Objectifs à moyen terme (1–3 ans)" name="mediumTermGoals" />
          <textarea {...field("mediumTermGoals")} rows={3}
            placeholder="Ex. : Expansion, 500 000$ de CA..."
            className={fieldCls(false)} />
        </div>
        <div>
          <Label text="Objectifs à long terme (3–5 ans)" name="longTermGoals" />
          <textarea {...field("longTermGoals")} rows={3}
            placeholder="Ex. : Franchiser dans 5 villes canadiennes..."
            className={fieldCls(false)} />
        </div>
      </div>

      <div>
        <Label text="Avantage concurrentiel" name="competitiveAdvantage" />
        <textarea {...field("competitiveAdvantage")} rows={3}
          placeholder="Qu'est-ce qui est difficile à copier par vos concurrents ? (technologie, partenariats, expertise...)"
          className={fieldCls(false)} />
      </div>
    </div>
  );
}
