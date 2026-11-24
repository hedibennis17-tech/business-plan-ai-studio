"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function PaymentSuccessPage() {
  const params = useSearchParams();
  const router = useRouter();
  const planId = params.get("plan_id");
  const sessionId = params.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    // Vérifier côté serveur que le paiement est bien COMPLETED
    // (ne pas faire confiance au redirect seul)
    if (!planId || !sessionId) {
      setStatus("error");
      return;
    }
    fetch(`/api/checkout/verify?session_id=${sessionId}&plan_id=${planId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.paid) {
          setStatus("success");
          // Rediriger vers le plan après 3 secondes
          setTimeout(() => router.push(`/dashboard/plans/${planId}`), 3000);
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [planId, sessionId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {status === "loading" && (
          <>
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h1 className="text-xl font-semibold text-gray-800">Vérification du paiement…</h1>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">✅</span>
            </div>
            <h1 className="text-2xl font-bold text-green-700 mb-2">Paiement réussi !</h1>
            <p className="text-gray-600 mb-6">
              Votre plan d&apos;affaires complet est maintenant disponible. Redirection dans 3 secondes…
            </p>
            <Link
              href={planId ? `/dashboard/plans/${planId}` : "/dashboard"}
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Accéder à mon plan maintenant
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold text-yellow-700 mb-2">Vérification en cours</h1>
            <p className="text-gray-600 mb-6">
              Votre paiement est en cours de traitement. Si votre plan n&apos;est pas débloqué dans quelques minutes, contactez le support.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link
                href="/dashboard"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                Retour au tableau de bord
              </Link>
              <Link
                href="/dashboard/support"
                className="inline-block border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                Contacter le support
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
