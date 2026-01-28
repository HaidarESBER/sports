# 🏃 SportPlan

> **Planifiez, Partagez, Progressez** — Une plateforme communautaire de planification sportive

SportPlan est une application web moderne qui permet aux sportifs de créer, partager et suivre leurs séances d'entraînement. Créez des programmes personnalisés, découvrez ceux de la communauté, et visualisez votre progression avec des statistiques détaillées.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7.3-2D3748?style=for-the-badge&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Fonctionnalités

### 🎯 Planification
- **Séances personnalisées** : Créez des séances d'entraînement détaillées avec exercices, séries, répétitions, durées et intensités
- **Programmes multi-semaines** : Organisez vos séances en programmes structurés avec planning hebdomadaire
- **Multi-sports** : Supporte la course à pied, natation, vélo, musculation et plus encore

### 👥 Communauté
- **Découverte** : Explorez les programmes et séances partagés par la communauté
- **Partage** : Partagez vos créations publiquement ou gardez-les privées
- **Réseau social** : Suivez d'autres utilisateurs, likez et commentez leurs programmes
- **Fil d'actualité** : Restez informé des activités de vos abonnements

### 📊 Suivi de progression
- **Historique** : Enregistrez vos entraînements réalisés avec données réelles vs planifiées
- **Statistiques** : Visualisez vos performances avec des graphiques et métriques
- **Records personnels** : Suivez vos meilleures performances par exercice
- **Séries consécutives** : Suivez votre régularité d'entraînement

### 🔐 Sécurité & Authentification
- **Authentification sécurisée** : Connexion par email/mot de passe avec bcrypt
- **OAuth** : Support Google et GitHub (optionnel)
- **Sessions JWT** : Gestion sécurisée des sessions utilisateur

## 🛠️ Stack Technique

### Frontend
- **Next.js 16** (App Router) - Framework React avec SSR/SSG
- **React 19** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utilitaire
- **Recharts** - Visualisation de données

### Backend
- **Next.js API Routes** - API RESTful
- **Prisma 7** - ORM moderne
- **SQLite** (better-sqlite3) - Base de données
- **Auth.js v5** - Authentification

### Outils
- **ESLint** - Linting
- **TypeScript** - Compilation
- **Prisma Migrate** - Migrations de base de données

## 🚀 Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Git

### Étapes

1. **Cloner le repository**
   ```bash
   git clone https://github.com/HaidarESBER/sports.git
   cd sports
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env
   ```
   
   Éditez `.env` et configurez :
   ```env
   DATABASE_URL="file:./dev.db"
   AUTH_SECRET="votre-secret-aleatoire-ici"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Optionnel : OAuth providers
   # GOOGLE_CLIENT_ID=""
   # GOOGLE_CLIENT_SECRET=""
   # GITHUB_CLIENT_ID=""
   # GITHUB_CLIENT_SECRET=""
   ```

4. **Initialiser la base de données**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

6. **Ouvrir dans le navigateur**
   ```
   http://localhost:3000
   ```

## 📖 Utilisation

### Créer un compte
1. Cliquez sur "S'inscrire" ou "Commencer gratuitement"
2. Remplissez votre email et mot de passe
3. Complétez votre profil (optionnel)

### Créer une séance
1. Allez dans "Séances" → "Nouvelle séance"
2. Ajoutez un nom, description, sport et durée estimée
3. Ajoutez des exercices avec leurs paramètres (séries, répétitions, durée, etc.)
4. Sauvegardez

### Créer un programme
1. Allez dans "Programmes" → "Nouveau programme"
2. Définissez le nom, description, sport et durée en semaines
3. Ajoutez des séances existantes ou créez-en de nouvelles
4. Organisez-les par semaine et jour de la semaine
5. Partagez publiquement ou gardez-le privé

### Enregistrer un entraînement
1. Allez dans "Progression" → "Enregistrer un entraînement"
2. Choisissez une séance existante ou créez-en une nouvelle
3. Remplissez les données réelles (séries effectuées, poids, durée, etc.)
4. Ajoutez une note et une note de satisfaction (1-5)
5. Sauvegardez

