/**
 * Phase 3 — API Plans
 * GET  /api/plans  → liste les plans de l'utilisateur connecté
 * POST /api/plans  → crée un nouveau plan
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/ratelimit";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const plans = await prisma.businessPlan.findMany({
      where: { user: { email: session.user.email } },
      select: {
        id: true,
        title: true,
        status: true,
        currentStep: true,
        completedSteps: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ plans });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error("[GET /api/plans]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const rl = await checkRateLimit(req, "api");
  if (rl) return rl;

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

    const plan = await prisma.businessPlan.create({
      data: {
        userId: user.id,
        title: "Mon plan d'affaires",
        status: "DRAFT",
        currentStep: 1,
        completedSteps: [],
      },
      select: {
        id: true,
        title: true,
        status: true,
        currentStep: true,
        completedSteps: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ plan }, { status: 201 });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error("[POST /api/plans]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
