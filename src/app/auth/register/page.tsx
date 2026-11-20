"use client";
import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }
    setLoading(true);
    // TODO: API /api/auth/register
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--qc-off-white)",
        padding: "2rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: "460px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "1.75rem", color: "var(--qc-blue)" }}>⚜</span>
            <span style={{ fontWeight: 800, fontSize: "1.25rem", color: "var(--qc-blue)" }}>
              Business Plan AI Studio
            </span>
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--qc-slate-900)" }}>
            Créer un compte
          </h2>
          <p style={{ color: "var(--qc-slate-500)", marginTop: "0.25rem" }}>
            Commencez votre plan d&apos;affaires gratuitement
          </p>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "1rem",
            padding: "2rem",
            border: "1px solid var(--border)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          {/* Google OAuth */}
          <button
            style={{
              width: "100%",
              padding: "0.875rem",
              border: "1px solid var(--border)",
              borderRadius: "0.5rem",
              background: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              fontWeight: 600,
              fontSize: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            S&apos;inscrire avec Google
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
            <span style={{ color: "var(--qc-slate-500)", fontSize: "0.875rem" }}>ou</span>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "0.375rem", fontSize: "0.9rem" }}>
                Nom complet *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Jean Tremblay"
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "0.375rem", fontSize: "0.9rem" }}>
                Adresse courriel *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="jean@exemple.com"
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "0.375rem", fontSize: "0.9rem" }}>
                Téléphone (optionnel)
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 (514) 000-0000"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "0.375rem", fontSize: "0.9rem" }}>
                Mot de passe *
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Minimum 8 caractères"
                required
                minLength={8}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "0.375rem", fontSize: "0.9rem" }}>
                Confirmer le mot de passe *
              </label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="••••••••"
                required
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? "var(--qc-slate-300)" : "var(--qc-blue)",
                color: "white",
                padding: "0.875rem",
                borderRadius: "0.5rem",
                fontWeight: 700,
                fontSize: "1rem",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: "0.5rem",
              }}
            >
              {loading ? "Création du compte..." : "Créer mon compte →"}
            </button>

            <p style={{ fontSize: "0.75rem", color: "var(--qc-slate-500)", textAlign: "center" }}>
              En créant un compte, vous acceptez nos conditions d&apos;utilisation.
            </p>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: "1.5rem", color: "var(--qc-slate-500)", fontSize: "0.9rem" }}>
          Déjà un compte ?{" "}
          <Link href="/auth/login" style={{ color: "var(--qc-blue)", fontWeight: 600 }}>
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem 1rem",
  border: "1px solid var(--border)",
  borderRadius: "0.5rem",
  fontSize: "1rem",
  outline: "none",
  background: "white",
  boxSizing: "border-box",
};
