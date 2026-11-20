# BUSINESS PLAN AI STUDIO — Master Specification
> Version: 1.0 | Date: 2026-11-20 | Author: Hedi Bennis

## Vision
Plateforme SaaS intelligente de création de plans d'affaires professionnels, pilotée par un LLM avec parcours guidé, moteur financier, analyse de marché et paiement Stripe.

**Marché cible :** Canada (Québec, Ontario+) et États-Unis  
**Prix :** 499 $ — accès au téléchargement PDF + Word complet  
**Modèle :** Freemium (prévisualisation partielle gratuite, export verrouillé jusqu'au paiement)

---

## PHASE 0 — ARCHITECTURE

### Stack technique
- **Frontend :** Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend :** Next.js API Routes + Server Actions
- **LLM :** Claude API (Anthropic) via SDK
- **MCP :** MCP Orchestrator pour outils contrôlés
- **Base de données :** PostgreSQL via Prisma ORM (Neon ou Supabase)
- **Auth :** NextAuth.js (Google OAuth + email/password)
- **Paiement :** Stripe Checkout + Webhooks
- **PDF :** Puppeteer ou @react-pdf/renderer
- **DOCX :** docx npm package
- **Emails :** Resend
- **Déploiement :** Vercel

### Structure des dossiers
```
src/
  app/
    api/           → Routes API (auth, plan, payment, llm, admin)
    auth/          → Pages login, register, oauth
    dashboard/     → Dashboard utilisateur
    plan/          → Parcours guidé (étapes 1-10)
    payment/       → Checkout Stripe
    admin/         → Console admin
  components/
    ui/            → Composants de base (shadcn)
    plan/          → Composants spécifiques au plan
    financial/     → Tableaux, graphiques financiers
    market/        → Analyse de marché, SWOT
    questionnaire/ → Formulaires adaptatifs
    layout/        → Header, sidebar, navigation
  lib/
    llm/           → Client Claude, prompts, contexte
    stripe/        → Config, webhooks, helpers
    pdf/           → Générateur PDF
    db/            → Prisma client, queries
    auth/          → Config NextAuth
    mcp/           → Orchestrateur MCP
  types/           → Types TypeScript globaux
prisma/
  schema.prisma    → Modèle de données complet
```

---

## PARCOURS UTILISATEUR (10 étapes)

| Étape | Module | Description |
|-------|--------|-------------|
| 01 | Identification | Google OAuth ou email/password, profil, langue |
| 02 | Création projet | Type entreprise, secteur, pays, objectif, stade |
| 03 | Questionnaire | Questions adaptatives, radio, inputs, uploads, assistant |
| 04 | Marché | Sources, concurrents, clientèle, stats, SWOT |
| 05 | Opérations | Équipe, RH, équipements, fournisseurs |
| 06 | Finances | Budget, prévisions, cash flow, bilan, break-even |
| 07 | Risques | Risques, contingence, incohérences, lacunes |
| 08 | Plan prêt | Prévisualisation partielle, sections complétées |
| 09 | Paiement | Stripe Checkout 499 $ sécurisé |
| 10 | Téléchargement | PDF + Word, logo, tableaux, graphiques, annexes |

---

## TABLE DES MATIÈRES — PLAN D'AFFAIRES (Norme Nord-Américaine)

### Pages liminaires
- Page couverture (nom, logo, coordonnées, confidentialité, date)
- Table des matières

### 1. Sommaire exécutif
- 1.1 Concept et mission
- 1.2 Objectifs stratégiques
- 1.3 Facteurs clés de succès
- 1.4 Survol financier et besoins de financement

### 2. Présentation de l'entreprise
- 2.1 Historique et genèse
- 2.2 Forme juridique (Inc/LLC/SÀRL)
- 2.3 Emplacement et installations
- 2.4 PI, permis et réglementation

### 3. Produits et services
- 3.1 Description détaillée
- 3.2 Proposition de valeur unique
- 3.3 Cycle de vie et R&D
- 3.4 Politique de prix et marges

### 4. Étude de marché
- 4.1 Analyse de l'industrie
- 4.2 Profil clientèle cible
- 4.3 Analyse de la concurrence
- 4.4 Analyse FFOM/SWOT

### 5. Marketing et ventes
- 5.1 Positionnement et branding
- 5.2 Communication et promotion
- 5.3 Canaux de distribution
- 5.4 Processus de vente et fidélisation

### 6. Plan opérationnel
- 6.1 Processus de production/prestation
- 6.2 Chaîne d'approvisionnement
- 6.3 Équipements et technologies
- 6.4 Contrôle qualité et normes

### 7. Équipe et ressources humaines
- 7.1 Organigramme
- 7.2 Profil des fondateurs
- 7.3 Plan de dotation et RH
- 7.4 Conseillers et partenaires externes

### 8. Plan financier
- 8.1 Hypothèses financières
- 8.2 Coûts de démarrage et montage
- 8.3 État des résultats prévisionnel (3 ans)
- 8.4 Budget de caisse / Cash Flow (mensuel 12-24 mois)
- 8.5 Bilan prévisionnel
- 8.6 Analyse du seuil de rentabilité
- 8.7 Ratios et indicateurs financiers clés

### 9. Gestion des risques
- 9.1 Identification des risques majeurs
- 9.2 Stratégies d'atténuation
- 9.3 Assurances commerciales

### Annexes
- CV des dirigeants
- Bilan personnel des actionnaires
- Soumissions, baux, lettres d'intention
- Études de marché détaillées

---

## MODULES FONCTIONNELS

### AI Copilot
- Assistant contextuel et adaptatif à chaque étape
- Suggestions, exemples, reformulations
- Détection des incohérences

### Financial Engine
- Calculs automatiques (revenus, marges, ratios)
- Prévisions sur 3-5 ans
- Scénarios optimiste / réaliste / pessimiste
- Tableaux et graphiques interactifs

### Market Intelligence
- Recherche marché assistée (sources web)
- Analyse SWOT générée
- Profil concurrentiel

### Questionnaire Engine
- Questions adaptatives selon le type d'entreprise
- Validation en temps réel
- Sauvegarde automatique par étape

### Document Engine
- Génération PDF haute qualité
- Export Word (.docx) éditable
- Insertion du logo, images, tableaux
- Watermark sur version non payée

### Stripe Integration
- Checkout sécurisé 499 $
- Webhooks pour validation du paiement
- Accès premium post-paiement
- Emails de confirmation automatiques

### Security
- Protection RBAC (user / admin)
- Données chiffrées
- Export verrouillé jusqu'au paiement vérifié
- Protection contre screenshots (overlay CSS)

### Admin Console
- Gestion des utilisateurs et plans
- Statistiques de conversion
- Envoi d'emails de relance aux impayés
- Monitoring des erreurs

---

## MODÈLE DE DONNÉES (Prisma — aperçu)

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  phone         String?
  passwordHash  String?
  googleId      String?
  role          Role     @default(USER)
  language      String   @default("fr")
  createdAt     DateTime @default(now())
  projects      BusinessPlan[]
  payments      Payment[]
}

