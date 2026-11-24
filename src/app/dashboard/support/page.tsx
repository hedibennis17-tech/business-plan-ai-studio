import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { supportTicket } from "@/lib/prisma-ext";
import SupportClient from "@/components/support/SupportClient";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { prisma } from "@/lib/prisma";

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

  const firstPlan = await prisma.businessPlan.findFirst({
    where: { userId: session.user.id },
    select: { id: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg)" }}>
      <DashboardSidebar planHref={firstPlan ? `/plan/${firstPlan.id}` : undefined} />
      <main style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#182522" }}>Support</h1>
            <p style={{ color: "#6b8278", marginTop: 4 }}>Créez un ticket ou suivez vos demandes existantes</p>
          </div>
          <SupportClient initialTickets={tickets as Parameters<typeof SupportClient>[0]["initialTickets"]} />
        </div>
      </main>
    </div>
  );
}
