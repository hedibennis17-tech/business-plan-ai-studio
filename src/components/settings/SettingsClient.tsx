"use client";

import { useState } from "react";

interface Props {
  initialName: string;
  email: string;
  hasPassword: boolean;
  isGoogleAccount: boolean;
}

export default function SettingsClient({ initialName, email, hasPassword, isGoogleAccount }: Props) {
  // Profil
  const [name, setName] = useState(initialName);
  const [nameLoading, setNameLoading] = useState(false);
  const [nameMsg, setNameMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Mot de passe
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleProfileSave() {
    setNameLoading(true);
    setNameMsg(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (res.ok) {
        setNameMsg({ type: "success", text: "Profil mis à jour avec succès." });
      } else {
        setNameMsg({ type: "error", text: data.error ?? "Erreur inattendue" });
      }
    } catch {
      setNameMsg({ type: "error", text: "Erreur réseau." });
    } finally {
      setNameLoading(false);
    }
  }

  async function handlePasswordSave() {
    if (!currentPwd || !newPwd || !confirmPwd) {
      setPwdMsg({ type: "error", text: "Tous les champs sont requis." });
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdMsg({ type: "error", text: "Les mots de passe ne correspondent pas." });
      return;
    }
    if (newPwd.length < 8) {
      setPwdMsg({ type: "error", text: "Le nouveau mot de passe doit contenir au moins 8 caractères." });
      return;
    }
    setPwdLoading(true);
    setPwdMsg(null);
    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd, confirmPassword: confirmPwd }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwdMsg({ type: "success", text: "Mot de passe modifié avec succès." });
        setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
      } else {
        setPwdMsg({ type: "error", text: data.error ?? "Erreur inattendue" });
      }
    } catch {
      setPwdMsg({ type: "error", text: "Erreur réseau." });
    } finally {
      setPwdLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.75rem 1rem", borderRadius: "0.5rem",
    border: "1.5px solid var(--border, #d6e0dc)",
    background: "white", fontSize: "0.9rem", color: "var(--text, #182522)",
    outline: "none", boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "0.78rem", fontWeight: 600,
    color: "var(--text-muted, #6b8278)", marginBottom: "0.4rem",
    textTransform: "uppercase", letterSpacing: "0.05em",
  };

  return (
    <>
      {/* === PROFIL === */}
      <div style={{
        background: "white", borderRadius: "1rem",
        border: "1px solid var(--border, #d6e0dc)", overflow: "hidden",
        marginBottom: "1.25rem", boxShadow: "0 1px 4px rgba(23,63,53,0.05)",
      }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border, #d6e0dc)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "1.1rem" }}>👤</span>
          <h2 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text, #182522)", margin: 0 }}>Profil</h2>
        </div>
        <div style={{ padding: "1.5rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Nom complet</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              placeholder="Votre nom complet"
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Adresse e-mail</label>
            <div style={{ ...inputStyle, background: "var(--bg, #F7F8F6)", color: "var(--text-muted, #6b8278)" }}>
              {email}
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted, #6b8278)", marginTop: "0.35rem" }}>
              La modification de l&apos;e-mail nécessite une vérification — contactez le support.
            </p>
          </div>

          {nameMsg && (
            <div style={{
              padding: "0.75rem 1rem", borderRadius: "0.5rem", marginBottom: "1rem",
              background: nameMsg.type === "success" ? "#f0fdf4" : "#fef2f2",
              color: nameMsg.type === "success" ? "#166534" : "#dc2626",
              fontSize: "0.85rem", fontWeight: 500,
            }}>
              {nameMsg.type === "success" ? "✓" : "✗"} {nameMsg.text}
            </div>
          )}

          <button
            onClick={handleProfileSave}
            disabled={nameLoading || name.trim().length < 2}
            style={{
              background: nameLoading ? "rgba(23,63,53,0.5)" : "var(--primary, #173F35)",
              color: "white", border: "none", borderRadius: "0.625rem",
              padding: "0.7rem 1.5rem", fontWeight: 700, fontSize: "0.875rem",
              cursor: nameLoading ? "not-allowed" : "pointer",
            }}
          >
            {nameLoading ? "Enregistrement…" : "Enregistrer le profil"}
          </button>
        </div>
      </div>

      {/* === MOT DE PASSE === */}
      <div style={{
        background: "white", borderRadius: "1rem",
        border: "1px solid var(--border, #d6e0dc)", overflow: "hidden",
        marginBottom: "1.25rem", boxShadow: "0 1px 4px rgba(23,63,53,0.05)",
      }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border, #d6e0dc)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "1.1rem" }}>🔐</span>
          <h2 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text, #182522)", margin: 0 }}>Sécurité — Mot de passe</h2>
        </div>
        <div style={{ padding: "1.5rem" }}>
          {isGoogleAccount && !hasPassword ? (
            <div style={{
              padding: "1rem", borderRadius: "0.625rem",
              background: "var(--bg, #F7F8F6)", border: "1px solid var(--border, #d6e0dc)",
              fontSize: "0.85rem", color: "var(--text-muted, #6b8278)",
            }}>
              🔗 Votre compte est connecté via Google. La modification du mot de passe n&apos;est pas disponible.
            </div>
          ) : (
            <>
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Mot de passe actuel</label>
                <input
                  type="password"
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  style={inputStyle}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Nouveau mot de passe</label>
                <input
                  type="password"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  style={inputStyle}
                  placeholder="8 caractères minimum"
                  autoComplete="new-password"
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Confirmer le mot de passe</label>
                <input
                  type="password"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  style={inputStyle}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>

              {pwdMsg && (
                <div style={{
                  padding: "0.75rem 1rem", borderRadius: "0.5rem", marginBottom: "1rem",
                  background: pwdMsg.type === "success" ? "#f0fdf4" : "#fef2f2",
                  color: pwdMsg.type === "success" ? "#166534" : "#dc2626",
                  fontSize: "0.85rem", fontWeight: 500,
                }}>
                  {pwdMsg.type === "success" ? "✓" : "✗"} {pwdMsg.text}
                </div>
              )}

              <button
                onClick={handlePasswordSave}
                disabled={pwdLoading}
                style={{
                  background: pwdLoading ? "rgba(23,63,53,0.5)" : "var(--primary, #173F35)",
                  color: "white", border: "none", borderRadius: "0.625rem",
                  padding: "0.7rem 1.5rem", fontWeight: 700, fontSize: "0.875rem",
                  cursor: pwdLoading ? "not-allowed" : "pointer",
                }}
              >
                {pwdLoading ? "Modification…" : "Modifier le mot de passe"}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
