/**
 * Phase 2.6 — Proxy (équivalent middleware Next.js 16)
 *
 * - Protection des routes privées via next-auth
 * - Rate limiting sur les routes sensibles (Upstash)
 * - Headers de sécurité HTTP
 */

import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/ratelimit";

// Routes de rate limiting API
const RATE_LIMITED_ROUTES: Record<string, Parameters<typeof checkRateLimit>[1]> = {
  "/api/auth/register": "register",
  "/api/auth/signin": "login",
};

function addSecurityHeaders(response: NextResponse): NextResponse {
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self'",
    "connect-src 'self' https://accounts.google.com https://*.neon.tech",
    "frame-src https://accounts.google.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self' https://accounts.google.com",
  ].join("; ");

  response.headers.set("Content-Security-Policy", cspDirectives);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }

  return response;
}

export default withAuth(
  async function proxy(req: NextRequest & { nextauth: { token: unknown } }) {
    const path = req.nextUrl.pathname;
    const token = (req as NextRequest & { nextauth: { token: { role?: string } | null } }).nextauth?.token;

    // Rate limiting sur les routes API sensibles
    for (const [route, limiterKey] of Object.entries(RATE_LIMITED_ROUTES)) {
      if (path.startsWith(route)) {
        const rateLimitResponse = await checkRateLimit(req as NextRequest, limiterKey);
        if (rateLimitResponse) return rateLimitResponse;
        break;
      }
    }

    // Rate limiting sur les routes API des plans
    if (path.startsWith("/api/plans")) {
      const rateLimitResponse = await checkRateLimit(req as NextRequest, "api");
      if (rateLimitResponse) return rateLimitResponse;
    }

    // Protection routes /admin — RBAC multi-rôles
    if (path.startsWith("/admin")) {
      const adminRoles = ["SUPER_ADMIN", "ADMIN", "SUPPORT", "FINANCE"];
      if (!token?.role || !adminRoles.includes(token.role as string)) {
        return NextResponse.redirect(new URL("/dashboard?error=unauthorized", req.url));
      }
    }

    const response = NextResponse.next();
    return addSecurityHeaders(response);
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Les routes API de rate limiting ne requièrent pas d'auth
        for (const route of Object.keys(RATE_LIMITED_ROUTES)) {
          if (path.startsWith(route)) return true;
        }

        // Routes protégées : session requise
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/plan/:path*",
    "/questionnaire/:path*",
    "/admin/:path*",
    "/payment/:path*",
    "/api/auth/register",
    "/api/auth/signin",
    "/api/plans/:path*",
  ],
};
