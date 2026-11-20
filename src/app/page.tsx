import Link from "next/link";

const steps = [
  { num: "01", title: "Identification", desc: "Connexion sécurisée Google ou email" },
  { num: "02", title: "Votre projet", desc: "Type d'entreprise, secteur, pays, objectif" },
  { num: "03", title: "Questionnaire IA", desc: "Questions adaptatives avec assistant intelligent" },
  { num: "04", title: "Étude de marché", desc: "Concurrents, clientèle, analyse SWOT" },
  { num: "05", title: "Plan opérationnel", desc: "Équipe, fournisseurs, opérations" },
  { num: "06", title: "Moteur financier", desc: "Prévisions, cash flow, scénarios" },
  { num: "07", title: "Risques", desc: "Identification, contingence, validation" },
  { num: "08", title: "Plan prêt", desc: "Prévisualisation de votre plan complet" },
  { num: "09", title: "Paiement 499 $", desc: "Déverrouillage sécurisé via Stripe" },
  { num: "10", title: "Téléchargement", desc: "PDF + Word avec logo, tableaux, graphiques" },
];

const features = [
  {
    icon: "🤖",
    title: "AI Copilot",
    desc: "Assistant contextuel qui vous guide à chaque étape et détecte les incohérences.",
  },
  {
    icon: "📊",
    title: "Moteur financier",
    desc: "Calculs automatiques, prévisions sur 3 ans, 3 scénarios (optimiste / réaliste / pessimiste).",
  },
  {
    icon: "🔍",
    title: "Analyse de marché",
    desc: "Sources web intégrées, profil concurrentiel, analyse SWOT générée automatiquement.",
  },
  {
    icon: "📄",
    title: "Export PDF + Word",
    desc: "Document professionnel avec votre logo, tableaux, graphiques et annexes.",
  },
  {
    icon: "🇨🇦",
    title: "Norme Nord-Américaine",
    desc: "Structure exigée par BDC, SBA, banques à charte. Canada (FR/EN) et États-Unis.",
  },
  {
    icon: "🔒",
    title: "Sécurisé",
    desc: "Vos données sont chiffrées. L'export complet est verrouillé jusqu'au paiement vérifié.",
  },
];

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--background)" }}>
      {/* NAV */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
          padding: "0 2rem",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            height: "4rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.5rem" }}>⚜</span>
            <span
              style={{
                fontWeight: 800,
                fontSize: "1.1rem",
                color: "var(--qc-blue)",
                letterSpacing: "-0.01em",
              }}
            >
              Business Plan AI Studio
            </span>
          </div>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <Link
              href="/auth/login"
              style={{
                color: "var(--qc-slate-700)",
                textDecoration: "none",
                fontWeight: 500,
                fontSize: "0.925rem",
              }}
            >
              Connexion
            </Link>
            <Link href="/auth/register" className="btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.925rem" }}>
              Commencer gratuitement →
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="gradient-qc" style={{ padding: "6rem 2rem 5rem", textAlign: "center" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div className="qc-accent-line" style={{ justifyContent: "center", marginBottom: "1.5rem" }}>
            Plateforme canadienne de plans d&apos;affaires
          </div>
          <h1
            className="heading-hero"
            style={{ color: "white", marginBottom: "1.5rem" }}
          >
            Votre plan d&apos;affaires professionnel,{" "}
            <span style={{ color: "var(--qc-gold)" }}>guidé par l&apos;IA</span>
          </h1>
          <p
            style={{
              fontSize: "1.25rem",
              color: "rgba(255,255,255,0.85)",
              marginBottom: "2.5rem",
              lineHeight: 1.6,
            }}
          >
            Créez un plan d&apos;affaires complet selon les normes BDC, SBA et banques à charte.
            Sans expertise comptable ni rédaction requise.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/auth/register"
              style={{
                background: "var(--qc-gold)",
                color: "var(--qc-slate-900)",
                padding: "1rem 2.5rem",
                borderRadius: "0.5rem",
                fontWeight: 700,
                fontSize: "1.1rem",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                transition: "all 0.2s",
              }}
            >
              Créer mon plan d&apos;affaires →
            </Link>
            <Link
              href="#fonctionnalites"
              style={{
                background: "rgba(255,255,255,0.15)",
                color: "white",
                padding: "1rem 2.5rem",
                borderRadius: "0.5rem",
                fontWeight: 600,
                fontSize: "1rem",
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              Voir les fonctionnalités
            </Link>
          </div>
          <p
            style={{
              marginTop: "1.5rem",
              color: "rgba(255,255,255,0.6)",
              fontSize: "0.875rem",
            }}
          >
            Aperçu gratuit · Export complet 499 $ CAD · PDF + Word inclus
          </p>
        </div>
      </section>

      {/* STATS */}
      <section
        style={{
          background: "white",
          borderBottom: "1px solid var(--border)",
          padding: "2rem",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "2rem",
            textAlign: "center",
          }}
        >
          {[
            { val: "9 sections", label: "Structure complète" },
            { val: "10 étapes", label: "Parcours guidé" },
            { val: "Canada & USA", label: "Norme BDC / SBA" },
            { val: "PDF + Word", label: "Export professionnel" },
          ].map((s) => (
            <div key={s.val}>
              <div
                style={{
                  fontSize: "1.75rem",
                  fontWeight: 800,
                  color: "var(--qc-blue)",
                }}
              >
                {s.val}
              </div>
              <div style={{ color: "var(--qc-slate-500)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ÉTAPES */}
      <section style={{ padding: "5rem 2rem", background: "var(--qc-off-white)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div className="qc-accent-line" style={{ justifyContent: "center", marginBottom: "1rem" }}>
              Parcours guidé
            </div>
            <h2 className="heading-section">10 étapes simples vers votre plan complet</h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {steps.map((step, i) => (
              <div
                key={step.num}
                className="card-premium"
                style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}
              >
                <div
                  className="step-badge"
                  style={{ flexShrink: 0, background: i < 3 ? "var(--qc-success)" : "var(--qc-blue)" }}
                >
                  {step.num}
                </div>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: "0.25rem" }}>{step.title}</div>
                  <div style={{ color: "var(--qc-slate-500)", fontSize: "0.875rem" }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FONCTIONNALITÉS */}
      <section id="fonctionnalites" style={{ padding: "5rem 2rem", background: "white" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div className="qc-accent-line" style={{ justifyContent: "center", marginBottom: "1rem" }}>
              Fonctionnalités
            </div>
            <h2 className="heading-section">Tout ce qu&apos;il vous faut pour réussir</h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {features.map((f) => (
              <div key={f.title} className="card-premium">
                <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{f.icon}</div>
                <h3 style={{ fontWeight: 700, marginBottom: "0.5rem", fontSize: "1.1rem" }}>{f.title}</h3>
                <p style={{ color: "var(--qc-slate-500)", lineHeight: 1.6, fontSize: "0.9rem" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRIX */}
      <section className="gradient-qc" style={{ padding: "5rem 2rem", textAlign: "center" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div className="qc-accent-line" style={{ justifyContent: "center", marginBottom: "1.5rem" }}>
            Tarification simple
          </div>
          <h2 className="heading-section" style={{ color: "white", marginBottom: "1rem" }}>
            Un seul prix. Un plan complet.
          </h2>
          <div
            style={{
              background: "rgba(255,255,255,0.1)",
              borderRadius: "1.5rem",
              padding: "2.5rem",
              border: "1px solid rgba(255,255,255,0.2)",
              marginBottom: "2rem",
            }}
          >
            <div style={{ color: "var(--qc-gold)", fontWeight: 700, fontSize: "0.875rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem" }}>
              Plan complet
            </div>
            <div style={{ color: "white", fontSize: "4rem", fontWeight: 900, lineHeight: 1 }}>
              499 $
            </div>
            <div style={{ color: "rgba(255,255,255,0.7)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
              CAD — paiement unique
            </div>
            <ul style={{ listStyle: "none", textAlign: "left", color: "rgba(255,255,255,0.9)", lineHeight: 2 }}>
              {[
                "✓ Plan d'affaires complet (9 sections)",
                "✓ Export PDF haute qualité",
                "✓ Export Word (.docx) éditable",
                "✓ Logo et images intégrés",
                "✓ Tableaux et graphiques financiers",
                "✓ Norme BDC / SBA (Canada & USA)",
                "✓ Accès illimité à votre plan",
              ].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <Link
            href="/auth/register"
            style={{
              background: "var(--qc-gold)",
              color: "var(--qc-slate-900)",
              padding: "1rem 3rem",
              borderRadius: "0.5rem",
              fontWeight: 700,
              fontSize: "1.1rem",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Commencer gratuitement →
          </Link>
          <p style={{ color: "rgba(255,255,255,0.5)", marginTop: "1rem", fontSize: "0.825rem" }}>
            Aperçu gratuit. Paiement seulement pour télécharger le document final.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          background: "var(--qc-slate-900)",
          color: "rgba(255,255,255,0.6)",
          padding: "2.5rem 2rem",
          textAlign: "center",
        }}
      >
        <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ color: "var(--qc-gold)" }}>⚜</span>
          <span style={{ color: "white", fontWeight: 700 }}>Business Plan AI Studio</span>
        </div>
        <p style={{ fontSize: "0.875rem" }}>
          Plateforme canadienne de création de plans d&apos;affaires professionnels · Canada & États-Unis
        </p>
        <p style={{ fontSize: "0.75rem", marginTop: "0.5rem" }}>
          © 2026 Business Plan AI Studio · Tous droits réservés
        </p>
      </footer>
    </div>
  );
}
