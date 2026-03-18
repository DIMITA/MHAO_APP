# ⚙️ SPÉCIFICATIONS TECHNIQUES
## Marketplace Habitat – Afrique de l'Ouest
**Version 1.0 | MVP Phase 1 | 2025**

---

## 1. Architecture Technique

### 1.1 Stack Technologique

| Couche | Technologie | Justification |
|--------|------------|--------------|
| Frontend Web | Next.js 14 (React) | SSR/SSG, SEO, performances |
| Frontend Mobile | Flutter / PWA (MVP) | Partage code, budget optimisé |
| Backend API | NestJS (Node.js) | TypeScript, modulaire, scalable |
| Base de données | PostgreSQL 15 | ACID, relations complexes, JSON |
| Cache / Sessions | Redis 7 | Performances, JWT blacklist |
| ORM | Prisma | Type-safe, migrations auto |
| Stockage fichiers | MinIO / Cloudflare R2 | S3-compatible, RGPD-friendly |
| Géolocalisation | OpenStreetMap + Nominatim | Open source, gratuit |
| Paiement | MTN MoMo / Orange / Moov API | Mobile Money UEMOA |
| Notifications | Firebase FCM + SendGrid | Push + Email |
| Infrastructure | Hetzner VPS + Cloudflare CDN | Coût optimisé, latence réduite |
| CI/CD | GitHub Actions + Docker | Déploiements automatisés |

### 1.2 Architecture Microservices (cible)

```
┌─────────────────────────────────────────────────────────┐
│                      API GATEWAY                         │
│           (Auth, Rate Limiting, Routing)                 │
└───────┬──────────┬──────────┬──────────┬────────────────┘
        │          │          │          │
   ┌────▼───┐ ┌───▼────┐ ┌──▼─────┐ ┌──▼──────┐
   │ Auth   │ │Projects│ │ Quotes │ │ Payment │
   │Service │ │Service │ │Service │ │ Service │
   └────────┘ └────────┘ └────────┘ └─────────┘
        │          │          │          │
   ┌────▼───┐ ┌───▼────┐ ┌──▼─────┐ ┌──▼──────┐
   │Reviews │ │Notifs  │ │ Admin  │ │  Files  │
   │Service │ │Service │ │Service │ │ Service │
   └────────┘ └────────┘ └────────┘ └─────────┘
```

**Services :**
- **API Gateway :** authentification, rate limiting, routing.
- **Service Auth :** inscription, connexion JWT + OTP SMS.
- **Service Projects :** CRUD projets, géolocalisation, statuts.
- **Service Quotes :** devis, comparaison, acceptation.
- **Service Payment :** escrow, déblocage étapes, Mobile Money.
- **Service Reviews :** notation, avis, modération.
- **Service Notifications :** push, email, SMS.
- **Service Admin :** reporting, validation, médiation.

---

## 2. Modèle de Données

### 2.1 Entités Principales

| Entité | Champs Clés | Relations |
|--------|------------|-----------|
| **User** | id, email, phone, role (CLIENT\|PROVIDER\|ADMIN), kyc_status, created_at | 1:N Projects, 1:N Reviews |
| **ProviderProfile** | id, user_id, company_name, skills[], zones[], verified, rating_avg, rating_count | 1:1 User, 1:N Quotes |
| **Project** | id, client_id, title, description, budget_min, budget_max, location (PostGIS), status, created_at | N:M Providers, 1:N Quotes |
| **Quote** | id, project_id, provider_id, amount, description, timeline_days, status, files[] | N:1 Project, N:1 Provider |
| **Payment** | id, project_id, escrow_amount, released_amount, mobile_money_ref, status, milestones[] | 1:1 Project |
| **Milestone** | id, payment_id, title, amount, status (PENDING\|PAID), approved_at | N:1 Payment |
| **Review** | id, project_id, reviewer_id, reviewee_id, rating (1-5), comment, created_at | N:1 Project |
| **Notification** | id, user_id, type, payload (JSON), read, created_at | N:1 User |

### 2.2 Schéma Prisma (extrait)

