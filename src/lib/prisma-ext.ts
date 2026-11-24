/**
 * Extension Prisma pour les modèles ajoutés après la dernière génération du client.
 * Utilisé jusqu'à ce que `prisma generate` puisse être exécuté en production (Vercel build).
 *
 * SupportTicket et TicketMessage existent en DB (migration appliquée) mais pas
 * dans les types générés car binaries.prisma.sh est bloqué par le proxy agent.
 */
import { prisma } from "./prisma";

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: Date;
  updatedAt: Date;
  user?: { id: string; name: string | null; email: string | null };
  messages?: TicketMessage[];
  _count?: { messages: number };
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  content: string;
  isAdmin: boolean;
  createdAt: Date;
  sender?: { id: string; name: string | null; email: string | null };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export const supportTicket = db.supportTicket as {
  findMany: (args?: object) => Promise<SupportTicket[]>;
  findUnique: (args: object) => Promise<SupportTicket | null>;
  create: (args: object) => Promise<SupportTicket>;
  update: (args: object) => Promise<SupportTicket>;
  count: (args?: object) => Promise<number>;
  groupBy: (args: object) => Promise<Array<{ status: TicketStatus; _count: { _all: number } }>>;
};

export const ticketMessage = db.ticketMessage as {
  findMany: (args?: object) => Promise<TicketMessage[]>;
  create: (args: object) => Promise<TicketMessage>;
};
