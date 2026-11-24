import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { supportTicket } from "@/lib/prisma-ext";
import SupportClient from "@/components/support/SupportClient";

export const instant = false;

export default async function SupportPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login");

  const tickets = await supportTicket.findMany({
    where: { userId: session.user.id },
    include: {
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { messages: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Support</h1>
        <p className="text-gray-500 mt-1">Créez un ticket ou suivez vos demandes existantes</p>
      </div>
      <SupportClient initialTickets={tickets as Parameters<typeof SupportClient>[0]["initialTickets"]} />
    </div>
  );
}