```prisma
model User {
  id         String   @id @default(uuid())
  email      String   @unique
  phone      String   @unique
  role       Role     @default(CLIENT)
  kycStatus  KycStatus @default(PENDING)
  createdAt  DateTime @default(now())

  profile    ProviderProfile?
  projects   Project[]
  reviews    Review[]
}

model Project {
  id          String   @id @default(uuid())
  clientId    String
  title       String
  description String
  budgetMin   Float
  budgetMax   Float
  lat         Float
  lng         Float
  status      ProjectStatus @default(OPEN)
  createdAt   DateTime @default(now())

  client      User     @relation(fields: [clientId], references: [id])
  quotes      Quote[]
  payment     Payment?
}

model Quote {
  id          String   @id @default(uuid())
  projectId   String
  providerId  String
  amount      Float
  description String
  timelineDays Int
  status      QuoteStatus @default(PENDING)

  project     Project  @relation(fields: [projectId], references: [id])
  provider    ProviderProfile @relation(fields: [providerId], references: [id])
}

enum Role { CLIENT PROVIDER ADMIN }
enum KycStatus { PENDING VERIFIED REJECTED }
enum ProjectStatus { OPEN IN_PROGRESS COMPLETED CANCELLED DISPUTED }
enum QuoteStatus { PENDING ACCEPTED REJECTED WITHDRAWN }
```

---

## 3. API REST – Endpoints

### 3.1 Authentification

```
POST   /auth/register          → Inscription client ou prestataire
POST   /auth/login             → Connexion (retourne JWT access + refresh)
POST   /auth/otp/send          → Envoi OTP SMS
POST   /auth/otp/verify        → Validation OTP
POST   /auth/refresh           → Renouvellement token
POST   /auth/logout            → Révocation token (blacklist Redis)
```

### 3.2 Projets

```
GET    /projects               → Liste projets publics (filtres: location, budget, catégorie)
POST   /projects               → Création projet (CLIENT uniquement)
GET    /projects/:id           → Détail projet
PATCH  /projects/:id           → Mise à jour statut/infos
DELETE /projects/:id           → Suppression (CLIENT, statut OPEN seulement)
GET    /projects/:id/quotes    → Liste devis pour un projet
GET    /projects/me            → Mes projets (CLIENT connecté)
```

### 3.3 Devis

```
POST   /quotes                 → Soumission devis (PROVIDER uniquement)
GET    /quotes/:id             → Détail devis
PATCH  /quotes/:id/accept      → Acceptation devis par le client
PATCH  /quotes/:id/reject      → Refus devis
GET    /quotes/me              → Mes devis (PROVIDER connecté)
```

### 3.4 Paiements

```
POST   /payments/initiate              → Initiation paiement escrow
POST   /payments/mobile-money/callback → Webhook Mobile Money
POST   /payments/:id/release/:milestoneId → Déblocage étape
GET    /payments/:id/status            → Statut paiement
```

### 3.5 Prestataires

```
GET    /providers              → Liste prestataires vérifiés (filtres)
GET    /providers/:id          → Profil complet prestataire
POST   /providers/verify       → Soumission documents KYC
PATCH  /providers/:id          → Mise à jour profil
```

### 3.6 Avis

```
POST   /reviews                → Soumission notation post-projet
GET    /reviews/provider/:id   → Avis d'un prestataire
```

### 3.7 Admin

```
GET    /admin/providers/pending        → Prestataires en attente de validation
PATCH  /admin/providers/:id/verify     → Valider / rejeter prestataire
GET    /admin/disputes                 → Liste litiges
PATCH  /admin/disputes/:id/resolve     → Résolution litige
GET    /admin/stats                    → Dashboard KPIs
```

---

## 4. Sécurité

### 4.1 Authentification & Autorisation

- JWT **RS256** avec expiration courte (15 min) + refresh token (30 jours).
- OTP SMS obligatoire pour inscription, paiement et actions sensibles.
- **RBAC** : `CLIENT`, `PROVIDER`, `ADMIN`.
- Blacklist JWT dans Redis pour révocation immédiate.

### 4.2 Protection des Données

