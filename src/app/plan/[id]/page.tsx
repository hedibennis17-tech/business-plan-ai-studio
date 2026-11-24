/**
 * Phase 5 — Page résultat du business plan (design premium Forest Green)
 */

import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import GenerateButton from "@/components/plan-result/GenerateButton";
import SectionViewer from "@/components/plan-result/SectionViewer";
import ExportButtons from "@/components/plan-result/ExportButtons";
import type { GeneratedSections } from "@/lib/generationEngine";
import Link from "next/link";

export const instant = false;

type Props = { params: Promise<{ id: string }> };

export default async function PlanResultPage({ params }: Props) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/login");

  const plan = await prisma.businessPlan.findFirst({
    where: { id, user: { email: session.user.email } },
    select: {
      id: true,
      title: true,
      status: true,
      currentStep: true,
      completedSteps: true,
      generationStatus: true,
      generationStarted: true,
      generationFinished: true,
      generationError: true,
      generationVersion: true,
      generationCount: true,
      generatedSections: true,
      financialAssumptions: true,
    },
  });

  if (!plan) notFound();

  const hasGenerated = plan.generationStatus === "GENERATED" && plan.generatedSections;
  const isGenerating = plan.generationStatus === "GENERATING";

  const user = session.user;
  const initials = user.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : (user.email?.[0] ?? "?").toUpperCase();

  const navItems = [
    { icon: "🏠", label: "Tableau de bord", href: "/dashboard", active: false },
    { icon: "📋", label: "Mon plan", href: `/plan/${id}`, active: true },
    { icon: "📄", label: "Documents", href: "/dashboard/documents", active: false },
    { icon: "⚙️", label: "Paramètres", href: "/dashboard/settings", active: false },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg, #F7F8F6)" }}>

      {/* SIDEBAR */}
      <aside style={{
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
          <Link href="/dashboard" style={{ textDecoration: "none" }}>
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
                <div style={{ color: "white", fontWeight: 800, fontSize: "0.8rem", lineHeight: 1.1 }}>
                  Business Plan
                </div>
                <div style={{ color: "var(--accent, #D6A84F)", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.04em" }}>
                  AI STUDIO
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ padding: "1rem 0.75rem", flex: 1 }}>
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

      {/* MAIN */}
      <div style={{ marginLeft: "240px", flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Top bar */}
        <header style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border, #d6e0dc)",
          padding: "0 2rem",
          position: "sticky", top: 0, zIndex: 30,
        }}>
          <div style={{
            height: "4rem", display: "flex",
            alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              {/* Breadcrumb */}
              <Link href="/dashboard" style={{ color: "var(--text-muted, #6b8278)", textDecoration: "none", fontSize: "0.85rem" }}>
                Tableau de bord
              </Link>
              <span style={{ color: "var(--border, #d6e0dc)" }}>›</span>
              <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text, #182522)" }}>
                {plan.title}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              {hasGenerated && (
                <Link
                  href={`/questionnaire/${plan.id}`}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "0.4rem",
                    padding: "0.5rem 0.875rem",
                    border: "1.5px solid var(--border, #d6e0dc)",
                    borderRadius: "0.5rem",
                    color: "var(--text-secondary, #3d5450)",
                    textDecoration: "none",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    background: "var(--surface)",
                  }}
                >
                  ✏️ Modifier
                </Link>
              )}
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

        {/* Content */}
        <main style={{ padding: "2rem", flex: 1 }}>

          {/* Generating state */}
          {isGenerating && (
            <div style={{
              borderRadius: "1.25rem",
              border: "1px solid rgba(23,63,53,0.15)",
              background: "var(--primary-muted, #eaf2ef)",
              padding: "3rem 2rem",
              textAlign: "center",
              maxWidth: "520px",
              margin: "0 auto",
            }}>
              <div style={{
                width: "3.5rem", height: "3.5rem",
                border: "4px solid rgba(23,63,53,0.15)",
                borderTopColor: "var(--primary, #173F35)",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 1.5rem",
              }} />
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--primary, #173F35)", marginBottom: "0.625rem" }}>
                Génération en cours…
              </h2>
              <p style={{ color: "var(--text-secondary, #3d5450)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "0.5rem" }}>
                L'IA analyse vos réponses et rédige votre business plan complet en 17 sections.
              </p>
              <p style={{ color: "var(--text-muted, #6b8278)", fontSize: "0.8rem" }}>
                Durée estimée : 1-2 minutes · Rafraîchissez la page dans quelques instants.
              </p>
              <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
            </div>
          )}

          {/* Not generated state */}
          {!hasGenerated && !isGenerating && (
            <div style={{
              background: "var(--surface)",
              borderRadius: "1.25rem",
              border: "1px solid var(--border, #d6e0dc)",
              padding: "2rem",
              boxShadow: "0 2px 8px rgba(23,63,53,0.06)",
              maxWidth: "680px",
            }}>
              <div style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
                <div style={{
                  width: "3rem", height: "3rem",
                  background: "var(--primary-muted, #eaf2ef)",
                  borderRadius: "0.875rem",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.5rem", flexShrink: 0,
                }}>
                  🚀
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text, #182522)", marginBottom: "0.5rem" }}>
                    Générer votre business plan
                  </h2>
                  <p style={{ color: "var(--text-secondary, #3d5450)", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "1rem" }}>
                    L'IA va analyser toutes vos réponses et créer un plan d'affaires professionnel structuré en 17 sections.
                    Les prévisions financières sont calculées par un moteur déterministe indépendant.
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "1.25rem" }}>
                    {[
                      "17 sections professionnelles",
                      "Calculs financiers vérifiables",
                      "Adapté à votre projet",
                      "Export PDF + Word inclus",
                    ].map((item) => (
                      <div key={item} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-secondary, #3d5450)" }}>
                        <span style={{ color: "var(--success, #16a34a)", flexShrink: 0 }}>✓</span>
                        {item}
                      </div>
                    ))}
                  </div>

                  <GenerateButton
                    planId={plan.id}
                    generationStatus={plan.generationStatus}
                    generationCount={plan.generationCount ?? 0}
                    completedSteps={plan.completedSteps ?? []}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Generated state */}
          {hasGenerated && (
            <>
              {/* Success banner */}
              <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "1rem",
                alignItems: "center",
                justifyContent: "space-between",
                background: "var(--surface)",
                border: "1px solid var(--border, #d6e0dc)",
                borderRadius: "1rem",
                padding: "1rem 1.5rem",
                marginBottom: "1.5rem",
                boxShadow: "0 2px 8px rgba(23,63,53,0.06)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                  <div style={{
                    width: "2.5rem", height: "2.5rem",
                    background: "var(--success-bg, rgba(22,163,74,0.08))",
                    borderRadius: "0.75rem",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.25rem", flexShrink: 0,
                  }}>
                    ✅
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text, #182522)" }}>
                      Business plan généré avec succès
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted, #6b8278)" }}>
                      {plan.generationFinished
                        ? `${new Date(plan.generationFinished).toLocaleDateString("fr-CA", { day: "numeric", month: "long", year: "numeric" })} à ${new Date(plan.generationFinished).toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" })}`
                        : "Génération terminée"
                      }
                      {" · "}Modèle : {plan.generationVersion ?? "Claude"}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                  {/* Export buttons */}
                  <ExportButtons planId={plan.id} />
                  {/* Regenerate */}
                  <GenerateButton
                    planId={plan.id}
                    generationStatus={plan.generationStatus}
                    generationCount={plan.generationCount ?? 0}
                    completedSteps={plan.completedSteps ?? []}
                  />
                </div>
              </div>

              {/* Section viewer */}
              <SectionViewer
                planId={plan.id}
                sections={plan.generatedSections as unknown as GeneratedSections}
                financials={plan.financialAssumptions}
                generationVersion={plan.generationVersion}
                generationFinished={plan.generationFinished}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
