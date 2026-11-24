/**
 * GET /api/checkout/verify?session_id=...&plan_id=...
 * Vérifie si un paiement est COMPLETED — utilisé par la page success
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ paid: false }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");
  const planId = searchParams.get("plan_id");

  if (!sessionId || !planId) {
    return NextResponse.json({ paid: false }, { status: 400 });
  }

  const payment = await prisma.payment.findUnique({
    where: { stripeSessionId: sessionId },
    select: { status: true, businessPlanId: true, userId: true },
  });

  if (!payment || payment.userId !== session.user.id || payment.businessPlanId !== planId) {
    return NextResponse.json({ paid: false });
  }

  return NextResponse.json({ paid: payment.status === "COMPLETED" });
}
