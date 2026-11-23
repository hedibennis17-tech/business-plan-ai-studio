/**
 * Phase 2.6 — Route d'inscription sécurisée
 * - Validation Zod (serveur)
 * - Rate limiting Upstash
 * - Gestion d'erreurs sécurisée (pas d'exposition de détails internes)
 */

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema, formatZodError } from "@/lib/schemas";
import { checkRateLimit } from "@/lib/ratelimit";
import { z } from "zod";

export async function POST(req: NextRequest) {
  // 1. Rate limiting
  const rateLimitResponse = await checkRateLimit(req, "register");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    // 2. Parse du corps
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Corps de la requête invalide" },
        { status: 400 }
      );
    }

    // 3. Validation Zod (serveur — obligatoire, ne jamais faire confiance au client)
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const { name, email, password, phone } = parsed.data;

    // 4. Vérifier si l'email est déjà utilisé
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cette adresse courriel" },
        { status: 409 }
      );
    }

    // 5. Hash du mot de passe (cost factor 12)
    const hashedPassword = await bcrypt.hash(password, 12);

    // 6. Créer l'utilisateur (select minimal — ne pas retourner de données sensibles)
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email,
        passwordHash: hashedPassword,
        phone: phone?.trim() || null,
        role: "USER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { message: "Compte créé avec succès", user },
      { status: 201 }
    );
  } catch (error) {
    // Log sécurisé : pas de détails sensibles en production
    if (process.env.NODE_ENV === "development") {
      console.error("[register] erreur:", error);
    } else {
      console.error("[register] erreur interne:", error instanceof Error ? error.message : "unknown");
    }

    // Ne jamais exposer les détails de l'erreur au client
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
