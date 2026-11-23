/**
 * Phase 3 — API Plan individuel
 * GET    /api/plans/[id]  → retourne le plan complet (si propriétaire)
 * DELETE /api/plans/[id]  → supprime le plan (si propriétaire)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

async function getPlanForUser(planId: string, userEmail: string) {
  return prisma.businessPlan.findFirst({
    where: {
      id: planId,
      user: { email: userEmail },
    },
  });
}

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

  try {
    const plan = await getPlanForUser(id, session.user.email);
    if (!plan) return NextResponse.json({ error: "Plan introuvable" }, { status: 404 });

    return NextResponse.json({ plan });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error("[GET /api/plans/id]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

  try {
    const plan = await getPlanForUser(id, session.user.email);
    if (!plan) return NextResponse.json({ error: "Plan introuvable" }, { status: 404 });

    await prisma.businessPlan.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error("[DELETE /api/plans/id]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
