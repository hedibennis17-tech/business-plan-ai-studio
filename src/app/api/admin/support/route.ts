/**
 * GET  /api/admin/support — liste tous les tickets (admin)
 * PATCH /api/admin/support — répondre ou changer statut
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supportTicket, ticketMessage } from "@/lib/prisma-ext";
import { hasPermission } from "@/lib/admin/rbac";
import { sendEmail } from "@/lib/email";


export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !hasPermission(session.user.role, "admin.support.view")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 20;

  const where = status && status !== "ALL" ? { status: status as "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" } : {};

  const [tickets, total] = await Promise.all([
    supportTicket.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    supportTicket.count({ where }),
  ]);

  return NextResponse.json({ tickets, total, page, totalPages: Math.ceil(total / limit) });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !hasPermission(session.user.role, "admin.support.respond")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { ticketId, message, status } = await req.json();
  if (!ticketId) return NextResponse.json({ error: "ticketId requis" }, { status: 400 });

  const ticket = await supportTicket.findUnique({
    where: { id: ticketId },
    include: { user: { select: { email: true, name: true } } },
  });
  if (!ticket) return NextResponse.json({ error: "Ticket introuvable" }, { status: 404 });

  // Ajouter un message si fourni
  if (message?.trim()) {
    await ticketMessage.create({
      data: { ticketId, userId: session.user.id, content: message.trim(), isAdmin: true },
    });

    // Email à l'utilisateur
    if (ticket.user?.email) {
      await sendEmail({
        to: ticket.user.email,
        type: "TICKET_REPLY",
        subject: `Réponse à votre ticket #${ticketId.slice(-6).toUpperCase()}`,
        ticketId: ticketId.slice(-6).toUpperCase(),
        ticketMessage: message.trim(),
        userName: ticket.user?.name ?? undefined,
      }).catch((e) => console.error("[Admin Support] Email échec:", e));
    }
  }

  // Changer le statut si fourni
  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (status) updateData.status = status;
  if (message?.trim() && !status) updateData.status = "IN_PROGRESS";

  await supportTicket.update({ where: { id: ticketId }, data: updateData });

  return NextResponse.json({ success: true });
}
