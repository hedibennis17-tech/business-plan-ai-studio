/**
 * Phase 5 — Export PDF Professionnel
 * Utilise @react-pdf/renderer pour générer un PDF premium
 */

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { GeneratedSections } from "./generationEngine";

// --- Couleurs design system ---
const COLORS = {
  primary: "#173F35",
  primaryDark: "#0f2b24",
  primaryMid: "#245B4B",
  primaryLight: "#2d7a63",
  primaryMuted: "#eaf2ef",
  accent: "#D6A84F",
  accentMuted: "#fdf5e6",
  bg: "#F7F8F6",
  surface: "#FFFFFF",
  text: "#182522",
  textSecondary: "#3d5450",
  textMuted: "#6b8278",
  border: "#d6e0dc",
  success: "#16a34a",
  successBg: "#f0fdf4",
};

// --- Styles PDF ---
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: COLORS.surface,
    padding: 0,
  },

  // Cover page
  coverPage: {
    fontFamily: "Helvetica",
    backgroundColor: COLORS.primary,
    padding: 0,
    flexDirection: "column",
  },
  coverTop: {
    padding: "60 50 40 50",
    flex: 1,
  },
  coverLogo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 60,
  },
  coverLogoIcon: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  coverLogoIconText: {
    color: COLORS.primary,
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
  },
  coverLogoText: {
    flexDirection: "column",
  },
  coverLogoTitle: {
    color: COLORS.surface,
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
  },
  coverLogoSub: {
    color: COLORS.accent,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
    marginTop: 2,
  },
  coverTag: {
    backgroundColor: "rgba(214,168,79,0.2)",
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 5,
    alignSelf: "flex-start",
    marginBottom: 30,
  },
  coverTagText: {
    color: COLORS.accent,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
  },
  coverTitle: {
    color: COLORS.surface,
    fontSize: 36,
    fontFamily: "Helvetica-Bold",
    lineHeight: 1.15,
    marginBottom: 16,
    maxWidth: 420,
  },
  coverSubtitle: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 13,
    lineHeight: 1.6,
    maxWidth: 380,
    marginBottom: 50,
  },
  coverMetaRow: {
    flexDirection: "row",
    gap: 20,
    flexWrap: "wrap",
  },
  coverMetaItem: {
    flexDirection: "column",
  },
  coverMetaLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.5,
    marginBottom: 3,
    textTransform: "uppercase",
  },
  coverMetaValue: {
    color: COLORS.surface,
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
  },
  coverBottom: {
    backgroundColor: COLORS.primaryDark,
    padding: "20 50",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  coverBottomText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 8,
  },
  coverBottomBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  coverBottomBadgeDot: {
    width: 6,
    height: 6,
    backgroundColor: COLORS.accent,
    borderRadius: 3,
  },
  coverBottomBadgeText: {
    color: COLORS.accent,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
  },

  // TOC page
  tocPage: {
    fontFamily: "Helvetica",
    backgroundColor: COLORS.surface,
    padding: "50 50 40 50",
  },
  tocHeader: {
    marginBottom: 30,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primaryMuted,
  },
  tocTag: {
    color: COLORS.accent,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
    marginBottom: 8,
  },
  tocTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
  },
  tocItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tocItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  tocItemNum: {
    width: 24,
    height: 24,
    backgroundColor: COLORS.primaryMuted,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  tocItemNumText: {
    color: COLORS.primary,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  tocItemTitle: {
    color: COLORS.text,
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    flex: 1,
  },
  tocItemDots: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    borderStyle: "dotted",
    marginHorizontal: 10,
  },
  tocItemPage: {
    color: COLORS.textMuted,
    fontSize: 10,
  },

  // Content page
  contentPage: {
    fontFamily: "Helvetica",
    backgroundColor: COLORS.surface,
    padding: 0,
    flexDirection: "column",
  },
  pageHeader: {
    backgroundColor: COLORS.primary,
    padding: "14 50",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pageHeaderTitle: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 8,
    letterSpacing: 1,
  },
  pageHeaderLogo: {
    color: COLORS.accent,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
  },
  pageBody: {
    padding: "30 50 20 50",
    flex: 1,
  },
  sectionTag: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionTagNum: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  sectionTagNumText: {
    color: COLORS.primary,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  sectionTagLabel: {
    color: COLORS.accent,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  sectionTitle: {
    color: COLORS.primary,
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
    lineHeight: 1.2,
  },
  sectionDivider: {
    height: 3,
    backgroundColor: COLORS.primaryMuted,
    marginBottom: 20,
    borderRadius: 2,
  },
  sectionDividerAccent: {
    height: 3,
    width: 40,
    backgroundColor: COLORS.accent,
    borderRadius: 2,
    marginTop: -3,
    marginBottom: 20,
  },
  bodyText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    lineHeight: 1.7,
    marginBottom: 10,
  },
  h2: {
    color: COLORS.primary,
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    marginTop: 16,
    marginBottom: 6,
  },
  h3: {
    color: COLORS.primaryMid,
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginTop: 12,
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 5,
    paddingLeft: 4,
  },
  bulletDot: {
    color: COLORS.accent,
    fontSize: 12,
    marginRight: 8,
    marginTop: -1,
  },
  bulletText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    lineHeight: 1.6,
    flex: 1,
  },

  // Financial table
  tableContainer: {
    marginVertical: 12,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tableHeader: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    padding: "8 12",
  },
  tableHeaderCell: {
    color: COLORS.surface,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    flex: 1,
    textAlign: "center",
  },
  tableHeaderCellLeft: {
    color: COLORS.surface,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    flex: 2,
  },
  tableRow: {
    flexDirection: "row",
    padding: "7 12",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tableRowAlt: {
    flexDirection: "row",
    padding: "7 12",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  tableRowTotal: {
    flexDirection: "row",
    padding: "8 12",
    backgroundColor: COLORS.primaryMuted,
  },
  tableCell: {
    color: COLORS.textSecondary,
    fontSize: 9,
    flex: 1,
    textAlign: "center",
  },
  tableCellLeft: {
    color: COLORS.text,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    flex: 2,
  },
  tableCellTotal: {
    color: COLORS.primary,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    flex: 1,
    textAlign: "center",
  },
  tableCellTotalLeft: {
    color: COLORS.primary,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    flex: 2,
  },

  // Info box
  infoBox: {
    backgroundColor: COLORS.primaryMuted,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    padding: "10 14",
    borderRadius: 4,
    marginVertical: 10,
  },
  infoBoxText: {
    color: COLORS.primaryMid,
    fontSize: 9,
    lineHeight: 1.6,
  },
  accentBox: {
    backgroundColor: COLORS.accentMuted,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
    padding: "10 14",
    borderRadius: 4,
    marginVertical: 10,
  },
  accentBoxText: {
    color: "#7a5a1a",
    fontSize: 9,
    lineHeight: 1.6,
  },

  // Page footer
  pageFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: "8 50",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pageFooterText: {
    color: COLORS.textMuted,
    fontSize: 7,
  },
  pageFooterPage: {
    color: COLORS.primary,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
  },
});

// --- Labels des sections ---
const SECTION_LABELS: Record<string, string> = {
  executiveSummary: "Sommaire exécutif",
  companyDescription: "Description de l'entreprise",
  missionVision: "Mission & Vision",
  productsServices: "Produits & Services",
  marketAnalysis: "Analyse de marché",
  competitiveAnalysis: "Analyse concurrentielle",
  marketingStrategy: "Stratégie marketing",
  operationsplan: "Plan opérationnel",
  managementTeam: "Équipe de direction",
  financialProjections: "Projections financières",
  fundingRequest: "Demande de financement",
  riskAnalysis: "Analyse des risques",
  swotAnalysis: "Analyse SWOT",
  implementationTimeline: "Calendrier d'implémentation",
  exitStrategy: "Stratégie de sortie",
  appendices: "Annexes",
  conclusion: "Conclusion",
};

// --- Utilitaires ---
function formatCurrency(n: number): string {
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function parseMarkdown(text: string): Array<{ type: string; content: string }> {
  const lines = text.split("\n");
  const result: Array<{ type: string; content: string }> = [];
  for (const line of lines) {
    if (line.startsWith("## ")) {
      result.push({ type: "h2", content: line.replace(/^## /, "") });
    } else if (line.startsWith("### ")) {
      result.push({ type: "h3", content: line.replace(/^### /, "") });
    } else if (line.startsWith("# ")) {
      result.push({ type: "h2", content: line.replace(/^# /, "") });
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      result.push({ type: "bullet", content: line.replace(/^[-*] /, "") });
    } else if (line.trim() === "") {
      // skip empty lines
    } else {
      result.push({ type: "p", content: line });
    }
  }
  return result;
}

function renderContent(text: string) {
  const blocks = parseMarkdown(text);
  return blocks.map((block, i) => {
    switch (block.type) {
      case "h2":
        return <Text key={i} style={styles.h2}>{block.content}</Text>;
      case "h3":
        return <Text key={i} style={styles.h3}>{block.content}</Text>;
      case "bullet":
        return (
          <View key={i} style={styles.bulletRow}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>{block.content}</Text>
          </View>
        );
      default:
        return <Text key={i} style={styles.bodyText}>{block.content}</Text>;
    }
  });
}

// --- Composant Cover ---
function CoverPage({ title, businessType, sector, country, date }: {
  title: string;
  businessType?: string;
  sector?: string;
  country?: string;
  date: string;
}) {
  return (
    <Page size="A4" style={styles.coverPage}>
      <View style={styles.coverTop}>
        {/* Logo */}
        <View style={styles.coverLogo}>
          <View style={styles.coverLogoIcon}>
            <Text style={styles.coverLogoIconText}>✦</Text>
          </View>
          <View style={styles.coverLogoText}>
            <Text style={styles.coverLogoTitle}>Business Plan</Text>
            <Text style={styles.coverLogoSub}>AI STUDIO</Text>
          </View>
        </View>

        {/* Tag */}
        <View style={styles.coverTag}>
          <Text style={styles.coverTagText}>PLAN D'AFFAIRES PROFESSIONNEL</Text>
        </View>

        {/* Title */}
        <Text style={styles.coverTitle}>{title}</Text>
        <Text style={styles.coverSubtitle}>
          Généré par intelligence artificielle · Modèle financier déterministe · Norme Canada/USA
        </Text>

        {/* Meta */}
        <View style={styles.coverMetaRow}>
          {businessType && (
            <View style={styles.coverMetaItem}>
              <Text style={styles.coverMetaLabel}>Type</Text>
              <Text style={styles.coverMetaValue}>{businessType}</Text>
            </View>
          )}
          {sector && (
            <View style={styles.coverMetaItem}>
              <Text style={styles.coverMetaLabel}>Secteur</Text>
              <Text style={styles.coverMetaValue}>{sector}</Text>
            </View>
          )}
          {country && (
            <View style={styles.coverMetaItem}>
              <Text style={styles.coverMetaLabel}>Marché</Text>
              <Text style={styles.coverMetaValue}>{country}</Text>
            </View>
          )}
          <View style={styles.coverMetaItem}>
            <Text style={styles.coverMetaLabel}>Date</Text>
            <Text style={styles.coverMetaValue}>{date}</Text>
          </View>
        </View>
      </View>

      {/* Bottom bar */}
      <View style={styles.coverBottom}>
        <Text style={styles.coverBottomText}>Confidentiel · Usage commercial autorisé</Text>
        <View style={styles.coverBottomBadge}>
          <View style={styles.coverBottomBadgeDot} />
          <Text style={styles.coverBottomBadgeText}>AI STUDIO</Text>
        </View>
      </View>
    </Page>
  );
}

// --- TOC Page ---
function TOCPage({ sections }: { sections: GeneratedSections }) {
  const sectionKeys = Object.keys(sections);
  return (
    <Page size="A4" style={styles.tocPage}>
      <View style={styles.tocHeader}>
        <Text style={styles.tocTag}>NAVIGATION</Text>
        <Text style={styles.tocTitle}>Table des matières</Text>
      </View>
      {sectionKeys.map((key, i) => (
        <View key={key} style={styles.tocItem}>
          <View style={styles.tocItemLeft}>
            <View style={styles.tocItemNum}>
              <Text style={styles.tocItemNumText}>{i + 1}</Text>
            </View>
            <Text style={styles.tocItemTitle}>
              {SECTION_LABELS[key] ?? key}
            </Text>
          </View>
          <Text style={styles.tocItemPage}>{i + 3}</Text>
        </View>
      ))}
    </Page>
  );
}

// --- Content Page ---
function ContentPage({
  sectionKey,
  sectionNum,
  content,
  planTitle,
}: {
  sectionKey: string;
  sectionNum: number;
  content: string;
  planTitle: string;
}) {
  const label = SECTION_LABELS[sectionKey] ?? sectionKey;
  return (
    <Page size="A4" style={styles.contentPage}>
      {/* Header */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageHeaderTitle}>{planTitle.toUpperCase()}</Text>
        <Text style={styles.pageHeaderLogo}>AI STUDIO</Text>
      </View>

      {/* Body */}
      <View style={styles.pageBody}>
        {/* Section tag */}
        <View style={styles.sectionTag}>
          <View style={styles.sectionTagNum}>
            <Text style={styles.sectionTagNumText}>{sectionNum}</Text>
          </View>
          <Text style={styles.sectionTagLabel}>{label}</Text>
        </View>

        {/* Title + divider */}
        <Text style={styles.sectionTitle}>{label}</Text>
        <View style={styles.sectionDivider} />
        <View style={styles.sectionDividerAccent} />

        {/* Content */}
        {renderContent(content)}
      </View>

      {/* Footer */}
      <View style={styles.pageFooter}>
        <Text style={styles.pageFooterText}>Business Plan AI Studio · Confidentiel</Text>
        <Text style={styles.pageFooterPage}>Section {sectionNum} / {Object.keys(SECTION_LABELS).length}</Text>
      </View>
    </Page>
  );
}

// --- Financial Page ---
function FinancialPage({
  financials,
  planTitle,
}: {
  financials: Record<string, unknown>;
  planTitle: string;
}) {
  const revenues = (financials as { projections?: { revenues?: number[] } })?.projections?.revenues ?? [0, 0, 0];
  const expenses = (financials as { projections?: { expenses?: number[] } })?.projections?.expenses ?? [0, 0, 0];
  const ebitda = revenues.map((r, i) => r - (expenses[i] ?? 0));

  return (
    <Page size="A4" style={styles.contentPage}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageHeaderTitle}>{planTitle.toUpperCase()}</Text>
        <Text style={styles.pageHeaderLogo}>AI STUDIO</Text>
      </View>

      <View style={styles.pageBody}>
        <View style={styles.sectionTag}>
          <View style={styles.sectionTagNum}>
            <Text style={styles.sectionTagNumText}>F</Text>
          </View>
          <Text style={styles.sectionTagLabel}>Données financières</Text>
        </View>

        <Text style={styles.sectionTitle}>Projections Financières</Text>
        <View style={styles.sectionDivider} />
        <View style={styles.sectionDividerAccent} />

        <View style={styles.infoBox}>
          <Text style={styles.infoBoxText}>
            Les projections ci-dessous sont calculées par un moteur financier déterministe,
            indépendant de l'IA, basé sur vos hypothèses de départ.
          </Text>
        </View>

        {/* Table CA / Charges / EBITDA */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCellLeft}>Indicateur</Text>
            <Text style={styles.tableHeaderCell}>Année 1</Text>
            <Text style={styles.tableHeaderCell}>Année 2</Text>
            <Text style={styles.tableHeaderCell}>Année 3</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellLeft}>Chiffre d'affaires</Text>
            <Text style={styles.tableCell}>{formatCurrency(revenues[0] ?? 0)}</Text>
            <Text style={styles.tableCell}>{formatCurrency(revenues[1] ?? 0)}</Text>
            <Text style={styles.tableCell}>{formatCurrency(revenues[2] ?? 0)}</Text>
          </View>
          <View style={styles.tableRowAlt}>
            <Text style={styles.tableCellLeft}>Charges d'exploitation</Text>
            <Text style={styles.tableCell}>{formatCurrency(expenses[0] ?? 0)}</Text>
            <Text style={styles.tableCell}>{formatCurrency(expenses[1] ?? 0)}</Text>
            <Text style={styles.tableCell}>{formatCurrency(expenses[2] ?? 0)}</Text>
          </View>
          <View style={styles.tableRowTotal}>
            <Text style={styles.tableCellTotalLeft}>EBITDA</Text>
            <Text style={styles.tableCellTotal}>{formatCurrency(ebitda[0] ?? 0)}</Text>
            <Text style={styles.tableCellTotal}>{formatCurrency(ebitda[1] ?? 0)}</Text>
            <Text style={styles.tableCellTotal}>{formatCurrency(ebitda[2] ?? 0)}</Text>
          </View>
        </View>

        {/* Breakeven */}
        {(financials as { breakeven?: number })?.breakeven && (
          <View style={styles.accentBox}>
            <Text style={styles.accentBoxText}>
              📍 Point mort estimé : {formatCurrency((financials as { breakeven?: number }).breakeven!)} de chiffre d'affaires annuel
            </Text>
          </View>
        )}

        {/* Funding need */}
        {(financials as { fundingNeed?: number })?.fundingNeed && (
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxText}>
              💰 Besoin de financement : {formatCurrency((financials as { fundingNeed?: number }).fundingNeed!)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.pageFooter}>
        <Text style={styles.pageFooterText}>Business Plan AI Studio · Confidentiel</Text>
        <Text style={styles.pageFooterPage}>Modèle Financier</Text>
      </View>
    </Page>
  );
}

// --- Document principal ---
function BusinessPlanDocument({
  title,
  businessType,
  sector,
  country,
  sections,
  financials,
}: {
  title: string;
  businessType?: string;
  sector?: string;
  country?: string;
  sections: GeneratedSections;
  financials?: Record<string, unknown> | null;
}) {
  const date = new Date().toLocaleDateString("fr-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const dateStr = date.charAt(0).toUpperCase() + date.slice(1);

  const sectionKeys = Object.keys(sections);

  return (
    <Document
      title={title}
      author="Business Plan AI Studio"
      subject="Plan d'affaires professionnel"
      keywords="business plan, plan affaires, Canada"
    >
      {/* Cover */}
      <CoverPage
        title={title}
        businessType={businessType}
        sector={sector}
        country={country}
        date={dateStr}
      />

      {/* TOC */}
      <TOCPage sections={sections} />

      {/* Sections */}
      {sectionKeys.map((key, i) => {
        const section = sections[key as keyof GeneratedSections];
        const content = typeof section === "string"
          ? section
          : typeof section === "object" && section !== null && "content" in section
            ? (section as { content: string }).content
            : JSON.stringify(section);

        return (
          <ContentPage
            key={key}
            sectionKey={key}
            sectionNum={i + 1}
            content={content}
            planTitle={title}
          />
        );
      })}

      {/* Financial page */}
      {financials && (
        <FinancialPage financials={financials} planTitle={title} />
      )}
    </Document>
  );
}

// --- Export function ---
export async function generatePDF(params: {
  title: string;
  businessType?: string;
  sector?: string;
  country?: string;
  sections: GeneratedSections;
  financials?: Record<string, unknown> | null;
}): Promise<Buffer> {
  const doc = (
    <BusinessPlanDocument
      title={params.title}
      businessType={params.businessType}
      sector={params.sector}
      country={params.country}
      sections={params.sections}
      financials={params.financials}
    />
  );

  const buffer = await renderToBuffer(doc);
  return buffer;
}
