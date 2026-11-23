/**
 * Phase 2.6 — Rate Limiting
 * Basé sur Upstash Redis (serverless-safe, fonctionne sur Vercel).
 * Variables d'environnement requises :
 *   UPSTASH_REDIS_REST_URL
 *   UPSTASH_REDIS_REST_TOKEN
 *
 * Si les variables ne sont pas définies (dev local sans Redis),
 * le rate limiting est désactivé et une warning est loggée.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

function createRatelimiter(requests: number, window: `${number} ${"s" | "m" | "h" | "d"}`) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  const redis = new Redis({ url, token });
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: false,
  });
}

// Limites par route
const limiters = {
  // Login : 10 tentatives par 15 minutes par IP
  login: createRatelimiter(10, "15 m"),
  // Register : 5 inscriptions par heure par IP
  register: createRatelimiter(5, "1 h"),
  // API générale : 60 requêtes par minute par IP
  api: createRatelimiter(60, "1 m"),
};

/**
 * Extrait l'IP depuis les headers de la requête.
 * Vercel injecte x-forwarded-for.
 */
function getIP(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return ip;
}

/**
 * Applique le rate limiting pour une route donnée.
 * Retourne null si la requête est autorisée,
 * ou une NextResponse 429 si la limite est atteinte.
 */
export async function checkRateLimit(
  req: NextRequest,
  route: keyof typeof limiters
): Promise<NextResponse | null> {
  const limiter = limiters[route];

  if (!limiter) {
    // Rate limiting désactivé (pas de Redis configuré)
    if (process.env.NODE_ENV === "development") {
      console.warn("[ratelimit] Upstash Redis non configuré — rate limiting désactivé");
    }
    return null;
  }

  const ip = getIP(req);
  const identifier = `${route}:${ip}`;

  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier);

    if (!success) {
      const resetDate = new Date(reset);
      const retryAfterSeconds = Math.ceil((reset - Date.now()) / 1000);

      return NextResponse.json(
        {
          error: "Trop de tentatives. Veuillez réessayer dans quelques instants.",
          retryAfter: retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfterSeconds),
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": resetDate.toISOString(),
          },
        }
      );
    }

    return null;
  } catch (err) {
    // Si Redis est indisponible, on laisse passer (fail open)
    // pour éviter de bloquer les utilisateurs légitimes
    console.error("[ratelimit] Redis error:", err instanceof Error ? err.message : "unknown");
    return null;
  }
}
