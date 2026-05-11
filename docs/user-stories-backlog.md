# User Stories et Backlog - TontinePro

## 1. Super Administrateur

### User Story 1 ✅ COMPLÈTE
- En tant que **Super Admin**, je veux **valider l'identité (KYC)** des créateurs de groupes pour éviter les fraudes et les arnaques.

#### Tâches
- [x] Concevoir le modèle KYC dans la base de données (`KycRequest` dans schema.prisma)
- [x] Créer l'API pour soumettre une demande KYC (`POST /api/users/kyc`)
- [x] Créer l'API admin pour lister et valider les demandes (`GET /api/admin/kyc`, `PATCH /api/admin/kyc/:id`)
- [x] Ajouter un tableau de bord KYC dans l'interface Super Admin (page `/admin/kyc`)
- [x] Stocker les décisions et les métadonnées de validation (`reviewedAt`, `reviewNote`)

### User Story 2 ✅ COMPLÈTE
- En tant que **Super Admin**, je veux **configurer des frais de service** pour rentabiliser la plateforme.

#### Tâches
- [x] Concevoir le modèle `platform_settings` (`PlatformSetting` dans schema.prisma)
- [x] Créer l'API pour lire et modifier les frais (`GET /api/admin/settings`, `PATCH /api/admin/settings`)
- [x] Ajouter une interface de configuration pour le Super Admin (page `/admin/settings`)
- [x] Intégrer les frais dans le calcul des cycles et paiements (`lib/fees.ts` — `service_fee` déduit à la clôture, `transaction_fee` ajouté sur Mobile Money)

### User Story 3 ✅ COMPLÈTE
- En tant que **Super Admin**, je veux **voir un dashboard global** pour connaître le volume total d'argent et le nombre de litiges.

#### Tâches
- [x] Définir les métriques du dashboard (totalUsers, activeCircles, totalPayments, pendingKyc, totalVolume)
- [x] Créer l'API de statistiques globales (`GET /api/admin/dashboard`)
- [x] Construire l'interface du dashboard admin (page `/admin/dashboard`)
- [x] Connecter le dashboard aux données réelles de la plateforme

### User Story 4 ✅ COMPLÈTE
- En tant que **Super Admin**, je veux **bannir un fraudeur** pour protéger les fonds et la confiance.

#### Tâches
- [x] Ajouter le statut `banned` à l'entité utilisateur (`UserStatus.BANNED` dans schema.prisma)
- [x] Créer l'API de bannissement et de débannissement (`PATCH /api/admin/users/:id/ban`, `/unban`)
- [x] Mettre en place un filtre de sécurité pour bloquer l'accès (middleware `requireAuth` vérifie le statut BANNED)
- [x] Créer un journal des actions de bannissement (modèle `BanLog` + migration + `GET /api/admin/ban-logs` + page `/admin/ban-logs`)

## 2. Organisateur / Gestionnaire

### User Story 5 ✅ COMPLÈTE
- En tant qu'**Organisateur**, je veux **définir les règles du cercle** pour structurer ma tontine.

#### Tâches
- [x] Concevoir le modèle `cercle` / `tontine` (`Circle` dans schema.prisma)
- [x] Créer l'API de création et de mise à jour du cercle (`POST /api/circles`, `GET /api/circles/:id`)
- [x] Ajouter la gestion des règles de fréquence et de montant (champs `frequency`, `amount`, `maxMembers`, `isPublic`)
- [x] Développer l'interface de création du cercle (`/dashboard/circles/new`)

### User Story 6 ✅ COMPLÈTE
- En tant qu'**Organisateur**, je veux **générer un lien d'invitation unique** pour recruter des membres.

#### Tâches
- [x] Concevoir le modèle `invitation` (`Invitation` dans schema.prisma avec token unique CUID)
- [x] Créer l'API de génération d'invitation (`POST /api/circles/:circleId/invitations`)
- [x] Ajouter l'interface de partage de lien (page `/join/[token]`)
- [x] Suivre le statut des invitations acceptées et expirées (statuts PENDING, ACCEPTED, EXPIRED, REVOKED)
- [x] Implémenter l'annulation d'une invitation (`PATCH /api/invitations/:token/revoke` + bouton Révoquer dans l'interface)

### User Story 7 ✅ COMPLÈTE
- En tant qu'**Organisateur**, je veux **valider manuellement les paiements hors-ligne** pour que le système soit à jour même sans paiement digital.

#### Tâches
- [x] Concevoir le modèle `paiement` (`Payment` dans schema.prisma avec méthodes CASH, VIREMENT, MOBILE_MONEY)
- [x] Créer l'API de validation hors-ligne (`POST /api/payments` crée directement en CONFIRMED pour l'organisateur)
- [x] Développer l'interface pour saisir les paiements cash (interface dans la page cercle `/dashboard/circles/[id]`)
- [x] Générer un reçu lié à la transaction (`GET /api/payments/:id/receipt` — PDF via pdfkit)

