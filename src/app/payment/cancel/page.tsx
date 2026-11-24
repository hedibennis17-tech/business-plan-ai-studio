import Link from "next/link";

export const instant = false;

interface Props {
  searchParams: Promise<{ plan_id?: string }>;
}

export default async function PaymentCancelPage({ searchParams }: Props) {
  const { plan_id } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">❌</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Paiement annulé</h1>
        <p className="text-gray-600 mb-8">
          Votre paiement a été annulé. Aucun montant n&apos;a été prélevé de votre compte.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          {plan_id && (
            <Link
              href={`/dashboard/billing?plan_id=${plan_id}`}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Réessayer le paiement
            </Link>
          )}
          <Link
            href="/dashboard"
            className="inline-block border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    </div>
  );
}
