/**
 * GET  /api/support — liste les tickets de l'utilisateur connecté
 * POST /api/support — crée un nouveau ticket
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supportTicket } from "@/lib/prisma-ext";
import { sendEmail } from "@/lib/email";


export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const tickets = await supportTicket.findMany({
    where: { userId: session.user.id },
    include: { messages: { orderBy: { createdAt: "asc" }, take: 1 } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ tickets });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { subject, message, businessPlanId } = await req.json();
  if (!subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Sujet et message requis" }, { status: 400 });
  }

  const ticket = await supportTicket.create({
    data: {
      userId: session.user.id,
      subject: subject.trim(),
      businessPlanId: businessPlanId ?? null,
      messages: {
        create: {
          userId: session.user.id,
          content: message.trim(),
          isAdmin: false,
        },
      },
    },
    include: { messages: true },
  });

  // Email de confirmation
  if (session.user.email) {
    await sendEmail({
      to: session.user.email,
      type: "TICKET_CREATED",
      subject: `Votre demande de support #${ticket.id.slice(-6).toUpperCase()} a été reçue`,
      ticketId: ticket.id.slice(-6).toUpperCase(),
      ticketMessage: message.trim(),
      userName: session.user.name ?? undefined,
    }).catch((e) => console.error("[Support] Email échec:", e));
  }

  return NextResponse.json({ ticket }, { status: 201 });
}
