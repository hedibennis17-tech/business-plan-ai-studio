"use client";
import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

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
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Courriel ou mot de passe incorrect");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "var(--qc-off-white)",
      }}
    >
      {/* Panel gauche — branding */}
      <div
        className="gradient-qc"
        style={{
          flex: 1,
          display: "none" as "none",
          flexDirection: "column",
          justifyContent: "center",
          padding: "4rem",
          color: "white",
        }}
      >
        <div style={{ marginBottom: "2rem" }}>
          <span style={{ fontSize: "3rem" }}>⚜</span>
        </div>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "1rem", lineHeight: 1.2 }}>
          Business Plan AI Studio
        </h1>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "1.1rem", lineHeight: 1.6 }}>
          Créez votre plan d&apos;affaires professionnel avec l&apos;aide de l&apos;IA. Norme Canada & USA.
        </p>
      </div>

      {/* Panel droit — formulaire */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          minWidth: "min(100%, 500px)",
          margin: "0 auto",
        }}
      >
        <div style={{ width: "100%", maxWidth: "420px" }}>
          {/* Logo mobile */}
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "1.75rem", color: "var(--qc-blue)" }}>⚜</span>
              <span style={{ fontWeight: 800, fontSize: "1.25rem", color: "var(--qc-blue)" }}>
                Business Plan AI Studio
              </span>
            </div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--qc-slate-900)" }}>
              Connexion
            </h2>
            <p style={{ color: "var(--qc-slate-500)", marginTop: "0.25rem" }}>
              Accédez à votre plan d&apos;affaires
            </p>
          </div>

          {/* Google OAuth */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            style={{
              width: "100%",
              padding: "0.875rem",
              border: "1px solid var(--border)",
              borderRadius: "0.5rem",
              background: googleLoading ? "#f9fafb" : "white",
              cursor: googleLoading || loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              fontWeight: 600,
              fontSize: "1rem",
              marginBottom: "1.5rem",
              transition: "box-shadow 0.2s",
              opacity: googleLoading ? 0.7 : 1,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {googleLoading ? "Redirection..." : "Continuer avec Google"}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
            <span style={{ color: "var(--qc-slate-500)", fontSize: "0.875rem" }}>ou</span>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
          </div>

          {/* Erreur */}
          {error && (
            <div style={{
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              color: "#DC2626",
              borderRadius: "0.5rem",
              padding: "0.75rem 1rem",
              fontSize: "0.9rem",
              marginBottom: "0.5rem",
            }}>
              {error}
            </div>
          )}

          {/* Email form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "0.375rem", fontSize: "0.925rem" }}>
                Adresse courriel
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="vous@exemple.com"
                required
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  border: "1px solid var(--border)",
                  borderRadius: "0.5rem",
                  fontSize: "1rem",
                  outline: "none",
                  transition: "border-color 0.2s",
                  background: "white",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "0.375rem", fontSize: "0.925rem" }}>
                Mot de passe
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  border: "1px solid var(--border)",
                  borderRadius: "0.5rem",
                  fontSize: "1rem",
                  outline: "none",
                  background: "white",
                  boxSizing: "border-box",
                }}
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
              {loading ? "Connexion..." : "Se connecter →"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "1.5rem", color: "var(--qc-slate-500)", fontSize: "0.9rem" }}>
            Pas encore de compte ?{" "}
            <Link href="/auth/register" style={{ color: "var(--qc-blue)", fontWeight: 600 }}>
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
