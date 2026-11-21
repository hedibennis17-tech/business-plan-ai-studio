export const instant = false;

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

const steps = [
  { num: 1, title: "Identification", icon: "👤" },
  { num: 2, title: "Votre projet", icon: "🏢" },
  { num: 3, title: "Questionnaire", icon: "📝" },
  { num: 4, title: "Marché", icon: "🔍" },
  { num: 5, title: "Opérations", icon: "⚙️" },
  { num: 6, title: "Finances", icon: "📊" },
  { num: 7, title: "Risques", icon: "⚠️" },
  { num: 8, title: "Plan prêt", icon: "✅" },
  { num: 9, title: "Paiement", icon: "💳" },
  { num: 10, title: "Téléchargement", icon: "📥" },
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
    : "?";

  // Mock progression — sera remplacé par données Prisma Phase 2.5
  const completedSteps: number[] = [];
  const currentStep = 1;
  const progress = Math.round((completedSteps.length / 10) * 100);

  return (
    <div style={{ minHeight: "100vh", background: "var(--qc-off-white)" }}>
      {/* Header */}
      <header style={{ background: "white", borderBottom: "1px solid var(--border)", padding: "0 2rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", height: "4rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.25rem", color: "var(--qc-blue)" }}>⚜</span>
            <span style={{ fontWeight: 800, color: "var(--qc-blue)" }}>Business Plan AI Studio</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ color: "var(--qc-slate-500)", fontSize: "0.875rem" }}>{user.name ?? user.email}</span>
            <div style={{
              width: "2.25rem", height: "2.25rem", borderRadius: "50%",
              background: "var(--qc-blue)", color: "white",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: "0.875rem",
            }}>
              {initials}
            </div>
            <Link href="/api/auth/signout" style={{
              background: "none", border: "1px solid var(--border)",
              borderRadius: "0.375rem", padding: "0.375rem 0.75rem",
              fontSize: "0.8rem", cursor: "pointer", color: "var(--qc-slate-500)",
              textDecoration: "none",
            }}>
              Déconnexion
            </Link>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem" }}>
        {/* Welcome */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--qc-slate-900)", marginBottom: "0.25rem" }}>
            Bonjour, {firstName} 👋
          </h1>
          <p style={{ color: "var(--qc-slate-500)" }}>
            {completedSteps.length === 0
              ? "Commencez la création de votre plan d'affaires professionnel."
              : "Continuez la création de votre plan d'affaires professionnel."}
          </p>
        </div>

        {/* Plan actif ou CTA démarrer */}
        <div style={{ background: "white", borderRadius: "1rem", border: "1px solid var(--border)", padding: "1.75rem", marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--qc-blue)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.25rem" }}>
                {completedSteps.length === 0 ? "Nouveau plan d'affaires" : "Plan d'affaires en cours"}
              </div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--qc-slate-900)" }}>
                {completedSteps.length === 0 ? "Démarrez votre projet" : "Mon plan d'affaires"}
              </h2>
              <p style={{ color: "var(--qc-slate-500)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                {completedSteps.length === 0
                  ? "Répondez aux questions guidées et notre IA génère votre plan complet."
                  : `Étape ${currentStep} sur 10 · ${progress}% complété`}
              </p>
            </div>
            <Link href="/plan/step/1" style={{
              background: "var(--qc-blue)", color: "white",
              padding: "0.75rem 1.5rem", borderRadius: "0.5rem",
              fontWeight: 700, textDecoration: "none", fontSize: "0.925rem",
            }}>
              {completedSteps.length === 0 ? "Commencer →" : `Continuer l'étape ${currentStep} →`}
            </Link>
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>Progression globale</span>
              <span style={{ fontWeight: 700, color: "var(--qc-blue)" }}>{progress}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Steps grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "0.75rem", marginTop: "1.25rem" }}>
            {steps.map((step) => {
              const isCompleted = completedSteps.includes(step.num);
              const isCurrent = step.num === currentStep;
              const isLocked = step.num > currentStep;
              return (
                <div key={step.num} style={{
                  textAlign: "center", padding: "0.75rem 0.5rem", borderRadius: "0.75rem",
                  background: isCompleted ? "rgba(22,163,74,0.08)" : isCurrent ? "var(--qc-blue-muted)" : "var(--qc-off-white)",
                  border: isCurrent ? "2px solid var(--qc-blue)" : "1px solid var(--border)",
                  opacity: isLocked ? 0.5 : 1,
                }}>
                  <div style={{ fontSize: "1.25rem", marginBottom: "0.25rem" }}>{isCompleted ? "✅" : step.icon}</div>
                  <div style={{ fontSize: "0.7rem", fontWeight: 600, color: isCompleted ? "var(--qc-success)" : isCurrent ? "var(--qc-blue)" : "var(--qc-slate-500)" }}>
                    {step.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Copilot */}
        <div style={{
          background: "linear-gradient(135deg, var(--qc-blue), var(--qc-blue-light))",
          borderRadius: "1rem", padding: "1.75rem", color: "white",
          display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap",
        }}>
          <div style={{ fontSize: "3rem" }}>🤖</div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.25rem" }}>AI Copilot disponible</h3>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.9rem" }}>
              Votre assistant IA est prêt à vous guider. Posez vos questions et obtenez des suggestions personnalisées.
            </p>
          </div>
          <Link href="/plan/step/1" style={{
            background: "rgba(255,255,255,0.2)", color: "white",
            padding: "0.75rem 1.5rem", borderRadius: "0.5rem",
            fontWeight: 600, textDecoration: "none",
            border: "1px solid rgba(255,255,255,0.3)", fontSize: "0.9rem", whiteSpace: "nowrap",
          }}>
            Ouvrir l&apos;assistant →
          </Link>
        </div>
      </main>
    </div>
  );
}
