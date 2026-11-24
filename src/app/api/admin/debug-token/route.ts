import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  return NextResponse.json({
    session: session
      ? {
          email: session.user?.email,
          role: (session.user as { role?: string })?.role,
        }
      : null,
    authenticated: !!session,
    message: session
      ? `Rôle actuel: ${(session.user as { role?: string })?.role}`
      : "Non connecté — connecte-toi d'abord avec Google",
  });
}
