# Cahier des Charges — TontinePro

> Version : 1.0 | Date : Avril 2026 | Statut : En cours de développement

---

## 1. Présentation du projet

### 1.1 Contexte
TontinePro est une application web de gestion de tontines destinée au marché africain (principalement Afrique de l'Ouest). Elle digitalise une pratique financière informelle très répandue : la tontine, aussi appelée « njangi », « likelembé » ou « susu » selon les pays.

### 1.2 Problème résolu
- Gestion manuelle et peu fiable des tontines (carnets, Excel, WhatsApp)
- Manque de traçabilité des paiements
- Risques de fraude et de litiges sans preuve
- Difficulté à gérer des groupes de grande taille

### 1.3 Vision produit
Offrir une plateforme numérique fiable, transparente et accessible permettant à n'importe quel groupe de gérer sa tontine de bout en bout : création, invitations, cotisations, distribution et suivi.

### 1.4 Cible utilisateur
- Particuliers (familles, amis) souhaitant organiser une épargne collective
- Professionnels (collègues, entrepreneurs) pour des projets d'investissement
- Associations et communautés pratiquant l'épargne rotative

---

## 2. Acteurs du système

| Rôle | Description |
|------|-------------|
| **Super Admin** | Gestion globale de la plateforme (KYC, frais, statistiques, modération) |
| **Organisateur** | Crée et gère un cercle de tontine (invitations, cycles, validation de paiements) |
| **Membre** | Participe à un cercle (paiements, suivi de son ordre de passage, reçus) |

---

## 3. Stack technique

### 3.1 Frontend
- **Framework** : Next.js 14+ (App Router)
- **Langage** : TypeScript
- **UI** : shadcn/ui + Tailwind CSS
- **State** : Zustand ou React Context
- **HTTP Client** : Axios ou fetch natif

### 3.2 Backend
- **Runtime** : Node.js
- **Framework** : Express.js
- **Langage** : TypeScript
- **ORM** : Prisma
- **Base de données** : PostgreSQL

### 3.3 Authentification — Better Auth
- **Librairie** : [Better Auth](https://better-auth.com)
- **Adapter** : `better-auth/adapters/prisma`
- **Stratégies** : Email + mot de passe (phase 1), OAuth Google (phase 2)
- **Méthode** : Sessions + CSRF protection intégrée

#### Setup Better Auth (résumé)
```bash
# Installation
npm install better-auth @better-auth/prisma-adapter

# Génération des tables dans schema.prisma
npx auth@latest generate

# Migration
npx prisma migrate dev --name add-better-auth
```

```typescript
// backend/src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  trustedOrigins: [process.env.FRONTEND_URL!],
});
```

```typescript
// backend/src/server.ts
import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";

const app = express();

// Better Auth AVANT express.json()
app.all("/api/auth/*", toNodeHandler(auth));
app.use(express.json());
```

> ⚠️ **Important** : Ne pas placer `express.json()` avant le handler Better Auth — cela casse le parsing du body.

### 3.4 Paiement mobile
- **Phase 1** : Validation manuelle par l'organisateur (cash / virement)
- **Phase 2** : Intégration Mobile Money (Flooz / T-Money / Wave / Orange Money)

### 3.5 Notifications
- **Phase 1** : Email (Nodemailer / Resend)
- **Phase 2** : SMS (Twilio ou opérateur local), Push (Firebase FCM)

---

## 4. Modèle de données (Prisma)

### 4.1 Modèles principaux

```prisma
// Généré en partie par Better Auth
model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  emailVerified Boolean   @default(false)
  image         String?
  role          UserRole  @default(MEMBRE)
  status        UserStatus @default(ACTIVE)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  sessions      Session[]
  accounts      Account[]
  memberships   Membership[]
  kycRequest    KycRequest?
  payments      Payment[]
  notifications Notification[]
}

enum UserRole {
  SUPER_ADMIN
  ORGANISATEUR
  MEMBRE
}

enum UserStatus {
  ACTIVE
  BANNED
  SUSPENDED
}

model Circle {
  id           String        @id @default(cuid())
  name         String
  description  String?
  amount       Float         // Montant de la cotisation par cycle
  frequency    Frequency     // WEEKLY | MONTHLY
  maxMembers   Int
  isPublic     Boolean       @default(false)
  status       CircleStatus  @default(PENDING)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  // Relations
  organisateur  Membership[]
  cycles        Cycle[]
  invitations   Invitation[]
  memberships   Membership[]
}

enum Frequency {
  WEEKLY
  MONTHLY
}

enum CircleStatus {
  PENDING
  ACTIVE
  CLOSED
}

model Membership {
  id         String           @id @default(cuid())
  userId     String
  circleId   String
  role       MembershipRole   @default(MEMBRE)
  order      Int?             // Ordre de passage
  joinedAt   DateTime         @default(now())

  user       User   @relation(fields: [userId], references: [id])
  circle     Circle @relation(fields: [circleId], references: [id])
  payments   Payment[]

  @@unique([userId, circleId])
}

enum MembershipRole {
  ORGANISATEUR
  MEMBRE
}

model Cycle {
  id           String      @id @default(cuid())
  circleId     String
  number       Int         // Numéro du cycle (1, 2, 3...)
  startDate    DateTime
  endDate      DateTime?
  beneficiary  String?     // userId du bénéficiaire
  status       CycleStatus @default(OPEN)
  createdAt    DateTime    @default(now())

  circle   Circle    @relation(fields: [circleId], references: [id])
  payments Payment[]
}

enum CycleStatus {
  OPEN
  CLOSED
  ARCHIVED
}

model Payment {
  id           String        @id @default(cuid())
  userId       String
  cycleId      String
  membershipId String
  amount       Float
  method       PaymentMethod @default(CASH)
  status       PaymentStatus @default(PENDING)
  confirmedAt  DateTime?
  receiptUrl   String?
  createdAt    DateTime      @default(now())

  user       User       @relation(fields: [userId], references: [id])
  cycle      Cycle      @relation(fields: [cycleId], references: [id])
  membership Membership @relation(fields: [membershipId], references: [id])
}

enum PaymentMethod {
  CASH
  VIREMENT
  MOBILE_MONEY
}

enum PaymentStatus {
  PENDING
  CONFIRMED
  REJECTED
}

model Invitation {
  id        String           @id @default(cuid())
  circleId  String
  token     String           @unique @default(cuid())
  email     String?
  status    InvitationStatus @default(PENDING)
  expiresAt DateTime
  createdAt DateTime         @default(now())

  circle Circle @relation(fields: [circleId], references: [id])
}

enum InvitationStatus {
  PENDING
  ACCEPTED
  EXPIRED
  REVOKED
}

model KycRequest {
  id          String    @id @default(cuid())
  userId      String    @unique
  documentUrl String
  status      KycStatus @default(PENDING)
  reviewedAt  DateTime?
  reviewNote  String?
  createdAt   DateTime  @default(now())

  user User @relation(fields: [userId], references: [id])
}

enum KycStatus {
  PENDING
  APPROVED
  REJECTED
}

model PlatformSetting {
  id         String @id @default(cuid())
  key        String @unique
  value      String
  updatedAt  DateTime @updatedAt
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  title     String
  body      String
  read      Boolean  @default(false)
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
}
```

---

## 5. API Backend — Routes Express

### 5.1 Authentification (géré par Better Auth)
| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/api/auth/sign-up/email` | Inscription |
| `POST` | `/api/auth/sign-in/email` | Connexion |
| `POST` | `/api/auth/sign-out` | Déconnexion |
| `GET`  | `/api/auth/session` | Session courante |

### 5.2 Utilisateurs
| Méthode | Route | Description |
|---------|-------|-------------|
| `GET`  | `/api/users/me` | Profil courant |
| `PATCH` | `/api/users/me` | Modifier son profil |
| `GET`  | `/api/admin/users` | Liste utilisateurs (admin) |
| `PATCH` | `/api/admin/users/:id/ban` | Bannir un utilisateur |

### 5.3 KYC
| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/api/kyc` | Soumettre une demande KYC |
| `GET`  | `/api/admin/kyc` | Lister les demandes (admin) |
| `PATCH` | `/api/admin/kyc/:id` | Approuver / Rejeter |

### 5.4 Cercles
| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/api/circles` | Créer un cercle |
| `GET`  | `/api/circles` | Mes cercles |
| `GET`  | `/api/circles/:id` | Détail d'un cercle |
| `PATCH` | `/api/circles/:id` | Modifier un cercle |

### 5.5 Invitations
| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/api/circles/:id/invitations` | Générer une invitation |
| `GET`  | `/api/invitations/:token` | Vérifier un lien |
| `POST` | `/api/invitations/:token/accept` | Rejoindre via lien |
| `DELETE` | `/api/invitations/:id` | Révoquer une invitation |

### 5.6 Cycles
| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/api/circles/:id/cycles` | Démarrer un cycle |
| `GET`  | `/api/circles/:id/cycles` | Lister les cycles |
| `PATCH` | `/api/cycles/:id/close` | Clôturer un cycle |

### 5.7 Paiements
| Méthode | Route | Description |
|---------|-------|-------------|
| `POST` | `/api/payments` | Enregistrer un paiement |
| `GET`  | `/api/payments` | Historique paiements |
| `PATCH` | `/api/payments/:id/confirm` | Confirmer (organisateur) |
| `PATCH` | `/api/payments/:id/reject` | Rejeter (organisateur) |
| `GET`  | `/api/payments/:id/receipt` | Télécharger le reçu |

### 5.8 Notifications
| Méthode | Route | Description |
|---------|-------|-------------|
| `GET`  | `/api/notifications` | Mes notifications |
| `PATCH` | `/api/notifications/:id/read` | Marquer comme lu |

### 5.9 Admin — Dashboard
| Méthode | Route | Description |
|---------|-------|-------------|
| `GET`  | `/api/admin/dashboard` | Statistiques globales |
| `GET`  | `/api/admin/settings` | Paramètres plateforme |
| `PATCH` | `/api/admin/settings` | Modifier les paramètres |

---

## 6. Structure des dossiers

```
tontinepro/
├── frontend/                   # Next.js App
│   ├── app/
│   │   ├── page.tsx            ✅ Landing page (DONE)
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── dashboard/
│   │   │   ├── circles/
│   │   │   ├── payments/
│   │   │   └── settings/
│   │   └── admin/
│   │       ├── dashboard/page.tsx
│   │       ├── kyc/page.tsx
│   │       └── settings/page.tsx
│   ├── components/
│   │   ├── auth/
│   │   ├── circles/
│   │   ├── payments/
│   │   └── ui/                 # shadcn/ui components
│   ├── lib/
│   │   ├── auth-client.ts      # Better Auth client
│   │   └── api.ts
│   └── .env.local
│
├── backend/                    # Node.js + Express
│   ├── src/
│   │   ├── lib/
│   │   │   └── auth.ts         # Better Auth config
│   │   ├── routes/
│   │   │   ├── users.ts
│   │   │   ├── circles.ts
│   │   │   ├── cycles.ts
│   │   │   ├── payments.ts
│   │   │   ├── invitations.ts
│   │   │   ├── notifications.ts
│   │   │   └── admin.ts
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   │   ├── requireAuth.ts
│   │   │   └── requireRole.ts
│   │   └── server.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── .env
│
├── docs/
│   ├── cahier-des-charges.md   ← CE FICHIER
│   ├── charte-graphique.md
│   ├── user-stories-backlog.md
│   ├── project-guide.md
│   └── instructions-ia.md
└── diagrammes/
    ├── dca.png
    └── diagramedeclasse.png
```

---

## 7. Fonctionnalités détaillées

### 7.1 Authentification (Better Auth)
- Inscription avec email + mot de passe
- Vérification de l'email
- Connexion / déconnexion
- Session persistante (cookies sécurisés)
- Protection CSRF intégrée
- Attribution du rôle à l'inscription (`MEMBRE` par défaut)
- Middleware `requireAuth` pour protéger les routes

### 7.2 Gestion des cercles
- Création d'un cercle avec nom, montant, fréquence, nb membres
- Statut : `PENDING` → `ACTIVE` → `CLOSED`
- Vue liste de ses cercles
- Vue détail : membres, cycles, paiements

### 7.3 Invitations
- Génération d'un lien unique (token UUID)
- Expiration configurable (ex. 7 jours)
- Acceptation via lien → création du Membership
- Révocation par l'organisateur

### 7.4 Cycles
- Démarrage manuel d'un cycle par l'organisateur
- Attribution d'un ordre de passage à chaque membre
- Clôture du cycle quand tous ont payé (ou manuellement)
- Archivage automatique à la clôture

### 7.5 Paiements
- Saisie manuelle par l'organisateur (cash / virement)
- Confirmation ou rejet avec note
- Génération d'un reçu PDF (numéroté, horodaté)
- Historique filtrable par cycle, statut, membre
- Phase 2 : intégration Mobile Money (Flooz, T-Money, Wave)

### 7.6 KYC — Vérification d'identité
- Obligatoire pour les Organisateurs avant création de cercle
- Upload de document (pièce d'identité)
- Statuts : `PENDING` → `APPROVED` / `REJECTED`
- Historique des décisions

### 7.7 Dashboard Super Admin
- Statistiques globales : nb utilisateurs, cercles actifs, volume total
- File KYC en attente
- Gestion des frais de service (`service_fee_percent`)
- Bannissement / débannissement d'utilisateurs
- Journal des actions admin

### 7.8 Notifications
- Rappel 24h avant échéance de paiement (email phase 1, SMS phase 2)
- Notification de confirmation/rejet de paiement
- Notification d'invitation reçue
- Notification de clôture de cycle

---

## 8. Sécurité

| Mesure | Détail |
|--------|--------|
| Authentification | Better Auth — sessions sécurisées, CSRF |
| Autorisation | Middlewares `requireAuth` + `requireRole` |
| Mots de passe | Hashage Bcrypt (géré par Better Auth) |
| Données sensibles | Variables d'environnement uniquement |
| CORS | Liste blanche des origines autorisées |
| KYC | Validation manuelle avant accès organisateur |
| Bannissement | Vérification du statut à chaque requête |
| Upload fichiers | Validation MIME type + taille max |

---

## 9. Charte graphique (résumé)

> Détail complet dans `docs/charte-graphique.md`

| Élément | Valeur |
|---------|--------|
| Couleur principale (clair) | `#fffffe` (fond), `#272343` (texte) |
| Accent | `#ffd803` (jaune), `#bae8e8` (turquoise) |
| Mode sombre fond | `#0f0e17` |
| Accent sombre | `#ff8906` |
| Police | Poppins (principale), Recoleta (display) |
| Border radius | `20px` (cartes), `rounded-full` (boutons) |

---

## 10. Pages frontend à développer

| Page | Rôle | Priorité |
|------|------|----------|
| `/` — Landing page | Tous | ✅ DONE |
| `/login` | Tous | 🔴 Haute |
| `/register` | Tous | 🔴 Haute |
| `/dashboard` | Membre / Organisateur | 🔴 Haute |
| `/dashboard/circles/new` | Organisateur | 🔴 Haute |
| `/dashboard/circles/[id]` | Tous | 🔴 Haute |
| `/dashboard/payments` | Tous | 🟠 Moyenne |
| `/join/[token]` | Membre | 🟠 Moyenne |
| `/admin/dashboard` | Super Admin | 🟠 Moyenne |
| `/admin/kyc` | Super Admin | 🟠 Moyenne |
| `/admin/settings` | Super Admin | 🟡 Basse |
| `/dashboard/settings` | Tous | 🟡 Basse |

---

## 11. Priorités de développement

### Phase 1 — MVP (Backend + Auth)
- [ ] Initialiser le backend Express + TypeScript
- [ ] Configurer Prisma + PostgreSQL
- [ ] Intégrer Better Auth (email/password)
- [ ] Implémenter les middlewares d'auth et de rôle
- [ ] Routes : users, circles, invitations, payments
- [ ] Génération des reçus basique (texte)
- [ ] Pages frontend : login, register, dashboard, circle

### Phase 2 — Fonctionnalités avancées
- [ ] KYC avec upload de documents
- [ ] Dashboard Super Admin
- [ ] Gestion des frais de service
- [ ] Notifications email (rappels 24h)
- [ ] Génération PDF des reçus

### Phase 3 — Scaling
- [ ] Intégration Mobile Money (Flooz / T-Money / Wave)
- [ ] Notifications SMS / Push
- [ ] OAuth Google (Better Auth)
- [ ] Statistiques avancées
- [ ] Application mobile (React Native)

---

## 12. Variables d'environnement

### `backend/.env`
```env
DATABASE_URL="postgresql://user:password@localhost:5432/tontinepro"
BETTER_AUTH_SECRET="votre-secret-32-chars-minimum"
FRONTEND_URL="http://localhost:3000"
PORT=4000
```

### `frontend/.env.local`
```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
BETTER_AUTH_URL="http://localhost:4000"
```

---


- [shadcn/ui](https://ui.shadcn.com)
- Diagrammes : `diagrammes/dca.png` et `diagrammes/diagramedeclasse.png`

---

*Cahier des charges généré en Avril 2026 — TontinePro © @pigeoncodeur*
