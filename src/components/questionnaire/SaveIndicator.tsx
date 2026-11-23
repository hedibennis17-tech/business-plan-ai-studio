"use client";

type Props = {
  status: "idle" | "saving" | "saved" | "error";
};

export default function SaveIndicator({ status }: Props) {
  if (status === "idle") return null;

  const configs = {
    saving: { icon: "⏳", text: "Sauvegarde...", className: "text-slate-400" },
    saved: { icon: "✓", text: "Sauvegardé", className: "text-emerald-400" },
    error: { icon: "⚠", text: "Erreur de sauvegarde", className: "text-red-400" },
  };

  const { icon, text, className } = configs[status];

  return (
    <span className={`text-xs flex items-center gap-1 ${className} transition-all`}>
      <span>{icon}</span>
      <span>{text}</span>
    </span>
  );
}
