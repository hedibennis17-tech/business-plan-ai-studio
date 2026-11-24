/**
 * Phase 5 — API Export PDF + DOCX
 * GET /api/plans/[id]/export?format=pdf|docx
 * Ownership check + génération
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generatePDF } from "@/lib/exportPDF";
import { generateDOCX } from "@/lib/exportDOCX";
import type { GeneratedSections } from "@/lib/generationEngine";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const format = req.nextUrl.searchParams.get("format") ?? "pdf";

    if (!["pdf", "docx"].includes(format)) {
      return NextResponse.json({ error: "Format invalide. Utiliser pdf ou docx." }, { status: 400 });
    }

    // Auth
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    // Ownership check
    const plan = await prisma.businessPlan.findFirst({
      where: { id, user: { email: session.user.email } },
      select: {
        id: true,
        title: true,
        generationStatus: true,
        generatedSections: true,
        financialAssumptions: true,
        step2Data: true,
        isPaid: true,
      },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan introuvable." }, { status: 404 });
    }

    if (plan.generationStatus !== "GENERATED" || !plan.generatedSections) {
      return NextResponse.json(
        { error: "Le plan n'est pas encore généré. Veuillez d'abord générer votre plan." },
        { status: 422 }
      );
    }

    // Protection premium — export bloqué avant paiement
    if (!plan.isPaid) {
      return NextResponse.json(
        { error: "Paiement requis pour télécharger le plan complet.", code: "PAYMENT_REQUIRED" },
        { status: 402 }
      );
    }

    // Extraire métadonnées step2
    const step2 = plan.step2Data as Record<string, string> | null;
    const businessType = step2?.businessType ?? undefined;
    const sector = step2?.sector ?? undefined;
    const country = step2?.country ?? undefined;

    const sections = plan.generatedSections as unknown as GeneratedSections;
    const financials = plan.financialAssumptions as Record<string, unknown> | null;

    const exportParams = {
      title: plan.title,
      businessType,
      sector,
      country,
      sections,
      financials,
    };

    if (format === "pdf") {
      const pdfBuffer = await generatePDF(exportParams);
      const filename = encodeURIComponent(
        `business-plan-${plan.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf`
      );
      return new NextResponse(new Uint8Array(pdfBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Content-Length": pdfBuffer.length.toString(),
          "Cache-Control": "no-store",
        },
      });
    } else {
      // DOCX
      const docxBuffer = await generateDOCX(exportParams);
      const filename = encodeURIComponent(
        `business-plan-${plan.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.docx`
      );
      return new NextResponse(new Uint8Array(docxBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Content-Length": docxBuffer.length.toString(),
          "Cache-Control": "no-store",
        },
      });
    }
  } catch (error) {
    console.error("[export] Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du fichier." },
      { status: 500 }
    );
  }
}
