# User Stories et Backlog - TontinePro

## 1. Super Administrateur

### User Story 1
- En tant que **Super Admin**, je veux **valider l’identité (KYC)** des créateurs de groupes pour éviter les fraudes et les arnaques.

#### Besoins
- Recevoir les documents d’identité des organisateurs
- Afficher le statut KYC (`pending`, `approved`, `rejected`)
- Pouvoir approuver ou refuser une demande
- Enregistrer l’historique de décision

#### Tâches
- [ ] Concevoir le modèle KYC dans la base de données
- [ ] Créer l’API pour soumettre une demande KYC
- [ ] Créer l’API admin pour lister et valider les demandes
- [ ] Ajouter un tableau de bord KYC dans l’interface Super Admin
- [ ] Stocker les décisions et les métadonnées de validation

### User Story 2
- En tant que **Super Admin**, je veux **configurer des frais de service** (par exemple 1% sur chaque cycle) pour rentabiliser la plateforme.

#### Besoins
- Définir un taux global de service
- Gérer plusieurs types de frais (`service_fee`, `transaction_fee`)
- Appliquer les frais automatiquement sur les cycles / paiements
- Modifier les paramètres facilement

#### Tâches
- [ ] Concevoir le modèle `platform_settings`
- [ ] Créer l’API pour lire et modifier les frais
- [ ] Intégrer les frais dans le calcul des cycles et paiements
- [ ] Ajouter une interface de configuration pour le Super Admin

### User Story 3
- En tant que **Super Admin**, je veux **voir un dashboard global** pour connaître le volume total d’argent et le nombre de litiges.

#### Besoins
- Voir le montant total géré sur la plateforme
- Voir le nombre de groupes actifs
- Voir le nombre de litiges ouverts
- Voir les indicateurs de santé (paiements manquants, fraudes, KYC en attente)

#### Tâches
- [ ] Définir les métriques du dashboard
- [ ] Créer l’API de statistiques globales
- [ ] Construire l’interface du dashboard admin
- [ ] Connecter le dashboard aux données réelles de la plateforme

### User Story 4
- En tant que **Super Admin**, je veux **bannir un fraudeur** pour protéger les fonds et la confiance.

#### Besoins
- Avoir une liste des utilisateurs suspectés / signalés
- Bloquer l’accès d’un utilisateur
- Conserver l’historique de bannissement

#### Tâches
- [ ] Ajouter le statut `banned` à l’entité utilisateur
- [ ] Créer l’API de bannissement et de débannissement
- [ ] Mettre en place un filtre de sécurité pour bloquer l’accès
- [ ] Créer un journal des actions de bannissement

## 2. Organisateur / Gestionnaire

### User Story 5
- En tant qu’**Organisateur**, je veux **définir les règles du cercle** (montant de la part, fréquence, nombre de places) pour structurer ma tontine.

#### Besoins
- Créer un cercle avec un nom et une description
- Paramétrer le montant de chaque cotisation
- Choisir la fréquence (`hebdomadaire`, `mensuelle`)
- Fixer le nombre de membres
- Définir si le cercle est public ou privé

#### Tâches
- [ ] Concevoir le modèle `cercle` / `tontine`
- [ ] Créer l’API de création et de mise à jour du cercle
- [ ] Ajouter la gestion des règles de fréquence et de montant
- [ ] Développer l’interface de création du cercle

### User Story 6
- En tant qu’**Organisateur**, je veux **générer un lien d’invitation unique** pour recruter des membres.

#### Besoins
- Générer un lien sécurisé
- Envoyer le lien par message ou partager directement
- Suivre les invitations acceptées
- Révoquer une invitation si nécessaire

#### Tâches
- [ ] Concevoir le modèle `invitation`
- [ ] Créer l’API de génération d’invitation
- [ ] Ajouter l’interface de partage de lien
- [ ] Suivre le statut des invitations acceptées et expirées
- [ ] Implémenter l’annulation d’une invitation

### User Story 7
- En tant qu’**Organisateur**, je veux **valider manuellement les paiements hors-ligne** pour que le système soit à jour même sans paiement digital.

