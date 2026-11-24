/**
 * GET  /api/support/[id] — détail d'un ticket
 * POST /api/support/[id] — ajouter un message
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supportTicket, ticketMessage } from "@/lib/prisma-ext";


export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const ticket = await supportTicket.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { name: true, email: true, role: true } } },
      },
    },
  });

  if (!ticket || ticket.userId !== session.user.id) {
    return NextResponse.json({ error: "Ticket introuvable" }, { status: 404 });
  }

  return NextResponse.json({ ticket });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const { message } = await req.json();
  if (!message?.trim()) return NextResponse.json({ error: "Message requis" }, { status: 400 });

  const ticket = await supportTicket.findUnique({ where: { id }, select: { userId: true, status: true } });
  if (!ticket || ticket.userId !== session.user.id) {
    return NextResponse.json({ error: "Ticket introuvable" }, { status: 404 });
  }
  if (ticket.status === "CLOSED") {
    return NextResponse.json({ error: "Ticket fermé" }, { status: 409 });
  }

  const msg = await ticketMessage.create({
    data: { ticketId: id, userId: session.user.id, content: message.trim(), isAdmin: false },
  });

  // Réouvrir si RESOLVED
  if (ticket.status === "RESOLVED") {
    await supportTicket.update({ where: { id }, data: { status: "OPEN", updatedAt: new Date() } });
  } else {
    await supportTicket.update({ where: { id }, data: { updatedAt: new Date() } });
  }

  return NextResponse.json({ message: msg }, { status: 201 });
}
