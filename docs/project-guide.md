# Guide du projet - TontinePro

## 1. Objectif du projet
TontinePro est une application de gestion de tontines avec 3 rôles :
- **Super Admin** : gestion globale, KYC, frais, dashboard
- **Organisateur** : création de cercle, invitation, validation hors-ligne, clôture de cycle
- **Membre** : paiement, ordre de passage, notifications, reçu

## 2. Stack technique
- Frontend : **Next.js**
- Backend : **Node.js + Express**
- Base de données : **PostgreSQL**
- ORM : **Prisma**

## 3. Organisation du repo
Structure recommandée :
- `/backend` : serveur Express, API, Prisma
- `/frontend` : application Next.js
- `/diagrammes` : diagrammes UML / cas d’usage
- `/docs` : guides, cahier des charges, backlog

## 4. Première chose à faire
Commence par le backend. C’est le cœur métier.
1. Initialiser le repo Git
2. Créer `/backend`
3. Initialiser `npm` dans `/backend`
4. Installer Express, Prisma, PostgreSQL client, dotenv
5. Créer `/frontend`
6. Initialiser Next.js + React dans `/frontend`

## 5. Setup backend
### 5.1. Initialisation
- `npm init -y`
- `npm install express cors dotenv prisma @prisma/client`
- `npx prisma init`

### 5.2. Configuration de la base
- Dans `backend/prisma/schema.prisma` :
  - datasource PostgreSQL
  - generator client Prisma
- Dans `.env` :
  - `DATABASE_URL="postgresql://user:password@localhost:5432/tontinepro"`

### 5.3. Schéma de données initial
Modèle minimum :
- `User`
- `Role`
- `Circle`
- `Membership`
- `Payment`
- `Cycle`
- `Invitation`
- `KycRequest`
- `PlatformSetting`

### 5.4. Migrer la base
- `npx prisma migrate dev --name init`

## 6. API backend initiale
### 6.1. Authentification
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### 6.2. Gestion des utilisateurs
- `GET /api/users/:id`
- `PATCH /api/users/:id`

### 6.3. Cercle
- `POST /api/circles`
- `GET /api/circles`
- `GET /api/circles/:id`
- `PATCH /api/circles/:id`

### 6.4. Invitation
- `POST /api/circles/:id/invitations`
- `GET /api/invitations/:token`

### 6.5. Paiement
- `POST /api/payments`
- `GET /api/payments/:id`
- `PATCH /api/payments/:id/confirm`

### 6.6. Super Admin
- `GET /api/admin/dashboard`
- `GET /api/admin/kyc`
- `PATCH /api/admin/kyc/:id`
- `PATCH /api/admin/users/:id/ban`
- `PATCH /api/admin/settings`

## 7. Interfaces frontend prioritaires
### 7.1. Pages de base
- `pages/index.js` : page d’accueil
- `pages/login.js`
- `pages/register.js`
- `pages/dashboard.js`
- `pages/circle/create.js`
- `pages/circle/[id].js`
- `pages/admin/dashboard.js`

### 7.2. Composants importants
- `components/AuthForm`
- `components/CircleForm`
- `components/InvitationCard`
- `components/PaymentForm`
- `components/DashboardSummary`
- `components/NotificationBanner`

## 8. Workflow de développement
1. Faire fonctionner l’authentification
2. Créer un cercle + structure de données
3. Générer et accepter une invitation
4. Enregistrer un paiement
5. Afficher l’ordre de passage
6. Construire le dashboard Super Admin minimal

## 9. Comment reprendre le projet
À chaque fois que tu reviens :
1. Ouvre `user-stories-backlog.md`
2. Cherche la première tâche non cochée
3. Lance le backend et vérifie l’API liée
4. Ensuite passe au frontend correspondant
5. Ajoute un court commentaire dans le backlog si tu changes l’ordre

## 10. Priorités pour commencer
### Priorité 1
- Auth + rôles
- Modèle Circle + création
- Invitation
- Paiement simple

### Priorité 2
- Dashboard Super Admin
- KYC
- Paramètres de frais

### Priorité 3
- Notification 24h
- Reçu téléchargeable
- Bannissement / litiges
- Options de paiement supplémentaires

## 11. Conseils pratiques
- Travaille en petites étapes : une fonctionnalité robuste à la fois
- Teste souvent : backend d’abord, ensuite frontend
- Utilise des tickets / tâches bien claires
- Garde le backlog à jour
- Note ton point d’avancement à la fin de chaque session

## 12. Exemple d’ordre de tâches
1. Construire `backend/prisma/schema.prisma`
2. Créer `backend/src/app.js` (+ Express)
3. Créer l’API `POST /api/auth/register`
4. Créer l’API `POST /api/auth/login`
5. Lancer le premier cercle dans `backend`
6. Bâtir la page `frontend/pages/login.js`
7. Bâtir la page `frontend/pages/register.js`
8. Bâtir la page `frontend/pages/dashboard.js`

## 13. Structure de config recommandée
- `backend/.env`
- `frontend/.env.local`
- `backend/prisma/schema.prisma`
- `frontend/next.config.js`
- `frontend/package.json`
- `backend/package.json`

## 14. Fin de projet
Quand tu atteins un MVP stable :
- tester le flux complet
- valider un cercle complet
- vérifier le dashboard admin
- documenter l’architecture et les routes
- mettre en place Git et éventuellement un deploy
