import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BillingClient from "@/components/billing/BillingClient";

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

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Facturation</h1>
        <p className="text-gray-500 mt-1">Accédez à vos plans d&apos;affaires complets avec export PDF et Word</p>
      </div>
      <BillingClient plans={plans as Parameters<typeof BillingClient>[0]["plans"]} />
    </div>
  );
}
