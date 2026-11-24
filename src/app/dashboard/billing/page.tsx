export const instant = false;

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/login");

  const user = session.user;
  const initials = user.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : (user.email?.[0] ?? "?").toUpperCase();

  const navItems = [
    { icon: "🏠", label: "Tableau de bord", href: "/dashboard", active: false },
    { icon: "📋", label: "Mon plan", href: "/dashboard", active: false },
    { icon: "📄", label: "Documents", href: "/dashboard/documents", active: false },
    { icon: "⚙️", label: "Paramètres", href: "/dashboard/settings", active: false },
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
              <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--text, #182522)" }}>Facturation</div>
              <div style={{ color: "var(--text-muted, #6b8278)", fontSize: "0.75rem" }}>
                <Link href="/dashboard" style={{ color: "var(--text-muted, #6b8278)", textDecoration: "none" }}>Tableau de bord</Link>
                {" › "} Facturation
              </div>
            </div>
            <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "50%", background: "var(--accent, #D6A84F)", color: "var(--primary, #173F35)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.8rem" }}>
              {initials}
            </div>
          </div>
        </header>

        <main style={{ padding: "2rem", flex: 1, maxWidth: "720px" }}>
          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text, #182522)", marginBottom: "0.25rem", letterSpacing: "-0.02em" }}>
              Facturation & Abonnement
            </h1>
            <p style={{ color: "var(--text-secondary, #3d5450)", fontSize: "0.9rem" }}>
              Accédez à votre plan d&apos;affaires complet avec export PDF et Word.
            </p>
          </div>

          {/* Plan actuel */}
          <div style={{
            background: "white", borderRadius: "1rem",
            border: "1px solid var(--border, #d6e0dc)", overflow: "hidden",
            marginBottom: "1.5rem", boxShadow: "0 1px 4px rgba(23,63,53,0.05)",
          }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border, #d6e0dc)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontSize: "1.1rem" }}>📋</span>
              <h2 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text, #182522)", margin: 0 }}>Plan actuel</h2>
            </div>
            <div style={{ padding: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <span style={{
                  background: "var(--primary-muted, #eaf2ef)", color: "var(--primary, #173F35)",
                  fontSize: "0.75rem", fontWeight: 700, padding: "0.25rem 0.75rem", borderRadius: "9999px",
                  display: "inline-block", marginBottom: "0.5rem",
                }}>Plan Gratuit</span>
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted, #6b8278)", margin: 0 }}>
                  Questionnaire complet · Génération IA des 17 sections<br />
                  <strong style={{ color: "var(--text, #182522)" }}>Accès export PDF/Word inclus dans le paiement unique</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Offre Premium */}
          <div style={{
            background: "linear-gradient(135deg, var(--primary, #173F35) 0%, #1e5247 100%)",
            borderRadius: "1rem", overflow: "hidden",
            marginBottom: "1.5rem", boxShadow: "0 4px 20px rgba(23,63,53,0.2)",
          }}>
            <div style={{ padding: "2rem" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
                <div>
                  <div style={{ color: "var(--accent, #D6A84F)", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                    ✦ Accès Complet
                  </div>
                  <h3 style={{ color: "white", fontWeight: 800, fontSize: "1.75rem", margin: 0, letterSpacing: "-0.02em" }}>
                    499 <span style={{ fontSize: "1rem", fontWeight: 600 }}>$ CAD</span>
                  </h3>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", margin: "0.25rem 0 0" }}>
                    Paiement unique · Accès à vie à votre plan
                  </p>
                </div>
                <div style={{
                  background: "var(--accent, #D6A84F)", color: "var(--primary, #173F35)",
                  fontSize: "0.75rem", fontWeight: 800, padding: "0.4rem 0.875rem",
                  borderRadius: "9999px", whiteSpace: "nowrap",
                }}>
                  Bientôt disponible
                </div>
              </div>

              {/* Features */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.75rem" }}>
                {[
                  "✓ Plan d'affaires complet (17 sections)",
                  "✓ Export PDF professionnel",
                  "✓ Export Word modifiable",
                  "✓ Projections financières 3 ans",
                  "✓ Analyse de marché IA",
                  "✓ Accès à vie au document",
                ].map((f) => (
                  <div key={f} style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.825rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {f}
                  </div>
                ))}
              </div>

              <div style={{
                background: "rgba(255,255,255,0.08)", borderRadius: "0.75rem",
                padding: "1rem 1.25rem", fontSize: "0.825rem",
                color: "rgba(255,255,255,0.7)", lineHeight: 1.5,
              }}>
                💳 Le paiement sécurisé par carte de crédit sera disponible très prochainement.<br />
                En attendant, contactez-nous pour un accès anticipé.
              </div>

              <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <Link
                  href="mailto:support@businessplanai.ca?subject=Accès anticipé — Plan 499$ CAD"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "0.5rem",
                    background: "var(--accent, #D6A84F)", color: "var(--primary, #173F35)",
                    padding: "0.75rem 1.5rem", borderRadius: "0.625rem",
                    fontWeight: 700, fontSize: "0.9rem", textDecoration: "none",
                  }}
                >
                  Demander l&apos;accès anticipé →
                </Link>
                <Link
                  href="/dashboard"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "0.5rem",
                    background: "rgba(255,255,255,0.1)", color: "white",
                    border: "1px solid rgba(255,255,255,0.2)",
                    padding: "0.75rem 1.5rem", borderRadius: "0.625rem",
                    fontWeight: 600, fontSize: "0.9rem", textDecoration: "none",
                  }}
                >
                  Retour au tableau de bord
                </Link>
              </div>
            </div>
          </div>

          {/* FAQ rapide */}
          <div style={{
            background: "white", borderRadius: "1rem",
            border: "1px solid var(--border, #d6e0dc)",
            boxShadow: "0 1px 4px rgba(23,63,53,0.05)",
          }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border, #d6e0dc)" }}>
              <h2 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text, #182522)", margin: 0 }}>❓ Questions fréquentes</h2>
            </div>
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {[
                {
                  q: "Le paiement est-il sécurisé ?",
                  a: "Oui. Le paiement sera traité via Stripe, la plateforme de paiement la plus sécurisée au monde. Vos informations bancaires ne sont jamais stockées sur nos serveurs.",
                },
                {
                  q: "Est-ce un abonnement mensuel ?",
                  a: "Non. C'est un paiement unique de 499 $ CAD. Vous accédez à vie à votre plan d'affaires généré.",
                },
                {
                  q: "Puis-je modifier mon plan après génération ?",
                  a: "Oui. Vous pouvez régénérer des sections individuelles et télécharger le document Word pour le modifier directement.",
                },
              ].map(({ q, a }) => (
                <div key={q}>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text, #182522)", marginBottom: "0.35rem" }}>{q}</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted, #6b8278)", lineHeight: 1.6 }}>{a}</div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
