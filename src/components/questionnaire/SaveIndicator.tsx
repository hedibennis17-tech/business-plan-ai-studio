"use client";

type Props = {
  status: "idle" | "saving" | "saved" | "error";
};

export default function SaveIndicator({ status }: Props) {
  if (status === "idle") return null;

  const configs = {
    saving: {
      icon: (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ animation: "spin 1s linear infinite" }}>
          <circle cx="6" cy="6" r="4.5" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="14 4" />
        </svg>
      ),
      text: "Sauvegarde…",
      color: "#9CA3AF",
    },
    saved: {
      icon: <span style={{ fontSize: 11 }}>✓</span>,
      text: "Sauvegardé",
      color: "#173F35",
    },
    error: {
      icon: <span style={{ fontSize: 11 }}>⚠</span>,
      text: "Erreur de sauvegarde",
      color: "#DC2626",
    },
  };

  const { icon, text, color } = configs[status];

  return (
    <>
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          fontSize: 12,
          fontWeight: 500,
          color,
          transition: "all 0.2s",
        }}
      >
        {icon}
        <span>{text}</span>
      </span>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
