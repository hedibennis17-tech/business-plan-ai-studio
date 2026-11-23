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
    desc: "Assistant contextuel qui vous guide à chaque étape et détecte les incohérences dans votre plan.",
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
    desc: "Document professionnel avec votre logo, tableaux, graphiques et annexes complètes.",
  },
  {
    icon: "🇨🇦",
    title: "Norme Nord-Américaine",
    desc: "Structure exigée par BDC, SBA, banques à charte. Canada (FR/EN) et États-Unis.",
  },
  {
    icon: "🔒",
    title: "Données sécurisées",
    desc: "Vos données sont chiffrées. L'export complet est verrouillé jusqu'au paiement vérifié.",
  },
];

const faqs = [
  {
    q: "À qui s'adresse Business Plan AI Studio ?",
    a: "Aux entrepreneurs, PME et startups au Canada et aux États-Unis qui veulent un plan d'affaires professionnel conforme aux exigences des banques (BDC, SBA) sans faire appel à un consultant.",
  },
  {
    q: "Dois-je avoir des connaissances en comptabilité ?",
    a: "Non. Notre moteur financier calcule automatiquement les projections, le cash flow et les ratios. Vous renseignez vos chiffres en langage simple, l'IA s'occupe du reste.",
  },
  {
    q: "Combien de temps faut-il pour compléter mon plan ?",
    a: "En moyenne 2 à 4 heures selon la complexité de votre projet. Votre progression est sauvegardée automatiquement — vous pouvez reprendre à tout moment.",
  },
  {
    q: "Le paiement est-il requis pour commencer ?",
    a: "Non. L'aperçu complet est gratuit. Vous payez uniquement 499 $ CAD pour télécharger le document final en PDF et Word.",
  },
  {
    q: "Mon plan est-il confidentiel ?",
    a: "Absolument. Vos données sont chiffrées et ne sont jamais partagées. Votre plan vous appartient entièrement.",
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
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--border)",
          padding: "0 2rem",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            height: "4.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <div style={{
              width: "2rem", height: "2rem", borderRadius: "0.5rem",
              background: "var(--qc-blue)", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ color: "var(--qc-gold)", fontSize: "1rem", lineHeight: 1 }}>⚜</span>
            </div>
            <span
              style={{
                fontWeight: 800,
                fontSize: "1.05rem",
                color: "var(--qc-blue)",
                letterSpacing: "-0.02em",
              }}
            >
              Business Plan AI Studio
            </span>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <Link
              href="/auth/login"
              style={{
                color: "var(--qc-slate-700)",
                textDecoration: "none",
                fontWeight: 500,
                fontSize: "0.9rem",
                padding: "0.5rem 0.875rem",
              }}
            >
              Connexion
            </Link>
            <Link
              href="/auth/register"
              style={{
                background: "var(--qc-blue)",
                color: "white",
                padding: "0.5rem 1.25rem",
                borderRadius: "0.5rem",
                fontWeight: 600,
                fontSize: "0.9rem",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
              }}
            >
              Commencer gratuitement <span>→</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section
        className="gradient-qc"
        style={{
          padding: "5.5rem 2rem 5rem",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative background blobs */}
        <div style={{
          position: "absolute", top: "-6rem", right: "-6rem",
          width: "30rem", height: "30rem", borderRadius: "50%",
          background: "rgba(201,168,76,0.08)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "-4rem", left: "-4rem",
          width: "20rem", height: "20rem", borderRadius: "50%",
          background: "rgba(255,255,255,0.05)", pointerEvents: "none",
        }} />

        <div style={{ maxWidth: "820px", margin: "0 auto", position: "relative" }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "9999px", padding: "0.375rem 1rem",
            marginBottom: "1.75rem", backdropFilter: "blur(8px)",
          }}>
            <span style={{ color: "var(--qc-gold)", fontSize: "0.875rem" }}>⚜</span>
            <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.825rem", fontWeight: 600, letterSpacing: "0.04em" }}>
              Plateforme canadienne de plans d&apos;affaires
            </span>
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
              fontSize: "1.2rem",
              color: "rgba(255,255,255,0.82)",
              marginBottom: "2.75rem",
              lineHeight: 1.7,
              maxWidth: "640px",
              margin: "0 auto 2.75rem",
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
                borderRadius: "0.625rem",
                fontWeight: 700,
                fontSize: "1.05rem",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                boxShadow: "0 4px 20px rgba(201,168,76,0.4)",
              }}
            >
              Créer mon plan d&apos;affaires <span>→</span>
            </Link>
            <Link
              href="#fonctionnalites"
              style={{
                background: "rgba(255,255,255,0.12)",
                color: "white",
                padding: "1rem 2.5rem",
                borderRadius: "0.625rem",
                fontWeight: 600,
                fontSize: "0.975rem",
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.25)",
                backdropFilter: "blur(8px)",
              }}
            >
              Voir comment ça marche
            </Link>
          </div>
          <p
            style={{
              marginTop: "1.75rem",
              color: "rgba(255,255,255,0.5)",
              fontSize: "0.825rem",
            }}
          >
            Aperçu gratuit · Export complet 499 $ CAD · Aucune expertise requise
          </p>
        </div>
      </section>

      {/* STATS BAND */}
      <section
        style={{
          background: "white",
          borderBottom: "1px solid var(--border)",
          padding: "1.75rem 2rem",
        }}
      >
        <div
          style={{
            maxWidth: "960px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "1.5rem",
            textAlign: "center",
          }}
        >
          {[
            { val: "10 étapes", label: "Parcours guidé complet" },
            { val: "9 sections", label: "Structure professionnelle" },
            { val: "Canada & USA", label: "Norme BDC / SBA" },
            { val: "PDF + Word", label: "Export prêt à soumettre" },
            { val: "499 $ CAD", label: "Paiement unique" },
          ].map((s) => (
            <div key={s.val} style={{ padding: "0.5rem" }}>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: "var(--qc-blue)",
                  letterSpacing: "-0.02em",
                }}
              >
                {s.val}
              </div>
              <div style={{ color: "var(--qc-slate-500)", fontSize: "0.8rem", marginTop: "0.2rem" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ÉTAPES */}
      <section style={{ padding: "5.5rem 2rem", background: "var(--qc-off-white)" }}>
        <div style={{ maxWidth: "1140px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div className="qc-accent-line" style={{ justifyContent: "center", marginBottom: "0.875rem" }}>
              Parcours guidé
            </div>
            <h2 className="heading-section" style={{ marginBottom: "0.75rem" }}>
              10 étapes simples vers votre plan complet
            </h2>
            <p style={{ color: "var(--qc-slate-500)", fontSize: "1.05rem", maxWidth: "520px", margin: "0 auto" }}>
              Notre IA vous accompagne de la première question jusqu&apos;au document final téléchargeable.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
              gap: "1rem",
            }}
          >
            {steps.map((step, i) => (
              <div
                key={step.num}
                className="card-premium"
                style={{
                  display: "flex",
                  gap: "1rem",
                  alignItems: "flex-start",
                  borderLeft: i < 3 ? "3px solid var(--qc-success)" : i === 3 ? "3px solid var(--qc-blue)" : "3px solid transparent",
                }}
              >
                <div
                  className="step-badge"
                  style={{
                    flexShrink: 0,
                    background: i < 3 ? "var(--qc-success)" : "var(--qc-blue)",
                    boxShadow: i < 3 ? "0 2px 8px rgba(22,163,74,0.3)" : "0 2px 8px rgba(0,61,165,0.3)",
                  }}
                >
                  {step.num}
                </div>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: "0.25rem", fontSize: "0.95rem" }}>{step.title}</div>
                  <div style={{ color: "var(--qc-slate-500)", fontSize: "0.845rem", lineHeight: 1.5 }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FONCTIONNALITÉS */}
      <section id="fonctionnalites" style={{ padding: "5.5rem 2rem", background: "white" }}>
        <div style={{ maxWidth: "1140px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div className="qc-accent-line" style={{ justifyContent: "center", marginBottom: "0.875rem" }}>
              Fonctionnalités
            </div>
            <h2 className="heading-section" style={{ marginBottom: "0.75rem" }}>
              Tout ce qu&apos;il vous faut pour réussir
            </h2>
            <p style={{ color: "var(--qc-slate-500)", fontSize: "1.05rem", maxWidth: "520px", margin: "0 auto" }}>
              Des outils professionnels accessibles à tous, même sans formation en gestion ou en finance.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {features.map((f) => (
              <div key={f.title} className="card-premium" style={{ position: "relative", overflow: "hidden" }}>
                <div style={{
                  position: "absolute", top: 0, right: 0,
                  width: "4rem", height: "4rem",
                  background: "var(--qc-blue-muted)",
                  borderRadius: "0 1rem 0 4rem",
                }} />
                <div style={{
                  width: "2.75rem", height: "2.75rem", borderRadius: "0.75rem",
                  background: "var(--qc-blue-muted)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.5rem", marginBottom: "1rem",
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontWeight: 700, marginBottom: "0.5rem", fontSize: "1.05rem", color: "var(--qc-slate-900)" }}>{f.title}</h3>
                <p style={{ color: "var(--qc-slate-500)", lineHeight: 1.65, fontSize: "0.875rem" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRIX */}
      <section className="gradient-qc" style={{ padding: "5.5rem 2rem", textAlign: "center" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <div className="qc-accent-line" style={{ justifyContent: "center", marginBottom: "1.25rem" }}>
            Tarification simple
          </div>
          <h2 className="heading-section" style={{ color: "white", marginBottom: "0.75rem" }}>
            Un seul prix. Un plan complet.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "2.5rem", fontSize: "1.05rem" }}>
            Pas d&apos;abonnement, pas de frais cachés. Payez une seule fois pour votre document final.
          </p>
          <div
            style={{
              background: "rgba(255,255,255,0.08)",
              borderRadius: "1.5rem",
              padding: "2.5rem",
              border: "1px solid rgba(255,255,255,0.15)",
              marginBottom: "2rem",
              backdropFilter: "blur(12px)",
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
              <div>
                <div style={{ color: "var(--qc-gold)", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                  Plan complet — Paiement unique
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                  <span style={{ color: "white", fontSize: "3.5rem", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1 }}>
                    499 $
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "1rem" }}>CAD</span>
                </div>
              </div>
              <div style={{
                background: "var(--qc-gold)", color: "var(--qc-slate-900)",
                borderRadius: "0.5rem", padding: "0.375rem 0.875rem",
                fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.03em",
                alignSelf: "flex-start",
              }}>
                APERÇU GRATUIT
              </div>
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "0.625rem",
            }}>
              {[
                "Plan d'affaires complet (9 sections)",
                "Export PDF haute qualité",
                "Export Word (.docx) éditable",
                "Logo et images intégrés",
                "Tableaux et graphiques financiers",
                "Norme BDC / SBA (Canada & USA)",
                "Accès illimité à votre plan",
                "Support technique inclus",
              ].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: "0.625rem", color: "rgba(255,255,255,0.88)" }}>
                  <span style={{ color: "var(--qc-gold)", fontWeight: 700, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: "0.875rem" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <Link
            href="/auth/register"
            style={{
              background: "var(--qc-gold)",
              color: "var(--qc-slate-900)",
              padding: "1.1rem 3rem",
              borderRadius: "0.625rem",
              fontWeight: 700,
              fontSize: "1.05rem",
              textDecoration: "none",
              display: "inline-block",
              boxShadow: "0 4px 20px rgba(201,168,76,0.4)",
            }}
          >
            Commencer gratuitement →
          </Link>
          <p style={{ color: "rgba(255,255,255,0.45)", marginTop: "1.25rem", fontSize: "0.8rem" }}>
            Aperçu gratuit. Paiement seulement pour télécharger le document final.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "5.5rem 2rem", background: "var(--qc-off-white)" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div className="qc-accent-line" style={{ justifyContent: "center", marginBottom: "0.875rem" }}>
              Questions fréquentes
            </div>
            <h2 className="heading-section">Tout ce que vous voulez savoir</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {faqs.map((faq) => (
              <div
                key={faq.q}
                style={{
                  background: "white",
                  borderRadius: "0.875rem",
                  padding: "1.5rem",
                  border: "1px solid var(--border)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <h3 style={{ fontWeight: 700, marginBottom: "0.625rem", fontSize: "1rem", color: "var(--qc-slate-900)" }}>
                  {faq.q}
                </h3>
                <p style={{ color: "var(--qc-slate-500)", lineHeight: 1.65, fontSize: "0.9rem" }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{
        padding: "5rem 2rem",
        background: "white",
        textAlign: "center",
        borderTop: "1px solid var(--border)",
      }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🇨🇦</div>
          <h2 className="heading-section" style={{ marginBottom: "1rem" }}>
            Prêt à lancer votre projet ?
          </h2>
          <p style={{ color: "var(--qc-slate-500)", fontSize: "1.05rem", marginBottom: "2rem", lineHeight: 1.7 }}>
            Rejoignez les entrepreneurs canadiens qui créent leur plan d&apos;affaires professionnel avec l&apos;aide de l&apos;IA.
          </p>
          <Link
            href="/auth/register"
            className="btn-primary"
            style={{ fontSize: "1.05rem", padding: "1rem 2.5rem" }}
          >
            Créer mon plan d&apos;affaires →
          </Link>
          <p style={{ color: "var(--qc-slate-400)", marginTop: "1rem", fontSize: "0.825rem" }}>
            Aperçu gratuit · Aucune carte de crédit requise
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          background: "var(--qc-slate-900)",
          color: "rgba(255,255,255,0.5)",
          padding: "3rem 2rem 2rem",
        }}
      >
        <div style={{ maxWidth: "1140px", margin: "0 auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "2rem",
            marginBottom: "2rem",
            paddingBottom: "2rem",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            flexWrap: "wrap",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.75rem" }}>
                <div style={{
                  width: "1.75rem", height: "1.75rem", borderRadius: "0.375rem",
                  background: "var(--qc-blue)", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ color: "var(--qc-gold)", fontSize: "0.875rem" }}>⚜</span>
                </div>
                <span style={{ color: "white", fontWeight: 700, fontSize: "1rem" }}>Business Plan AI Studio</span>
              </div>
              <p style={{ fontSize: "0.85rem", lineHeight: 1.6, maxWidth: "360px" }}>
                Plateforme canadienne de création de plans d&apos;affaires professionnels pour les entrepreneurs du Canada et des États-Unis.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "flex-end" }}>
              <Link href="/auth/login" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "0.875rem" }}>
                Connexion
              </Link>
              <Link href="/auth/register" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "0.875rem" }}>
                Créer un compte
              </Link>
              <Link href="#fonctionnalites" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "0.875rem" }}>
                Fonctionnalités
              </Link>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
            <p style={{ fontSize: "0.775rem" }}>
              © 2026 Business Plan AI Studio · Tous droits réservés
            </p>
            <p style={{ fontSize: "0.775rem" }}>
              Canada · Norme BDC / SBA
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