- Chiffrement **AES-256** pour données sensibles (numéros de compte, docs KYC).
- **HTTPS/TLS 1.3** obligatoire, HSTS activé.
- Données PII anonymisées dans les logs.
- Conformité RGPD et législation locale données personnelles.

### 4.3 Infrastructure

- **WAF (Cloudflare) :** protection DDoS, injection SQL, XSS.
- **Rate limiting :** 100 req/min par IP, 1 000 req/min par user authentifié.
- **Backups** automatiques PostgreSQL toutes les 6h (rétention 30 jours).
- **Monitoring :** Uptime Kuma + Sentry (alertes < 5 min).

### 4.4 Checklist OWASP Top 10

| Vulnérabilité | Mesure |
|--------------|--------|
| Injection SQL | ORM Prisma + requêtes paramétrées |
| Broken Auth | JWT RS256 + OTP + refresh rotation |
| Sensitive Data Exposure | AES-256 + HTTPS/TLS 1.3 |
| XXE | Désactivé dans parseurs XML |
| Broken Access Control | RBAC strict + ownership checks |
| Security Misconfiguration | Variables d'env + secrets vault |
| XSS | CSP headers + sanitisation inputs |
| Insecure Deserialization | Validation Zod/class-validator |
| Known Vulnerabilities | Dependabot + npm audit CI |
| Insufficient Logging | Sentry + logs structurés |

---

## 5. Exigences Non Fonctionnelles

| Exigence | Cible | Mesure |
|---------|-------|--------|
| Temps de réponse API | < 200ms P95 | Datadog / New Relic |
| Chargement page | < 2s sur 3G | Lighthouse score > 85 |
| Disponibilité | 99,9% (SLA) | < 8,7h downtime/an |
| Charge concurrente | 500 users simultanés (MVP) | K6 load testing |
| Mobile-first | Responsive 320px–1440px | Tests Chrome DevTools |
| Accessibilité | WCAG 2.1 AA | axe DevTools audit |
| Sécurité | OWASP Top 10 couvert | Pentest avant launch |

---

## 6. Roadmap Technique – 90 Jours

| Sprint | Durée | Tâches | Livrables | Responsable |
|--------|-------|--------|-----------|-------------|
| S0 | Sem 1–2 | Setup infra, repo, CI/CD, env dev/staging | Infra opérationnelle | CTO |
| S1 | Sem 3–4 | Auth complet (register/login/OTP), BDD schéma v1 | API auth fonctionnelle | Backend Dev |
| S2 | Sem 5–6 | CRUD Projets, Upload photos, Profil prestataire | Projets créés et visibles | Full-stack |
| S3 | Sem 7–8 | Module Devis complet, acceptation/refus | Devis soumis et accepté | Backend Dev |
| S4 | Sem 9–10 | Paiement MTN MoMo, escrow, milestones | Paiement test réussi | CTO + Backend |
| S5 | Sem 11–12 | Notifications, Reviews, Dashboard Admin | Fonctionnalités complètes | Full-stack |
| UAT | Sem 13 | Tests utilisateurs (5–10 projets pilotes) | MVP production-ready | Toute l'équipe |

---

## 7. Environnements

```
dev      → localhost (Docker Compose)
staging  → staging.habitat-marketplace.com (VPS Hetzner)
prod     → habitat-marketplace.com (VPS Hetzner + CDN Cloudflare)
```

### Variables d'Environnement (`.env.example`)

```env
# App
NODE_ENV=production
PORT=3000
APP_URL=https://habitat-marketplace.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/habitat_db

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_PRIVATE_KEY=...
JWT_PUBLIC_KEY=...
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# Mobile Money
MTN_MOMO_API_KEY=...
MTN_MOMO_COLLECTION_URL=https://sandbox.momodeveloper.mtn.com
ORANGE_MONEY_API_KEY=...

# Notifications
FIREBASE_PROJECT_ID=...
SENDGRID_API_KEY=...

# Storage
S3_ENDPOINT=...
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_BUCKET=habitat-files
```

---

*© 2025 Wilfried HOUEDANOU – Document Confidentiel*
