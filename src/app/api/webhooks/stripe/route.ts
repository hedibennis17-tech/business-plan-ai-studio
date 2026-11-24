/**
 * POST /api/webhooks/stripe
 * Webhook Stripe — vérifie la signature, traite les événements
 * Idempotent — safe si Stripe renvoie le même événement plusieurs fois
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { sendEmail } from "@/lib/email";

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
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[Webhook] STRIPE_WEBHOOK_SECRET manquant");
    return NextResponse.json({ error: "Configuration webhook manquante" }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("[Webhook] Signature invalide:", err);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  // Idempotence — vérifier si déjà traité via metadata
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutExpired(session);
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(pi);
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleRefund(charge);
        break;
      }
      default:
        // Ignorer les événements non gérés
        break;
    }
  } catch (err) {
    console.error(`[Webhook] Erreur traitement ${event.type}:`, err);
    return NextResponse.json({ error: "Erreur traitement" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { userId, planId, userEmail } = session.metadata ?? {};
  if (!userId || !planId) {
    console.error("[Webhook] Metadata manquante dans checkout.session.completed");
    return;
  }

  // Idempotence — si déjà COMPLETED, skip
  const existing = await prisma.payment.findUnique({
    where: { stripeSessionId: session.id },
    select: { status: true },
  });
  if (existing?.status === "COMPLETED") return;

  const paymentIntentId = typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent?.id;

  // Extraire l'ID customer (peut être string, objet Customer ou DeletedCustomer)
  const stripeCustomerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id ?? null;

  // Mettre à jour ou créer le payment record
  await prisma.payment.upsert({
    where: { stripeSessionId: session.id },
    create: {
      userId,
      businessPlanId: planId,
      stripeSessionId: session.id,
      stripePaymentIntentId: paymentIntentId,
      amount: session.amount_total ?? 49900,
      currency: session.currency ?? "cad",
      status: "COMPLETED",
      metadata: {
        stripeCustomerId,
        completedAt: new Date().toISOString(),
      },
    },
    update: {
      status: "COMPLETED",
      stripePaymentIntentId: paymentIntentId,
      metadata: {
        stripeCustomerId,
        completedAt: new Date().toISOString(),
      },
      updatedAt: new Date(),
    },
  });

  // Débloquer le plan
  await prisma.businessPlan.update({
    where: { id: planId },
    data: { isPaid: true, paidAt: new Date() },
  });

  // Email confirmation paiement
  if (userEmail) {
    const plan = await prisma.businessPlan.findUnique({
      where: { id: planId },
      select: { title: true },
    });
    await sendEmail({
      to: userEmail,
      type: "PAYMENT_SUCCESS",
      subject: "✅ Paiement confirmé — Business Plan AI Studio",
      planTitle: plan?.title,
    }).catch((e) => console.error("[Webhook] Email échec:", e));
  }
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  await prisma.payment.updateMany({
    where: { stripeSessionId: session.id, status: "PENDING" },
    data: { status: "FAILED", updatedAt: new Date() },
  });
}

async function handlePaymentFailed(pi: Stripe.PaymentIntent) {
  if (!pi.latest_charge) return;
  await prisma.payment.updateMany({
    where: { stripePaymentIntentId: pi.id, status: "PENDING" },
    data: {
      status: "FAILED",
      metadata: { failureReason: pi.last_payment_error?.message ?? "Inconnu" },
      updatedAt: new Date(),
    },
  });
}

async function handleRefund(charge: Stripe.Charge) {
  const piId = typeof charge.payment_intent === "string"
    ? charge.payment_intent
    : charge.payment_intent?.id;
  if (!piId) return;

  const payment = await prisma.payment.findFirst({
    where: { stripePaymentIntentId: piId },
    select: { id: true, businessPlanId: true },
  });
  if (!payment) return;

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "REFUNDED",
      metadata: { refundedAt: new Date().toISOString(), chargeId: charge.id },
      updatedAt: new Date(),
    },
  });

  // Révoquer l'accès premium après remboursement
  await prisma.businessPlan.update({
    where: { id: payment.businessPlanId },
    data: { isPaid: false },
  });
}