### User Story 8 — Partielle
- En tant qu'**Organisateur**, je veux **clôturer un cycle et déclencher le versement au bénéficiaire** pour avancer dans la tontine.

#### Tâches
- [x] Concevoir le modèle `cycle` (`Cycle` dans schema.prisma avec statuts OPEN, CLOSED, ARCHIVED)
- [x] Créer l'API de clôture de cycle (`PATCH /api/cycles/:id/close` avec sélection du bénéficiaire)
- [x] Ajouter un écran de clôture de cycle dans l'interface (modal avec sélection du bénéficiaire)
- [ ] Développer la logique de versement réel (dépend de l'intégration Mobile Money)

## 3. Membre

### User Story 9 ✅ COMPLÈTE (mock)
- En tant que **Membre**, je veux **payer ma cotisation via Mobile Money** directement depuis l'app.

#### Tâches
- [x] Afficher le statut de paiement en temps réel (statuts PENDING, CONFIRMED, REJECTED + notifications)
- [x] Concevoir l'API de paiement Mobile Money (`POST /api/payments/mobile-money` — mock avec confirmation auto 3s)
- [x] Construire l'interface de paiement initié par le membre (page `/dashboard/member/pay`)
- [ ] Intégrer le vrai prestataire de paiement Flooz/T-Money (à faire quand le système sera en production)

### User Story 10 ✅ COMPLÈTE
- En tant que **Membre**, je veux **consulter l'ordre de passage** pour savoir quand je recevrai la cagnotte.

#### Tâches
- [x] Créer l'API pour l'ordre de passage (`PATCH /api/circles/:id/order` + champ `order` dans Membership)
- [x] Afficher la progression du cycle dans l'interface (page `/dashboard/member/order`)
- [x] Calculer les dates de passage et les montants estimés

### User Story 11 — Partielle
- En tant que **Membre**, je veux **recevoir une notification 24h avant l'échéance** pour ne pas oublier mon paiement.

#### Tâches
- [x] Concevoir le système de notifications (modèle `Notification` + API complète)
- [x] Planifier les rappels 24h avant échéance (cron job `node-cron` dans `jobs/reminder.job.ts`)
- [x] Implémenter les canaux email pour les notifications (rappel cotisation + confirmation paiement + décision KYC via Nodemailer)
- [ ] Implémenter les canaux SMS / push (à faire en production)
- [ ] Ajouter les paramètres de notification utilisateur (activer/désactiver les canaux)

### User Story 12 ✅ COMPLÈTE
- En tant que **Membre**, je veux **télécharger un reçu de paiement** après chaque transaction pour avoir une preuve juridique.

#### Tâches
- [x] Générer des reçus PDF téléchargeables (`GET /api/payments/:id/receipt` via pdfkit)
- [x] Ajouter l'historique des paiements dans l'interface (page `/dashboard/member/payments`)
- [x] Bouton de téléchargement du reçu pour chaque paiement confirmé

## 4. Backlog priorisé

### Priorité haute — ✅ TOUT FAIT
- [x] Authentification et rôles (`super_admin`, `organisateur`, `membre`)
- [x] Création et structure de cercle
- [x] Modèle et API de paiement
- [x] Génération de lien d'invitation
- [x] Dashboard Super Admin (API + interface `/admin/dashboard`)

### Priorité moyenne — ✅ TOUT FAIT
- [x] Validation KYC des organisateurs (API + interface `/admin/kyc`)
- [x] Configuration des frais de service (API + interface `/admin/settings`)
- [x] Clôture de cycle et versement (API + modal interface)
- [x] Suivi de l'ordre de passage (API + interface `/dashboard/member/order`)
- [x] Reçu de paiement téléchargeable (PDF via pdfkit)

### Priorité basse — En cours
- [x] Rappels 24h avant échéance (cron job in-app ✅, SMS/email/push ❌)
- [x] Bannissement et journal des actions (bannissement ✅, journal ✅, litiges ❌)
- [ ] Intégration Mobile Money Flooz/T-Money
- [ ] Canaux SMS / email pour les notifications
- [ ] Paramètres de notification utilisateur
- [ ] Intégration des frais dans le calcul des cycles
- [ ] Logique de versement réel au bénéficiaire
- [ ] Gestion des litiges
