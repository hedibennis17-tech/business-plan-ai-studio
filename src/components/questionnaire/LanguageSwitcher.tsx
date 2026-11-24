"use client";

import { useState } from "react";

type Language = "fr" | "en";

export default function LanguageSwitcher({ onChange }: { onChange?: (language: Language) => void }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === "undefined") return "fr";
    const saved = window.localStorage.getItem("bpai-language");
    return saved === "en" || saved === "fr" ? saved : "fr";
  });

  function select(next: Language) {
    setLanguage(next);
    window.localStorage.setItem("bpai-language", next);
    onChange?.(next);
  }

  return (
    <div className="language-switcher" aria-label="Choisir la langue / Choose language">
      <span className="language-switcher-label">Langue</span>
      <button type="button" className={language === "fr" ? "active" : ""} onClick={() => select("fr")}>
        FR
      </button>
      <button type="button" className={language === "en" ? "active" : ""} onClick={() => select("en")}>
        EN
      </button>
    </div>
  );
}

export type { Language };
