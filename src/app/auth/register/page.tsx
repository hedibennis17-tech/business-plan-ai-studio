"use client";
import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem 1rem",
  border: "1.5px solid var(--border)",
  borderRadius: "0.625rem",
  fontSize: "0.95rem",
  outline: "none",
  background: "var(--qc-off-white)",
  boxSizing: "border-box",
  color: "var(--qc-slate-900)",
  transition: "border-color 0.2s, background 0.2s",
};

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      setError("Erreur Google. Réessayez.");
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (form.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de la création du compte");
        setLoading(false);
        return;
      }

      // Connexion automatique après inscription
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        router.push("/auth/login?registered=1");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Une erreur est survenue. Réessayez.");
      setLoading(false);
    }
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "var(--qc-blue)";
    e.currentTarget.style.background = "white";
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "var(--border)";
    e.currentTarget.style.background = "var(--qc-off-white)";
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      {/* Panel gauche — branding (desktop) */}
      <div
        className="gradient-qc"
        style={{
          flex: "0 0 40%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "3rem",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{
          position: "absolute", top: "-5rem", right: "-5rem",
          width: "20rem", height: "20rem", borderRadius: "50%",
          background: "rgba(201,168,76,0.12)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "-4rem", left: "-3rem",
          width: "16rem", height: "16rem", borderRadius: "50%",
          background: "rgba(255,255,255,0.05)", pointerEvents: "none",
        }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", position: "relative" }}>
          <div style={{
            width: "2.25rem", height: "2.25rem", borderRadius: "0.5rem",
            background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "var(--qc-gold)", fontSize: "1.1rem" }}>⚜</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: "1rem" }}>Business Plan AI Studio</span>
        </div>

        {/* Copy */}
        <div style={{ position: "relative" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "1rem", lineHeight: 1.25, letterSpacing: "-0.02em" }}>
            Lancez votre projet d&apos;affaires avec l&apos;IA
          </h1>
          <p style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.7, marginBottom: "1.5rem", fontSize: "0.95rem" }}>
            Aperçu gratuit. Payez seulement 499 $ CAD pour télécharger votre plan complet en PDF et Word.
          </p>
          <div style={{
            background: "rgba(255,255,255,0.08)", borderRadius: "1rem",
            padding: "1.25rem 1.5rem", border: "1px solid rgba(255,255,255,0.12)",
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {[
                "Questionnaire guidé par IA",
                "Projections financières automatiques",
                "Plan conforme BDC & SBA",
                "Export PDF + Word professionnel",
              ].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                  <div style={{
                    width: "1.125rem", height: "1.125rem", borderRadius: "50%",
                    background: "var(--qc-gold)", display: "flex",
                    alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <span style={{ color: "var(--qc-slate-900)", fontSize: "0.6rem", fontWeight: 800 }}>✓</span>
                  </div>
                  <span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.88)" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Flag */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>
          <span>🇨🇦</span>
          <span>Plateforme canadienne · Canada & États-Unis</span>
        </div>
      </div>

      {/* Panel droit — formulaire */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "2.5rem 2rem",
          background: "var(--qc-off-white)",
          overflowY: "auto",
        }}
      >
        <div style={{ width: "100%", maxWidth: "420px", paddingTop: "1rem", paddingBottom: "2rem" }}>
          {/* Mobile logo */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "0.625rem" }}>
              <div style={{
                width: "2rem", height: "2rem", borderRadius: "0.5rem",
                background: "var(--qc-blue)", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ color: "var(--qc-gold)", fontSize: "1rem" }}>⚜</span>
              </div>
              <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--qc-blue)" }}>
                Business Plan AI Studio
              </span>
            </div>
            <h2 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--qc-slate-900)", letterSpacing: "-0.02em" }}>
              Créer un compte
            </h2>
            <p style={{ color: "var(--qc-slate-500)", marginTop: "0.375rem", fontSize: "0.875rem" }}>
              Commencez votre plan d&apos;affaires gratuitement
            </p>
          </div>

          {/* Card */}
          <div
            style={{
              background: "var(--surface)",
              borderRadius: "1.25rem",
              padding: "2rem",
              border: "1px solid var(--border)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            }}
          >
            {/* Google OAuth */}
            <button
              onClick={handleGoogle}
              disabled={googleLoading || loading}
              style={{
                width: "100%",
                padding: "0.875rem",
                border: "1.5px solid var(--border)",
                borderRadius: "0.625rem",
                background: googleLoading ? "#f9fafb" : "white",
                cursor: googleLoading || loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
                fontWeight: 600,
                fontSize: "0.95rem",
                marginBottom: "1.25rem",
                opacity: googleLoading ? 0.7 : 1,
                color: "var(--qc-slate-800)",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!googleLoading && !loading) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#4285F4";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 12px rgba(66,133,244,0.15)";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {googleLoading ? "Redirection en cours..." : "S'inscrire avec Google"}
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "1.25rem" }}>
              <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
              <span style={{ color: "var(--qc-slate-400)", fontSize: "0.8rem", fontWeight: 500 }}>ou</span>
              <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
            </div>

            {/* Erreur */}
            {error && (
              <div style={{
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                color: "#DC2626",
                borderRadius: "0.625rem",
                padding: "0.75rem 1rem",
                fontSize: "0.875rem",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}>
                <span style={{ flexShrink: 0 }}>⚠</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "0.375rem", fontSize: "0.875rem", color: "var(--qc-slate-700)" }}>
                  Nom complet <span style={{ color: "var(--qc-blue)" }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Jean Tremblay"
                  required
                  style={inputStyle}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "0.375rem", fontSize: "0.875rem", color: "var(--qc-slate-700)" }}>
                  Adresse courriel <span style={{ color: "var(--qc-blue)" }}>*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="jean@exemple.com"
                  required
                  style={inputStyle}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "0.375rem", fontSize: "0.875rem", color: "var(--qc-slate-700)" }}>
                  Téléphone{" "}
                  <span style={{ color: "var(--qc-slate-400)", fontWeight: 400 }}>(optionnel)</span>
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1 (514) 000-0000"
                  style={inputStyle}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "0.375rem", fontSize: "0.875rem", color: "var(--qc-slate-700)" }}>
                  Mot de passe <span style={{ color: "var(--qc-blue)" }}>*</span>
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Minimum 8 caractères"
                  required
                  minLength={8}
                  style={inputStyle}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "0.375rem", fontSize: "0.875rem", color: "var(--qc-slate-700)" }}>
                  Confirmer le mot de passe <span style={{ color: "var(--qc-blue)" }}>*</span>
                </label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  required
                  style={inputStyle}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  background: loading ? "var(--qc-slate-300)" : "var(--qc-blue)",
                  color: "white",
                  padding: "0.9rem",
                  borderRadius: "0.625rem",
                  fontWeight: 700,
                  fontSize: "0.975rem",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  marginTop: "0.25rem",
                  boxShadow: loading ? "none" : "0 4px 14px rgba(0,61,165,0.25)",
                  transition: "background 0.2s",
                }}
              >
                {loading ? "Création du compte..." : "Créer mon compte →"}
              </button>

              <p style={{ fontSize: "0.75rem", color: "var(--qc-slate-400)", textAlign: "center", lineHeight: 1.5 }}>
                En créant un compte, vous acceptez nos conditions d&apos;utilisation. Aperçu gratuit, paiement uniquement pour l&apos;export.
              </p>
            </form>
          </div>

          <p style={{ textAlign: "center", marginTop: "1.5rem", color: "var(--qc-slate-500)", fontSize: "0.875rem" }}>
            Déjà un compte ?{" "}
            <Link href="/auth/login" style={{ color: "var(--qc-blue)", fontWeight: 700 }}>
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
