import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BillingClient from "@/components/billing/BillingClient";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export const instant = false;

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login");

  // Récupérer tous les plans de l'utilisateur avec leur statut de paiement
  const plans = await prisma.businessPlan.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      title: true,
      isPaid: true,
      paidAt: true,
      status: true,
      generationStatus: true,
      payments: {
        select: { status: true, amount: true, currency: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const firstPlan = plans[0];

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#F7F8F6" }}>
      <DashboardSidebar planHref={firstPlan ? `/plan/${firstPlan.id}` : undefined} />
      <main style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#182522" }}>Facturation</h1>
            <p style={{ color: "#6b8278", marginTop: 4 }}>Accédez à vos plans d&apos;affaires complets avec export PDF et Word</p>
          </div>
          <BillingClient plans={plans as Parameters<typeof BillingClient>[0]["plans"]} />
        </div>
      </main>
    </div>
  );
}
