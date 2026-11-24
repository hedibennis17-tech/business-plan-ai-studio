export const instant = false;

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import StartPlanButton from "@/components/dashboard/StartPlanButton";

const steps = [
  { num: 1, title: "Identification", icon: "👤", desc: "Connexion sécurisée" },
  { num: 2, title: "Votre projet", icon: "🏢", desc: "Type, secteur, pays" },
  { num: 3, title: "Questionnaire", icon: "📝", desc: "Questions guidées par IA" },
  { num: 4, title: "Marché", icon: "🔍", desc: "Concurrents & SWOT" },
  { num: 5, title: "Opérations", icon: "⚙️", desc: "Équipe & fournisseurs" },
  { num: 6, title: "Finances", icon: "📊", desc: "Projections sur 3 ans" },
  { num: 7, title: "Risques", icon: "⚠️", desc: "Identification & contingence" },
  { num: 8, title: "Plan prêt", icon: "✅", desc: "Prévisualisation complète" },
  { num: 9, title: "Paiement", icon: "💳", desc: "499 $ CAD via Stripe" },
  { num: 10, title: "Téléchargement", icon: "📥", desc: "PDF + Word" },
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  const user = session.user;
  const firstName = user.name?.split(" ")[0] ?? "là";
  const initials = user.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : (user.email?.[0] ?? "?").toUpperCase();

  const existingPlan = await prisma.businessPlan.findFirst({
    where: { user: { email: user.email! } },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      currentStep: true,
      completedSteps: true,
      generationStatus: true,
    },
  });

  const completedSteps: number[] = existingPlan?.completedSteps ?? [];
  const currentStep = existingPlan?.currentStep ?? 1;
  const progress = Math.round((completedSteps.length / 10) * 100);

  const today = new Date().toLocaleDateString("fr-CA", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1);

  const navItems = [
    { icon: "🏠", label: "Tableau de bord", href: "/dashboard", active: true },
    { icon: "📋", label: "Mon plan", href: existingPlan ? `/plan/${existingPlan.id}` : "/dashboard", active: false },
    { icon: "📄", label: "Documents", href: "/dashboard/documents", active: false },
    { icon: "💳", label: "Facturation", href: "/dashboard/billing", active: false },
    { icon: "🎧", label: "Support", href: "/dashboard/support", active: false },
    { icon: "⚙️", label: "Paramètres", href: "/dashboard/settings", active: false },
  ];

  return (
    <div className="dashboard-shell" style={{ minHeight: "100vh", display: "flex" }}>

      {/* SIDEBAR */}
      <aside className="dashboard-sidebar" style={{
        width: "240px",
        flexShrink: 0,
        background: "var(--primary, #173F35)",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0, left: 0, bottom: 0,
        zIndex: 40,
        overflowY: "auto",
      }}>
        {/* Logo */}
        <div style={{
          padding: "1.5rem 1.25rem",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <div style={{
              width: "2rem", height: "2rem", borderRadius: "0.5rem",
              background: "var(--accent, #D6A84F)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <span style={{ color: "var(--primary, #173F35)", fontSize: "0.875rem", fontWeight: 800 }}>✦</span>
            </div>
            <div>
              <div style={{ color: "white", fontWeight: 800, fontSize: "0.8rem", lineHeight: 1.1, letterSpacing: "-0.01em" }}>
                Business Plan
              </div>
              <div style={{ color: "var(--accent, #D6A84F)", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.04em" }}>
                AI STUDIO
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: "1rem 0.75rem", flex: 1 }}>
          <div style={{ marginBottom: "0.25rem" }}>
            <div style={{
              fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.3)", textTransform: "uppercase",
              padding: "0 0.5rem", marginBottom: "0.5rem",
            }}>
              Menu principal
            </div>
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.625rem 0.75rem",
                  borderRadius: "0.5rem",
                  marginBottom: "0.125rem",
                  textDecoration: "none",
                  background: item.active ? "rgba(214,168,79,0.15)" : "transparent",
                  color: item.active ? "var(--accent, #D6A84F)" : "rgba(255,255,255,0.55)",
                  fontWeight: item.active ? 600 : 400,
                  fontSize: "0.875rem",
                  transition: "background 0.15s, color 0.15s",
                  borderLeft: item.active ? "2px solid var(--accent, #D6A84F)" : "2px solid transparent",
                }}
              >
                <span style={{ fontSize: "1rem", flexShrink: 0 }}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* User card bottom */}
        <div style={{
          padding: "1rem 0.75rem",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <div style={{
              width: "2.25rem", height: "2.25rem", borderRadius: "50%",
              background: "var(--accent, #D6A84F)",
              color: "var(--primary, #173F35)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: "0.8rem", flexShrink: 0,
            }}>
              {initials}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ color: "white", fontWeight: 600, fontSize: "0.825rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user.name ?? "Utilisateur"}
              </div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user.email}
              </div>
            </div>
          </div>
          <Link
            href="/api/auth/signout"
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              color: "rgba(255,255,255,0.4)", textDecoration: "none",
              fontSize: "0.8rem", padding: "0.5rem 0.625rem", borderRadius: "0.375rem",
              transition: "color 0.15s",
            }}
          >
            <span>→</span> Déconnexion
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="dashboard-main" style={{ marginLeft: "240px", flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Top bar */}
        <header className="dashboard-topbar" style={{
          background: "rgba(255,255,255,0.94)",
          borderBottom: "1px solid var(--border, #d6e0dc)",
          padding: "0 2rem",
          position: "sticky", top: 0, zIndex: 30,
        }}>
          <div style={{
            height: "4rem", display: "flex",
            alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--text, #182522)" }}>
                Tableau de bord
              </div>
              <div style={{ color: "var(--text-muted, #6b8278)", fontSize: "0.75rem" }}>
                {todayCapitalized}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              {/* Plan badge */}
              <div style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                background: "var(--primary-muted, #eaf2ef)", borderRadius: "9999px",
                padding: "0.375rem 0.875rem",
              }}>
                <div style={{
                  width: "0.5rem", height: "0.5rem", borderRadius: "50%",
                  background: "var(--primary, #173F35)",
                }} />
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--primary, #173F35)" }}>
                  Plan gratuit
                </span>
              </div>
              {/* Avatar */}
              <div style={{
                width: "2.25rem", height: "2.25rem", borderRadius: "50%",
                background: "var(--accent, #D6A84F)",
                color: "var(--primary, #173F35)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: "0.8rem",
              }}>
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="dashboard-content" style={{ padding: "2rem", flex: 1, maxWidth: "1000px", width: "100%" }}>

          {/* Welcome */}
          <div style={{ marginBottom: "1.75rem" }}>
            <h1 style={{
              fontSize: "1.75rem", fontWeight: 800, color: "var(--text, #182522)",
              marginBottom: "0.375rem", letterSpacing: "-0.02em",
            }}>
              Bonjour, {firstName} 👋
            </h1>
            <p style={{ color: "var(--text-secondary, #3d5450)", fontSize: "0.95rem" }}>
              {completedSteps.length === 0
                ? "Prêt à lancer votre plan d'affaires professionnel ?"
                : "Continuez la création de votre plan d'affaires professionnel."}
            </p>
          </div>

          {/* Quick stats row */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "1rem",
            marginBottom: "1.75rem",
          }}>
            {[
              { label: "Progression", value: `${progress}%`, color: "var(--primary, #173F35)", bg: "var(--primary-muted, #eaf2ef)", icon: "📈" },
              { label: "Étapes complétées", value: `${completedSteps.length}/10`, color: "var(--success, #16a34a)", bg: "rgba(22,163,74,0.08)", icon: "✅" },
              { label: "Étape actuelle", value: `Étape ${currentStep}`, color: "var(--warning, #d97706)", bg: "rgba(217,119,6,0.08)", icon: "🎯" },
              { label: "Export", value: "499 $ CAD", color: "var(--accent, #D6A84F)", bg: "var(--accent-muted, #fdf5e6)", icon: "📄" },
            ].map((stat) => (
              <div key={stat.label} style={{
                background: "white",
                borderRadius: "0.875rem",
                padding: "1.25rem",
                border: "1px solid var(--border, #d6e0dc)",
                boxShadow: "0 1px 3px rgba(23,63,53,0.04)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted, #6b8278)", fontWeight: 500 }}>{stat.label}</div>
                  <div style={{
                    width: "1.75rem", height: "1.75rem", borderRadius: "0.375rem",
                    background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.875rem",
                  }}>
                    {stat.icon}
                  </div>
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: stat.color, letterSpacing: "-0.02em" }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* Plan card */}
          <div style={{
            background: "white",
            borderRadius: "1.25rem",
            border: "1px solid var(--border, #d6e0dc)",
            overflow: "hidden",
            marginBottom: "1.75rem",
            boxShadow: "0 2px 8px rgba(23,63,53,0.06)",
          }}>
            {/* Card header */}
            <div style={{
              padding: "1.5rem 1.75rem",
              borderBottom: "1px solid var(--border, #d6e0dc)",
              display: "flex", justifyContent: "space-between",
              alignItems: "center", flexWrap: "wrap", gap: "1rem",
            }}>
              <div>
                <div style={{
                  fontSize: "0.7rem", fontWeight: 700, color: "var(--accent, #D6A84F)",
                  letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.25rem",
                }}>
                  {completedSteps.length === 0 ? "Nouveau plan d'affaires" : "Plan d'affaires en cours"}
                </div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text, #182522)", letterSpacing: "-0.01em" }}>
                  {completedSteps.length === 0 ? "Démarrez votre projet" : "Mon plan d'affaires"}
                </h2>
                <p style={{ color: "var(--text-muted, #6b8278)", fontSize: "0.845rem", marginTop: "0.2rem" }}>
                  {completedSteps.length === 0
                    ? "Répondez aux questions guidées — l'IA génère votre plan complet."
                    : `Étape ${currentStep} sur 10 · ${progress}% complété`}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                <StartPlanButton existingPlan={existingPlan ?? null} />
                {existingPlan?.generationStatus === "GENERATED" && (
                  <Link
                    href={`/plan/${existingPlan.id}`}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "0.4rem",
                      background: "var(--success, #16a34a)", color: "white",
                      padding: "0.6rem 1.1rem", borderRadius: "0.625rem",
                      fontWeight: 600, fontSize: "0.9rem", textDecoration: "none",
                    }}
                  >
                    ✅ Voir mon business plan
                  </Link>
                )}
              </div>
            </div>

            {/* Progress */}
            <div style={{ padding: "1.25rem 1.75rem", borderBottom: "1px solid var(--border, #d6e0dc)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.625rem" }}>
                <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text-secondary, #3d5450)" }}>Progression globale</span>
                <span style={{ fontWeight: 800, color: "var(--primary, #173F35)", fontSize: "0.85rem" }}>{progress}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Steps grid */}
            <div style={{ padding: "1.25rem 1.75rem" }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                gap: "0.625rem",
              }}>
                {steps.map((step) => {
                  const isCompleted = completedSteps.includes(step.num);
                  const isCurrent = step.num === currentStep;
                  const isLocked = step.num > currentStep;
                  return (
                    <div
                      key={step.num}
                      style={{
                        padding: "0.75rem",
                        borderRadius: "0.75rem",
                        background: isCompleted
                          ? "rgba(22,163,74,0.06)"
                          : isCurrent
                          ? "var(--primary-muted, #eaf2ef)"
                          : "var(--bg, #F7F8F6)",
                        border: isCurrent
                          ? "2px solid var(--primary, #173F35)"
                          : isCompleted
                          ? "1px solid rgba(22,163,74,0.2)"
                          : "1px solid var(--border, #d6e0dc)",
                        opacity: isLocked ? 0.45 : 1,
                        transition: "opacity 0.2s",
                      }}
                    >
                      <div style={{ fontSize: "1.1rem", marginBottom: "0.3rem" }}>
                        {isCompleted ? "✅" : step.icon}
                      </div>
                      <div style={{
                        fontSize: "0.72rem", fontWeight: 700,
                        color: isCompleted
                          ? "var(--success, #16a34a)"
                          : isCurrent
                          ? "var(--primary, #173F35)"
                          : "var(--text-muted, #6b8278)",
                        marginBottom: "0.1rem",
                        lineHeight: 1.3,
                      }}>
                        {step.title}
                      </div>
                      <div style={{ fontSize: "0.65rem", color: "var(--text-muted, #6b8278)", lineHeight: 1.3 }}>
                        {step.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* AI Copilot banner */}
          <div style={{
            background: "linear-gradient(135deg, var(--primary-dark, #0f2b24) 0%, var(--primary, #173F35) 60%, var(--primary-mid, #245B4B) 100%)",
            borderRadius: "1.25rem",
            padding: "1.75rem",
            color: "white",
            display: "flex",
            gap: "1.5rem",
            alignItems: "center",
            flexWrap: "wrap",
            boxShadow: "0 4px 20px rgba(23,63,53,0.25)",
            position: "relative",
            overflow: "hidden",
            marginBottom: "1.75rem",
          }}>
            <div style={{
              position: "absolute", right: "-2rem", top: "-2rem",
              width: "10rem", height: "10rem", borderRadius: "50%",
              background: "rgba(255,255,255,0.04)", pointerEvents: "none",
            }} />
            <div style={{
              width: "3.5rem", height: "3.5rem", borderRadius: "1rem",
              background: "rgba(214,168,79,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.75rem", flexShrink: 0,
              border: "1px solid rgba(214,168,79,0.3)",
            }}>
              🤖
            </div>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <div style={{ fontWeight: 800, fontSize: "1.05rem", marginBottom: "0.3rem" }}>
                AI Copilot disponible
              </div>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.875rem", lineHeight: 1.6 }}>
                Votre assistant IA est prêt. Il vous guide à chaque étape, détecte les incohérences et génère votre plan complet.
              </p>
            </div>
            <Link
              href={existingPlan ? `/questionnaire/${existingPlan.id}` : "/dashboard"}
              style={{
                background: "var(--accent, #D6A84F)",
                color: "var(--primary, #173F35)",
                padding: "0.75rem 1.5rem",
                borderRadius: "0.625rem",
                fontWeight: 700,
                textDecoration: "none",
                fontSize: "0.875rem",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              Ouvrir l&apos;assistant →
            </Link>
          </div>

          {/* Help footer */}
          <div style={{
            padding: "1.25rem 1.5rem",
            background: "var(--surface)",
            borderRadius: "0.875rem",
            border: "1px solid var(--border, #d6e0dc)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text, #182522)", marginBottom: "0.2rem" }}>
                Besoin d&apos;aide ?
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted, #6b8278)" }}>
                Notre documentation couvre toutes les étapes du parcours.
              </div>
            </div>
            <Link
              href="#"
              style={{
                color: "var(--primary, #173F35)", textDecoration: "none",
                fontWeight: 600, fontSize: "0.85rem",
                padding: "0.5rem 1rem",
                border: "1.5px solid var(--primary, #173F35)",
                borderRadius: "0.5rem",
                flexShrink: 0,
              }}
            >
              Consulter le guide →
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
