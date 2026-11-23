export const instant = false;

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login");

  const user = session.user;
  const initials = user.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : (user.email?.[0] ?? "?").toUpperCase();

  const navItems = [
    { icon: "🏠", label: "Tableau de bord", href: "/dashboard", active: false },
    { icon: "📋", label: "Mon plan", href: "/dashboard", active: false },
    { icon: "📄", label: "Documents", href: "/dashboard/documents", active: false },
    { icon: "⚙️", label: "Paramètres", href: "/dashboard/settings", active: true },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg, #F7F8F6)" }}>
      {/* SIDEBAR */}
      <aside style={{
        width: "240px", flexShrink: 0,
        background: "var(--primary, #173F35)",
        display: "flex", flexDirection: "column",
        position: "fixed", top: 0, left: 0, bottom: 0,
        zIndex: 40, overflowY: "auto",
      }}>
        <div style={{ padding: "1.5rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <div style={{
              width: "2rem", height: "2rem", borderRadius: "0.5rem",
              background: "var(--accent, #D6A84F)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ color: "var(--primary, #173F35)", fontSize: "0.875rem", fontWeight: 800 }}>✦</span>
            </div>
            <div>
              <div style={{ color: "white", fontWeight: 800, fontSize: "0.8rem" }}>Business Plan</div>
              <div style={{ color: "var(--accent, #D6A84F)", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.04em" }}>AI STUDIO</div>
            </div>
          </div>
        </div>

        <nav style={{ padding: "1rem 0.75rem", flex: 1 }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", padding: "0 0.5rem", marginBottom: "0.5rem" }}>
            Menu principal
          </div>
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} style={{
              display: "flex", alignItems: "center", gap: "0.75rem",
              padding: "0.625rem 0.75rem", borderRadius: "0.5rem", marginBottom: "0.125rem",
              textDecoration: "none",
              background: item.active ? "rgba(214,168,79,0.15)" : "transparent",
              color: item.active ? "var(--accent, #D6A84F)" : "rgba(255,255,255,0.55)",
              fontWeight: item.active ? 600 : 400, fontSize: "0.875rem",
              borderLeft: item.active ? "2px solid var(--accent, #D6A84F)" : "2px solid transparent",
            }}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: "1rem 0.75rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <div style={{
              width: "2.25rem", height: "2.25rem", borderRadius: "50%",
              background: "var(--accent, #D6A84F)", color: "var(--primary, #173F35)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: "0.8rem",
            }}>{initials}</div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ color: "white", fontWeight: 600, fontSize: "0.825rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name ?? "Utilisateur"}</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</div>
            </div>
          </div>
          <Link href="/api/auth/signout" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "rgba(255,255,255,0.4)", textDecoration: "none", fontSize: "0.8rem", padding: "0.5rem 0.625rem", borderRadius: "0.375rem" }}>
            <span>→</span> Déconnexion
          </Link>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ marginLeft: "240px", flex: 1, display: "flex", flexDirection: "column" }}>
        <header style={{ background: "white", borderBottom: "1px solid var(--border, #d6e0dc)", padding: "0 2rem", position: "sticky", top: 0, zIndex: 30 }}>
          <div style={{ height: "4rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--text, #182522)" }}>Paramètres</div>
              <div style={{ color: "var(--text-muted, #6b8278)", fontSize: "0.75rem" }}>
                <Link href="/dashboard" style={{ color: "var(--text-muted, #6b8278)", textDecoration: "none" }}>Tableau de bord</Link>
                {" › "} Paramètres
              </div>
            </div>
            <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "50%", background: "var(--accent, #D6A84F)", color: "var(--primary, #173F35)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.8rem" }}>
              {initials}
            </div>
          </div>
        </header>

        <main style={{ padding: "2rem", flex: 1, maxWidth: "700px" }}>
          <div style={{ marginBottom: "1.75rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text, #182522)", marginBottom: "0.25rem", letterSpacing: "-0.02em" }}>
              Paramètres du compte
            </h1>
            <p style={{ color: "var(--text-secondary, #3d5450)", fontSize: "0.9rem" }}>
              Gérez votre profil et vos préférences.
            </p>
          </div>

          {/* Profil */}
          <div style={{ background: "white", borderRadius: "1rem", border: "1px solid var(--border, #d6e0dc)", overflow: "hidden", marginBottom: "1.25rem", boxShadow: "0 1px 4px rgba(23,63,53,0.05)" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border, #d6e0dc)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontSize: "1.1rem" }}>👤</span>
              <h2 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text, #182522)" }}>Profil</h2>
            </div>
            <div style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "1.5rem" }}>
                <div style={{
                  width: "4rem", height: "4rem", borderRadius: "50%",
                  background: "var(--accent, #D6A84F)", color: "var(--primary, #173F35)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, fontSize: "1.25rem",
                }}>{initials}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text, #182522)" }}>{user.name ?? "—"}</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted, #6b8278)" }}>{user.email}</div>
                </div>
              </div>

              {[
                { label: "Nom complet", value: user.name ?? "—" },
                { label: "Adresse e-mail", value: user.email ?? "—" },
              ].map(({ label, value }) => (
                <div key={label} style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted, #6b8278)", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {label}
                  </label>
                  <div style={{
                    padding: "0.75rem 1rem", borderRadius: "0.5rem",
                    border: "1.5px solid var(--border, #d6e0dc)",
                    background: "var(--bg, #F7F8F6)", fontSize: "0.9rem", color: "var(--text, #182522)",
                  }}>
                    {value}
                  </div>
                </div>
              ))}

              <div style={{
                marginTop: "1rem", padding: "0.875rem 1rem",
                background: "var(--primary-muted, #eaf2ef)", borderRadius: "0.625rem",
                fontSize: "0.82rem", color: "var(--primary, #173F35)",
              }}>
                ℹ️ La modification du profil sera disponible dans une prochaine version.
              </div>
            </div>
          </div>

          {/* Abonnement */}
          <div style={{ background: "white", borderRadius: "1rem", border: "1px solid var(--border, #d6e0dc)", overflow: "hidden", marginBottom: "1.25rem", boxShadow: "0 1px 4px rgba(23,63,53,0.05)" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border, #d6e0dc)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontSize: "1.1rem" }}>💳</span>
              <h2 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text, #182522)" }}>Abonnement & Facturation</h2>
            </div>
            <div style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                    <span style={{
                      background: "var(--primary-muted, #eaf2ef)", color: "var(--primary, #173F35)",
                      fontSize: "0.7rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: "9999px",
                    }}>Plan Gratuit</span>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted, #6b8278)" }}>
                    Générez et exportez votre plan d&apos;affaires pour 499 $ CAD.
                  </p>
                </div>
                <Link href="/dashboard/billing" style={{
                  display: "inline-flex", alignItems: "center", gap: "0.5rem",
                  background: "var(--accent, #D6A84F)", color: "var(--primary, #173F35)",
                  padding: "0.6rem 1.1rem", borderRadius: "0.625rem",
                  fontWeight: 700, fontSize: "0.85rem", textDecoration: "none",
                }}>
                  Passer Premium →
                </Link>
              </div>
            </div>
          </div>

          {/* Sécurité */}
          <div style={{ background: "white", borderRadius: "1rem", border: "1px solid var(--border, #d6e0dc)", overflow: "hidden", marginBottom: "1.25rem", boxShadow: "0 1px 4px rgba(23,63,53,0.05)" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border, #d6e0dc)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontSize: "1.1rem" }}>🔐</span>
              <h2 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text, #182522)" }}>Sécurité</h2>
            </div>
            <div style={{ padding: "1.5rem" }}>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "1rem", borderRadius: "0.625rem", border: "1px solid var(--border, #d6e0dc)",
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text, #182522)", marginBottom: "0.2rem" }}>Mot de passe</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted, #6b8278)" }}>Dernière modification : inconnue</div>
                </div>
                <div style={{
                  padding: "0.4rem 0.875rem", borderRadius: "0.5rem",
                  border: "1.5px solid var(--border, #d6e0dc)", fontSize: "0.82rem",
                  color: "var(--text-muted, #6b8278)", background: "var(--bg, #F7F8F6)",
                }}>
                  Bientôt disponible
                </div>
              </div>
            </div>
          </div>

          {/* Déconnexion */}
          <div style={{ background: "white", borderRadius: "1rem", border: "1px solid #fecdd3", overflow: "hidden", boxShadow: "0 1px 4px rgba(23,63,53,0.05)" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #fecdd3", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontSize: "1.1rem" }}>⚠️</span>
              <h2 style={{ fontWeight: 700, fontSize: "1rem", color: "#dc2626" }}>Zone de danger</h2>
            </div>
            <div style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text, #182522)", marginBottom: "0.2rem" }}>Se déconnecter</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted, #6b8278)" }}>Mettre fin à votre session en cours.</div>
                </div>
                <Link href="/api/auth/signout" style={{
                  display: "inline-flex", alignItems: "center", gap: "0.5rem",
                  background: "#fef2f2", color: "#dc2626",
                  border: "1.5px solid #fecdd3",
                  padding: "0.6rem 1.1rem", borderRadius: "0.625rem",
                  fontWeight: 600, fontSize: "0.85rem", textDecoration: "none",
                }}>
                  Déconnexion
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