### Visualiser votre progression
1. Allez dans "Progression"
2. Consultez vos statistiques globales
3. Explorez les graphiques de vos performances
4. Consultez vos records personnels

## 📁 Structure du Projet

```
sportplan/
├── prisma/
│   ├── schema.prisma          # Schéma de base de données
│   └── seed.ts                # Script de seed (à venir)
├── src/
│   ├── app/                   # Pages Next.js (App Router)
│   │   ├── api/              # Routes API
│   │   ├── (auth)/           # Pages d'authentification
│   │   ├── discover/         # Découverte de contenu
│   │   ├── programs/         # Gestion des programmes
│   │   ├── sessions/         # Gestion des séances
│   │   ├── progress/         # Suivi de progression
│   │   ├── workouts/         # Historique des entraînements
│   │   └── feed/             # Fil d'actualité
│   ├── components/           # Composants React réutilisables
│   │   ├── ui/               # Composants UI de base
│   │   └── ...               # Autres composants
│   ├── lib/                  # Utilitaires et configurations
│   │   ├── auth.ts           # Configuration Auth.js
│   │   ├── db.ts             # Instance Prisma
│   │   ├── metadata.ts       # SEO metadata
│   │   └── viewport.ts       # Configuration viewport
│   └── middleware.ts         # Middleware Next.js
├── .planning/                # Documentation de planification
├── next.config.ts            # Configuration Next.js
├── tailwind.config.ts        # Configuration Tailwind
└── package.json              # Dépendances npm
```

## 🎨 Design System

Le projet utilise un système de design cohérent avec des composants réutilisables :

- **Button** : Boutons avec variantes (primary, secondary, outline, ghost, danger)
- **Card** : Cartes avec variantes (default, interactive)
- **Input** : Champs de formulaire avec validation
- **Badge** : Badges pour sports et statuts
- **LoadingSpinner** : Indicateurs de chargement
- **Skeleton** : Placeholders de chargement

## 🔧 Scripts Disponibles

```bash
npm run dev      # Démarrer le serveur de développement
npm run build    # Construire pour la production
npm run start    # Démarrer le serveur de production
npm run lint     # Linter le code
npm run seed     # Seed la base de données (à venir)
```

## 🗄️ Base de Données

Le schéma Prisma inclut :

- **User** : Utilisateurs et profils
- **Session** : Séances d'entraînement
- **Program** : Programmes multi-semaines
- **Exercise** : Exercices disponibles
- **WorkoutLog** : Historique des entraînements réalisés
- **Like** : Likes sur programmes/séances
- **Comment** : Commentaires
- **Activity** : Fil d'actualité
- **Follow** : Relations followers/abonnés

## 🚧 État du Projet

**Phase actuelle** : ✅ **100% Complété** (10/10 phases)

- ✅ Phase 1-7 : Core features (auth, sessions, programs, discovery)
- ✅ Phase 8 : Progression tracking (workout logging, stats, charts)
- ✅ Phase 9 : Social features (likes, comments, activity feed)
- ✅ Phase 10 : UI/UX polish & production readiness

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créez une branche pour votre feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

### Convention de commits

Ce projet suit le format [Conventional Commits](https://www.conventionalcommits.org/) :

- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation
- `style:` Formatage, point-virgules manquants, etc.
- `refactor:` Refactoring de code
- `test:` Ajout de tests
- `chore:` Maintenance

## 📝 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👤 Auteur

**Haidar ESBER**

- GitHub: [@HaidarESBER](https://github.com/HaidarESBER)
- Repository: [sports](https://github.com/HaidarESBER/sports)

## 🙏 Remerciements

- [Next.js](https://nextjs.org/) pour le framework incroyable
- [Prisma](https://www.prisma.io/) pour l'ORM moderne
- [Tailwind CSS](https://tailwindcss.com/) pour le framework CSS
- [Auth.js](https://authjs.dev/) pour l'authentification
- [Recharts](https://recharts.org/) pour les graphiques

---

⭐ Si ce projet vous plaît, n'hésitez pas à lui donner une étoile !