#### Besoins
- Saisir un paiement cash ou virement direct
- Associer un paiement à un membre et à un cycle
- Marquer le paiement comme confirmé
- Générer éventuellement un reçu de paiement

#### Tâches
- [ ] Concevoir le modèle `paiement`
- [ ] Créer l’API de validation hors-ligne
- [ ] Développer l’interface pour saisir les paiements cash
- [ ] Générer un reçu lié à la transaction

### User Story 8
- En tant qu’**Organisateur**, je veux **clôturer un cycle et déclencher le versement au bénéficiaire** pour avancer dans la tontine.

#### Besoins
- Vérifier que tous les membres ont payé ou que le cycle peut être clos
- Sélectionner le bénéficiaire du cycle
- Lancer le versement ou préparer la distribution
- Archiver le cycle terminé

#### Tâches
- [ ] Concevoir le modèle `cycle`
- [ ] Créer l’API de clôture de cycle
- [ ] Développer la logique de versement et d’archivage
- [ ] Ajouter un écran de clôture de cycle dans l’interface

## 3. Membre

### User Story 9
- En tant que **Membre**, je veux **payer ma cotisation via Mobile Money (Flooz/T-Money)** directement depuis l’app pour gagner du temps.

#### Besoins
- Sélectionner un mode de paiement mobile
- Effectuer le paiement depuis l’application
- Recevoir la confirmation de paiement
- Voir le statut du paiement (`en attente`, `confirmé`, `rejeté`)

#### Tâches
- [ ] Concevoir l’API de paiement Mobile Money
- [ ] Intégrer le prestataire de paiement
- [ ] Construire l’interface de paiement pour le membre
- [ ] Afficher le statut de paiement en temps réel

### User Story 10
- En tant que **Membre**, je veux **consulter l’ordre de passage** pour savoir quand je recevrai la cagnotte.

#### Besoins
- Voir la liste des membres et l’ordre de distribution
- Connaître ma date de passage
- Comprendre le montant que je recevrai
- Voir le statut du cycle en cours

#### Tâches
- [ ] Créer l’API pour l’ordre de passage
- [ ] Afficher la progression du cycle dans l’interface
- [ ] Calculer les dates de passage et les montants

### User Story 11
- En tant que **Membre**, je veux **recevoir une notification 24h avant l’échéance** pour ne pas oublier mon paiement.

#### Besoins
- Reminder automatique avant chaque date limite
- Notifications push, SMS ou email
- Message clair avec montant et date

#### Tâches
- [ ] Concevoir le système de notifications
- [ ] Planifier les rappels 24h avant échéance
- [ ] Implémenter les canaux SMS / email / push
- [ ] Ajouter les paramètres de notification utilisateur

### User Story 12
- En tant que **Membre**, je veux **télécharger un reçu de paiement** après chaque transaction pour avoir une preuve juridique.

#### Besoins
- Générer un reçu PDF ou un document téléchargeable
- Stocker le reçu lié à la transaction
- Retrouver facilement les reçus passés

#### Tâches
- [ ] Créer le modèle de reçu de paiement
- [ ] Générer des reçus téléchargeables après chaque paiement
- [ ] Ajouter l’historique des reçus dans l’interface
- [ ] Stocker les reçus liés aux transactions

## 4. Backlog priorisé

### Priorité haute
- [ ] Authentification et roles (`super_admin`, `organisateur`, `membre`)
- [ ] Création et structure de cercle
- [ ] Modèle et API de paiement
- [ ] Génération de lien d’invitation
- [ ] Dashboard Super Admin minimal

### Priorité moyenne
- [ ] Validation KYC des organisateurs
- [ ] Configuration des frais de service
- [ ] Clôture de cycle et versement
- [ ] Suivi de l’ordre de passage
- [ ] Reçu de paiement téléchargeable

### Priorité basse
- [ ] Notifications 24h avant échéance
- [ ] Bannissement et gestion des litiges
- [ ] Historique complet des cycles
- [ ] Statistiques avancées
- [ ] Support de plusieurs modes de paiement
