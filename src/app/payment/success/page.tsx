import { Suspense } from "react";
import PaymentSuccessClient from "./PaymentSuccessClient";

export const instant = false;

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PaymentSuccessClient />
    </Suspense>
  );
}
