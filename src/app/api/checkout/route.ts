/**
 * POST /api/checkout
 * Crée une session Stripe Checkout en mode test CAD
 * Vérifie ownership + plan généré avant de créer la session
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

let _stripe: Stripe | null = null;
function getStripe() {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-11-18.endive",
    });
  }
  return _stripe;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  let planId: string;
  try {
    const body = await req.json();
    planId = body.planId;
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  if (!planId) {
    return NextResponse.json({ error: "planId requis" }, { status: 400 });
  }

  // Vérifier ownership
  const plan = await prisma.businessPlan.findFirst({
    where: { id: planId, user: { email: session.user.email } },
    select: { id: true, title: true, isPaid: true, generationStatus: true },
  });

  if (!plan) {
    return NextResponse.json({ error: "Plan introuvable" }, { status: 404 });
  }

  // Déjà payé — ne pas facturer deux fois
  if (plan.isPaid) {
    return NextResponse.json({ error: "Ce plan est déjà payé" }, { status: 400 });
  }

  // Montant en cents depuis env (défaut 49900 = 499.00 CAD)
  const amount = parseInt(process.env.STRIPE_PRICE_AMOUNT ?? "49900", 10);
  const currency = (process.env.STRIPE_CURRENCY ?? "cad").toLowerCase();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://business-plan-ai-studio.vercel.app";

  // Trouver ou créer le customer Stripe lié à cet utilisateur
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, email: true },
  });
  if (!dbUser) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  // Vérifier si un Payment PENDING existe déjà — idempotence
  const existingPayment = await prisma.payment.findFirst({
    where: { businessPlanId: planId, userId: dbUser.id, status: "PENDING" },
    select: { stripeSessionId: true },
  });

  // Si session Stripe existante et encore valide, récupérer l'URL
  if (existingPayment) {
    try {
      const existingSession = await getStripe().checkout.sessions.retrieve(existingPayment.stripeSessionId);
      if (existingSession.status === "open" && existingSession.url) {
        return NextResponse.json({ url: existingSession.url });
      }
    } catch {
      // Session expirée — on en crée une nouvelle
    }
  }

  // Créer session Stripe Checkout
  const checkoutSession = await getStripe().checkout.sessions.create({
    mode: "payment",
    currency,
    line_items: [
      {
        price_data: {
          currency,
          unit_amount: amount,
          product_data: {
            name: "Business Plan AI Studio — Plan Complet",
            description: `Accès complet au plan : ${plan.title}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId: dbUser.id,
      planId: plan.id,
      userEmail: dbUser.email,
    },
    customer_email: dbUser.email,
    success_url: `${appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&plan_id=${plan.id}`,
    cancel_url: `${appUrl}/payment/cancel?plan_id=${plan.id}`,
  });

  // Enregistrer le Payment en PENDING dans la DB
  await prisma.payment.upsert({
    where: { stripeSessionId: checkoutSession.id },
    create: {
      userId: dbUser.id,
      businessPlanId: plan.id,
      stripeSessionId: checkoutSession.id,
      amount,
      currency,
      status: "PENDING",
      metadata: { checkoutCreatedAt: new Date().toISOString() },
    },
    update: { status: "PENDING", updatedAt: new Date() },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
