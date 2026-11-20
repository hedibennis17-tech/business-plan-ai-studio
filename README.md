# 🏢 Business Plan AI Studio

Plateforme SaaS intelligente de création de plans d'affaires professionnels, norme nord-américaine (Canada & États-Unis), pilotée par Claude AI.

## ✨ Fonctionnalités

- 🤖 **AI Copilot** — Assistant contextuel à chaque étape (Claude API)
- 📊 **Financial Engine** — Prévisions, cash flow, scénarios financiers
- 🔍 **Market Intelligence** — Analyse marché, concurrence, SWOT
- 📋 **Questionnaire Adaptatif** — 10 étapes guidées selon le type d'entreprise
- 📄 **Export PDF + DOCX** — Document professionnel complet
- 💳 **Paiement Stripe** — Accès premium 499 $ CAD
- 👤 **Admin Console** — Gestion complète + relances automatiques

## 🛠️ Stack

- **Framework :** Next.js 15 (App Router)
- **Language :** TypeScript
- **Styling :** Tailwind CSS + shadcn/ui
- **Database :** PostgreSQL (Prisma ORM)
- **Auth :** NextAuth.js (Google OAuth + email)
- **AI :** Claude API (Anthropic)
- **Paiement :** Stripe
- **Emails :** Resend
- **Déploiement :** Vercel

## 🚀 Démarrage rapide

```bash
# 1. Cloner le repo
git clone https://github.com/hedibennis17-tech/business-plan-ai-studio.git
cd business-plan-ai-studio

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env.local
# Remplir les variables dans .env.local

# 4. Initialiser la base de données
npx prisma db push
npx prisma generate

# 5. Lancer en développement
npm run dev
```

## 📁 Structure

```
src/
  app/           → Pages Next.js (App Router)
  components/    → Composants React
  lib/           → Utilitaires (LLM, Stripe, DB, Auth)
  types/         → Types TypeScript
prisma/
  schema.prisma  → Modèle de données
```

## 🗺️ Roadmap

Voir [MASTER_SPEC.md](./MASTER_SPEC.md) pour les spécifications complètes et la roadmap de 11 phases.

## 📄 Licence

Propriétaire — Hedi Bennis © 2026
