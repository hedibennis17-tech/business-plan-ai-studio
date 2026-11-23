export const instant = false;

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DocumentsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login");

  const user = session.user;
  const initials = user.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : (user.email?.[0] ?? "?").toUpperCase();

  const plans = await prisma.businessPlan.findMany({
    where: { user: { email: user.email! } },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      generationStatus: true,
      updatedAt: true,
      currentStep: true,
    },
  });

  type Plan = typeof plans[number];
  const generatedPlans = plans.filter((p: Plan) => p.generationStatus === "GENERATED");

  const navItems = [
    { icon: "🏠", label: "Tableau de bord", href: "/dashboard", active: false },
    { icon: "📋", label: "Mon plan", href: plans[0] ? `/plan/${plans[0].id}` : "/dashboard", active: false },
    { icon: "📄", label: "Documents", href: "/dashboard/documents", active: true },
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
              <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--text, #182522)" }}>Documents</div>
              <div style={{ color: "var(--text-muted, #6b8278)", fontSize: "0.75rem" }}>
                <Link href="/dashboard" style={{ color: "var(--text-muted, #6b8278)", textDecoration: "none" }}>Tableau de bord</Link>
                {" › "} Documents
              </div>
            </div>
            <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "50%", background: "var(--accent, #D6A84F)", color: "var(--primary, #173F35)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.8rem" }}>
              {initials}
            </div>
          </div>
        </header>

        <main style={{ padding: "2rem", flex: 1, maxWidth: "900px" }}>
          <div style={{ marginBottom: "1.75rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text, #182522)", marginBottom: "0.25rem", letterSpacing: "-0.02em" }}>
              Mes documents
            </h1>
            <p style={{ color: "var(--text-secondary, #3d5450)", fontSize: "0.9rem" }}>
              Téléchargez vos plans d&apos;affaires en PDF ou Word.
            </p>
          </div>

          {generatedPlans.length === 0 ? (
            <div style={{
              background: "white", borderRadius: "1.25rem",
              border: "1px solid var(--border, #d6e0dc)",
              padding: "3rem 2rem", textAlign: "center",
            }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📄</div>
              <h2 style={{ fontWeight: 700, color: "var(--text, #182522)", marginBottom: "0.5rem" }}>
                Aucun document disponible
              </h2>
              <p style={{ color: "var(--text-muted, #6b8278)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
                Complétez la génération de votre plan d&apos;affaires pour accéder aux exports PDF et Word.
              </p>
              <Link href="/dashboard" style={{
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                background: "var(--primary, #173F35)", color: "white",
                padding: "0.75rem 1.5rem", borderRadius: "0.625rem",
                fontWeight: 600, fontSize: "0.9rem", textDecoration: "none",
              }}>
                Retour au tableau de bord →
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {generatedPlans.map((plan: Plan) => (
                <div key={plan.id} style={{
                  background: "white", borderRadius: "1rem",
                  border: "1px solid var(--border, #d6e0dc)",
                  padding: "1.5rem",
                  boxShadow: "0 1px 4px rgba(23,63,53,0.05)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                        <span style={{
                          background: "rgba(22,163,74,0.1)", color: "#16a34a",
                          fontSize: "0.7rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: "9999px",
                        }}>✅ Généré</span>
                      </div>
                      <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text, #182522)", marginBottom: "0.25rem" }}>
                        {plan.title}
                      </h3>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted, #6b8278)" }}>
                        Mis à jour le {new Date(plan.updatedAt).toLocaleDateString("fr-CA", { year: "numeric", month: "long", day: "numeric" })}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                      <a
                        href={`/api/plans/${plan.id}/export?format=pdf`}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "0.5rem",
                          background: "var(--primary, #173F35)", color: "white",
                          padding: "0.6rem 1.1rem", borderRadius: "0.625rem",
                          fontWeight: 600, fontSize: "0.85rem", textDecoration: "none",
                        }}
                      >
                        📄 PDF
                      </a>
                      <a
                        href={`/api/plans/${plan.id}/export?format=docx`}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "0.5rem",
                          background: "var(--accent, #D6A84F)", color: "var(--primary, #173F35)",
                          padding: "0.6rem 1.1rem", borderRadius: "0.625rem",
                          fontWeight: 600, fontSize: "0.85rem", textDecoration: "none",
                        }}
                      >
                        📝 Word
                      </a>
                      <Link
                        href={`/plan/${plan.id}`}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "0.5rem",
                          border: "1.5px solid var(--border, #d6e0dc)", color: "var(--text, #182522)",
                          padding: "0.6rem 1.1rem", borderRadius: "0.625rem",
                          fontWeight: 500, fontSize: "0.85rem", textDecoration: "none",
                          background: "transparent",
                        }}
                      >
                        Voir →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Plans en cours (non générés) */}
          {plans.filter((p: Plan) => p.generationStatus !== "GENERATED").length > 0 && (
            <div style={{ marginTop: "2rem" }}>
              <h2 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-muted, #6b8278)", marginBottom: "1rem" }}>
                Plans en cours de création
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {plans.filter((p: Plan) => p.generationStatus !== "GENERATED").map((plan: Plan) => (
                  <div key={plan.id} style={{
                    background: "white", borderRadius: "0.875rem",
                    border: "1px solid var(--border, #d6e0dc)",
                    padding: "1.25rem",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    opacity: 0.75,
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text, #182522)" }}>{plan.title}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted, #6b8278)" }}>Étape {plan.currentStep}/10 · Non généré</div>
                    </div>
                    <Link href={`/questionnaire/${plan.id}`} style={{
                      color: "var(--primary, #173F35)", textDecoration: "none",
                      fontWeight: 600, fontSize: "0.85rem",
                    }}>
                      Continuer →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
