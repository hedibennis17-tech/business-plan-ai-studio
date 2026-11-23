/**
 * Phase 5 — Export DOCX Professionnel
 * Utilise docx pour générer un Word éditable premium
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  AlignmentType,
  PageBreak,
  PageNumber,
  NumberFormat,
  Header,
  Footer,
  HorizontalPositionAlign,
  VerticalPositionAlign,
} from "docx";
import type { GeneratedSections } from "./generationEngine";

// Couleurs (hex sans #)
const COLORS = {
  primary: "173F35",
  primaryMid: "245B4B",
  primaryLight: "2d7a63",
  primaryMuted: "eaf2ef",
  accent: "D6A84F",
  accentMuted: "fdf5e6",
  bg: "F7F8F6",
  surface: "FFFFFF",
  text: "182522",
  textSecondary: "3d5450",
  textMuted: "6b8278",
  border: "d6e0dc",
  success: "16a34a",
};

// Labels sections
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

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

// Parser markdown en paragraphes docx
function parseMarkdownToParagraphs(text: string): Paragraph[] {
  const lines = text.split("\n");
  const paragraphs: Paragraph[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    if (line.startsWith("## ") || line.startsWith("### ")) {
      const content = line.replace(/^#{2,3} /, "");
      paragraphs.push(
        new Paragraph({
          text: content,
          heading: line.startsWith("### ") ? HeadingLevel.HEADING_3 : HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
          run: {
            bold: true,
            color: COLORS.primary,
          },
        })
      );
    } else if (line.startsWith("# ")) {
      const content = line.replace(/^# /, "");
      paragraphs.push(
        new Paragraph({
          text: content,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
        })
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      const content = line.replace(/^[-*] /, "");
      paragraphs.push(
        new Paragraph({
          bullet: { level: 0 },
          children: [
            new TextRun({
              text: content,
              color: COLORS.textSecondary,
              size: 22,
            }),
          ],
          spacing: { before: 60, after: 60 },
        })
      );
    } else {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              color: COLORS.textSecondary,
              size: 22,
            }),
          ],
          spacing: { before: 80, after: 80 },
          alignment: AlignmentType.JUSTIFIED,
        })
      );
    }
  }

  return paragraphs;
}

// Page de garde
function createCoverPage(params: {
  title: string;
  businessType?: string;
  sector?: string;
  country?: string;
  date: string;
}): Paragraph[] {
  const { title, businessType, sector, country, date } = params;
  const elements: Paragraph[] = [];

  // Espacement top
  elements.push(new Paragraph({ text: "", spacing: { before: 2400 } }));

  // Studio label
  elements.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "✦  BUSINESS PLAN AI STUDIO  ✦",
          bold: true,
          color: COLORS.accent,
          size: 18,
          characterSpacing: 150,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 480 },
    })
  );

  // Title
  elements.push(
    new Paragraph({
      children: [
        new TextRun({
          text: title,
          bold: true,
          color: COLORS.primary,
          size: 72,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 240 },
    })
  );

  // Subtitle
  elements.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Plan d'affaires professionnel · Norme Canada/USA",
          color: COLORS.textMuted,
          size: 24,
          italics: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 720 },
    })
  );

  // Divider
  elements.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "─────────────────────────────────",
          color: COLORS.accent,
          size: 24,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 480 },
    })
  );

  // Meta info
  const metaItems: string[] = [];
  if (businessType) metaItems.push(`Type : ${businessType}`);
  if (sector) metaItems.push(`Secteur : ${sector}`);
  if (country) metaItems.push(`Marché : ${country}`);
  metaItems.push(`Date : ${date}`);

  for (const item of metaItems) {
    elements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: item,
            color: COLORS.textSecondary,
            size: 22,
            bold: false,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 60, after: 60 },
      })
    );
  }

  // Confidentiality note
  elements.push(new Paragraph({ text: "", spacing: { before: 720 } }));
  elements.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Document confidentiel · Usage commercial autorisé · Généré par intelligence artificielle",
          color: COLORS.textMuted,
          size: 18,
          italics: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0 },
    })
  );

  // Page break
  elements.push(new Paragraph({ children: [new PageBreak()] }));

  return elements;
}

// Table des matières
function createTOC(sections: GeneratedSections): Paragraph[] {
  const elements: Paragraph[] = [];

  elements.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "TABLE DES MATIÈRES",
          bold: true,
          color: COLORS.accent,
          size: 18,
          characterSpacing: 150,
        }),
      ],
      spacing: { before: 480, after: 240 },
    })
  );

  elements.push(
    new Paragraph({
      text: "Table des matières",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 0, after: 480 },
    })
  );

  const sectionKeys = Object.keys(sections);
  sectionKeys.forEach((key, i) => {
    const label = SECTION_LABELS[key] ?? key;
    elements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${(i + 1).toString().padStart(2, "0")}  `,
            bold: true,
            color: COLORS.accent,
            size: 22,
          }),
          new TextRun({
            text: label,
            color: COLORS.text,
            size: 22,
          }),
        ],
        spacing: { before: 120, after: 120 },
        border: {
          bottom: {
            color: COLORS.border,
            space: 1,
            style: BorderStyle.SINGLE,
            size: 1,
          },
        },
      })
    );
  });

  elements.push(new Paragraph({ children: [new PageBreak()] }));
  return elements;
}

// Financial table
function createFinancialTable(financials: Record<string, unknown>): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];
  const revenues = (financials as { projections?: { revenues?: number[] } })?.projections?.revenues ?? [0, 0, 0];
  const expenses = (financials as { projections?: { expenses?: number[] } })?.projections?.expenses ?? [0, 0, 0];
  const ebitda = revenues.map((r, i) => r - (expenses[i] ?? 0));

  elements.push(
    new Paragraph({
      text: "Projections Financières sur 3 Ans",
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 480, after: 240 },
    })
  );

  const makeCell = (text: string, isHeader = false, isTotal = false) =>
    new TableCell({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text,
              bold: isHeader || isTotal,
              color: isHeader ? COLORS.surface : isTotal ? COLORS.primary : COLORS.textSecondary,
              size: 20,
            }),
          ],
          alignment: AlignmentType.CENTER,
        }),
      ],
      shading: isHeader
        ? { type: ShadingType.SOLID, color: COLORS.primary, fill: COLORS.primary }
        : isTotal
        ? { type: ShadingType.SOLID, color: COLORS.primaryMuted, fill: COLORS.primaryMuted }
        : { type: ShadingType.CLEAR, color: "auto", fill: "auto" },
      margins: { top: 100, bottom: 100, left: 100, right: 100 },
    });

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          makeCell("Indicateur", true),
          makeCell("Année 1", true),
          makeCell("Année 2", true),
          makeCell("Année 3", true),
        ],
        tableHeader: true,
      }),
      new TableRow({
        children: [
          makeCell("Chiffre d'affaires"),
          makeCell(formatCurrency(revenues[0] ?? 0)),
          makeCell(formatCurrency(revenues[1] ?? 0)),
          makeCell(formatCurrency(revenues[2] ?? 0)),
        ],
      }),
      new TableRow({
        children: [
          makeCell("Charges d'exploitation"),
          makeCell(formatCurrency(expenses[0] ?? 0)),
          makeCell(formatCurrency(expenses[1] ?? 0)),
          makeCell(formatCurrency(expenses[2] ?? 0)),
        ],
      }),
      new TableRow({
        children: [
          makeCell("EBITDA", false, true),
          makeCell(formatCurrency(ebitda[0] ?? 0), false, true),
          makeCell(formatCurrency(ebitda[1] ?? 0), false, true),
          makeCell(formatCurrency(ebitda[2] ?? 0), false, true),
        ],
      }),
    ],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
      left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
      right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
      insideH: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
      insideV: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
    },
  });

  elements.push(table);

  const breakeven = (financials as { breakeven?: number })?.breakeven;
  const fundingNeed = (financials as { fundingNeed?: number })?.fundingNeed;

  if (breakeven) {
    elements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `📍 Point mort : ${formatCurrency(breakeven)}`,
            color: COLORS.accent,
            bold: true,
            size: 22,
          }),
        ],
        spacing: { before: 240, after: 120 },
      })
    );
  }

  if (fundingNeed) {
    elements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `💰 Besoin de financement : ${formatCurrency(fundingNeed)}`,
            color: COLORS.primary,
            bold: true,
            size: 22,
          }),
        ],
        spacing: { before: 120, after: 240 },
      })
    );
  }

  return elements;
}

// --- Generate DOCX ---
export async function generateDOCX(params: {
  title: string;
  businessType?: string;
  sector?: string;
  country?: string;
  sections: GeneratedSections;
  financials?: Record<string, unknown> | null;
}): Promise<Buffer> {
  const { title, businessType, sector, country, sections, financials } = params;

  const date = new Date().toLocaleDateString("fr-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const dateStr = date.charAt(0).toUpperCase() + date.slice(1);

  // Assembler le contenu
  const children: (Paragraph | Table)[] = [];

  // Cover
  children.push(...createCoverPage({ title, businessType, sector, country, date: dateStr }));

  // TOC
  children.push(...createTOC(sections));

  // Sections
  const sectionKeys = Object.keys(sections);
  for (let i = 0; i < sectionKeys.length; i++) {
    const key = sectionKeys[i];
    const label = SECTION_LABELS[key] ?? key;
    const section = sections[key as keyof GeneratedSections];
    const content = typeof section === "string"
      ? section
      : typeof section === "object" && section !== null && "content" in section
        ? (section as { content: string }).content
        : JSON.stringify(section);

    // Section number badge
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `SECTION ${(i + 1).toString().padStart(2, "0")}  ·  ${label.toUpperCase()}`,
            bold: true,
            color: COLORS.accent,
            size: 18,
            characterSpacing: 100,
          }),
        ],
        spacing: { before: i === 0 ? 0 : 480, after: 120 },
      })
    );

    // Section heading
    children.push(
      new Paragraph({
        text: label,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 0, after: 240 },
      })
    );

    // Content
    const contentParas = parseMarkdownToParagraphs(content);
    children.push(...contentParas);

    // Page break entre sections (sauf dernière)
    if (i < sectionKeys.length - 1) {
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }
  }

  // Financial section
  if (financials) {
    children.push(new Paragraph({ children: [new PageBreak()] }));
    children.push(...createFinancialTable(financials));
  }

  const doc = new Document({
    title,
    description: "Plan d'affaires professionnel généré par Business Plan AI Studio",
    creator: "Business Plan AI Studio",
    styles: {
      default: {
        document: {
          run: {
            font: "Calibri",
            size: 22,
            color: COLORS.text,
          },
          paragraph: {
            spacing: { line: 276 },
          },
        },
        heading1: {
          run: {
            font: "Calibri",
            size: 40,
            bold: true,
            color: COLORS.primary,
          },
          paragraph: {
            spacing: { before: 480, after: 240 },
          },
        },
        heading2: {
          run: {
            font: "Calibri",
            size: 28,
            bold: true,
            color: COLORS.primaryMid,
          },
          paragraph: {
            spacing: { before: 240, after: 120 },
          },
        },
        heading3: {
          run: {
            font: "Calibri",
            size: 24,
            bold: true,
            color: COLORS.primaryLight,
          },
          paragraph: {
            spacing: { before: 180, after: 60 },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1134, // ~2cm
              right: 1134,
              bottom: 1134,
              left: 1134,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${title}  ·  Business Plan AI Studio`,
                    color: COLORS.textMuted,
                    size: 16,
                    italics: true,
                  }),
                ],
                border: {
                  bottom: {
                    color: COLORS.border,
                    space: 1,
                    style: BorderStyle.SINGLE,
                    size: 1,
                  },
                },
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Business Plan AI Studio  ·  Confidentiel  ·  Page ",
                    color: COLORS.textMuted,
                    size: 16,
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    color: COLORS.primary,
                    size: 16,
                    bold: true,
                  }),
                  new TextRun({
                    text: " / ",
                    color: COLORS.textMuted,
                    size: 16,
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    color: COLORS.textMuted,
                    size: 16,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                border: {
                  top: {
                    color: COLORS.border,
                    space: 1,
                    style: BorderStyle.SINGLE,
                    size: 1,
                  },
                },
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
}
