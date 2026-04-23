# Instructions IA - TontinePro

## Objectif

Ce fichier s’adresse à l’agent IA / agent de code qui travaille sur TontinePro.
Il définit les consignes à suivre pour rester concentré sur le développement, le design et l’architecture du projet.
Le projet utilise :
- **Frontend** : Next.js
- **UI** : shadcn/ui + Tailwind CSS
- **Backend** : Node.js + Express
- **Base de données** : PostgreSQL
- **ORM** : Prisma

## Règles générales

1. Rester concentré sur le projet.
   - Pas de propositions hors sujet.
   - Pas de frameworks alternatifs différents de ceux indiqués.

2. Toujours donner des solutions adaptées à la stack :
   - **Next.js** pour le frontend et les pages.
   - **shadcn/ui** pour les composants et le style.
   - **Tailwind CSS** comme système de styles.
   - **Express** pour les routes API et le backend.
   - **Prisma** pour la définition du schéma et l’accès à PostgreSQL.
   -**typescript** pour le projet pas de jevascript

3. Préférer une approche modulaire et lisible.
   - Code clair, maintenable et bien structuré.
   - Utiliser des composants réutilisables dans `frontend/components`.
   - Garder les routes backend simples et séparées par domaine.

## Comportement attendu

### Quand l’utilisateur demande du design
- Proposer une solution basée sur la charte graphique du projet.
- Utiliser les palettes de couleurs et typographies définies dans `docs/charte-graphique.md`.
- Préférer des composants shadcn/ui existants ou des composants personnalisés compatibles avec Tailwind.

### Quand l’utilisateur demande de l’architecture
- Proposer une architecture claire du projet.
- Indiquer les dossiers et fichiers à créer pour chaque fonctionnalité.
- Séparer frontend et backend.
- Donner un ordre de développement étape par étape.

### Quand l’utilisateur demande du code
- Fournir du code concret, prêt à être copié.
- Inclure les chemins de fichiers précis.
- Préciser les dépendances nécessaires.
- Ne pas inventer des bibliothèques non installées.

## Contenus à privilégier

### Frontend
- `frontend/app/` ou `frontend/pages/` selon l’organisation choisie.
- `frontend/components/` pour les composants UI.
- `frontend/styles/` pour les styles Tailwind ou CSS.
- Pages prioritaires : login, register, dashboard, circle, admin.
- Utiliser shadcn/ui pour : cards, boutons, formulaires, modals, layouts.

### Backend
- `backend/src/` pour le code Express.
- `backend/src/routes/` pour les routes.
- `backend/src/controllers/` pour la logique métier.
- `backend/src/middlewares/` pour l’auth et la sécurité.
- `backend/prisma/schema.prisma` pour la base de données.

### Base de données
- Utiliser Prisma pour définir le schéma.
- Générer les migrations avec `npx prisma migrate dev`.
- Préférer des modèles simples et cohérents avec les user stories.

## Format des réponses

- Commencer par un court résumé.
- Fournir une liste d’étapes si on parle de développement.
- Donner des exemples de fichiers et de commandes.
- Si l’utilisateur demande du code, fournir le code complet du fichier.

## Ce qu’il ne faut pas faire

- Ne pas proposer de migration vers une autre stack.
- Ne pas suggérer de composants UI d’autres bibliothèques que shadcn/ui sauf si c’est strictement nécessaire.
- Ne pas écrire des solutions trop générales : il faut être concret et lié au projet.
- Ne pas ignorer la charte graphique.

## Exemple de prompt idéal

- "Propose-moi le composant Next.js pour la page de connexion avec shadcn/ui."
- "Écris le modèle Prisma pour `User`, `Circle` et `Payment`."
- "Donne-moi la structure de dossiers backend pour Express et Prisma."
- "Aide-moi à créer la page admin dashboard en respectant la charte graphique."

## Conclusion

L’IA doit rester un assistant pratique et direct pour construire TontinePro.
Toutes les réponses doivent être alignées sur la stack choisie : **Next.js, shadcn/ui, Node.js/Express, PostgreSQL, Prisma**.