model BusinessPlan {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  title         String
  status        PlanStatus @default(DRAFT)
  currentStep   Int      @default(1)
  country       String   @default("CA")
  businessType  String
  sector        String
  objective     String
  data          Json     // Toutes les réponses du questionnaire
  financialData Json?    // Données financières calculées
  marketData    Json?    // Données marché
  isPaid        Boolean  @default(false)
  paidAt        DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  payments      Payment[]
}

model Payment {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  businessPlanId  String
  businessPlan    BusinessPlan @relation(fields: [businessPlanId], references: [id])
  stripeSessionId String   @unique
  amount          Int      // en cents (49900)
  currency        String   @default("cad")
  status          PaymentStatus @default(PENDING)
  createdAt       DateTime @default(now())
}

enum Role { USER ADMIN }
enum PlanStatus { DRAFT IN_PROGRESS REVIEW COMPLETE }
enum PaymentStatus { PENDING COMPLETED FAILED REFUNDED }
```

---

## ROADMAP DE DÉVELOPPEMENT

| Phase | Contenu | Priorité |
|-------|---------|----------|
| 0 | Architecture, setup, DB, auth | ✅ En cours |
| 1 | Auth (Google + email), dashboard base | Semaine 1 |
| 2 | Questionnaire adaptatif étapes 1-7 | Semaine 2-3 |
| 3 | Financial Engine + graphiques | Semaine 3-4 |
| 4 | AI Copilot (Claude API) | Semaine 4-5 |
| 5 | Market Intelligence | Semaine 5 |
| 6 | Document Engine (PDF + DOCX) | Semaine 6 |
| 7 | Stripe + webhooks + accès premium | Semaine 7 |
| 8 | Admin Console | Semaine 8 |
| 9 | Emails (Resend) + relances | Semaine 8 |
| 10 | Sécurité, tests, QA | Semaine 9 |
| 11 | Lancement beta | Semaine 10 |

---

## CRITÈRES DE VALIDATION AVANT LANCEMENT
- [ ] Auth complète (Google + email)
- [ ] Questionnaire 10 étapes fonctionnel
- [ ] Financial Engine avec 3 scénarios
- [ ] PDF/DOCX générés correctement
- [ ] Stripe testé (mode test + live)
- [ ] Webhooks validés
- [ ] Watermark sur preview non payée
- [ ] Admin Console opérationnelle
- [ ] Emails transactionnels envoyés
- [ ] Tests E2E (Playwright)
- [ ] Déploiement Vercel stable
