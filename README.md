# PayFlow 🚀

Plateforme SaaS de gestion de paiements et factures pour les petites entreprises.

## 🏗 Architecture

```
payflow-saas/
├── apps/
│   ├── web/          # Frontend Next.js + Tailwind CSS
│   └── api/          # Backend NestJS + Prisma
├── packages/
│   └── shared/       # Types TypeScript partagés
├── docker-compose.yml
├── Dockerfile.api
└── Dockerfile.web
```

## 🚀 Démarrage rapide

### Prérequis
- Node.js 20+
- Docker & Docker Compose (pour PostgreSQL)

### 1. Lancer la base de données
```bash
docker-compose up -d
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configurer les variables d'environnement
```bash
cp apps/api/.env.example apps/api/.env
# Modifier les valeurs dans apps/api/.env si nécessaire
```

### 4. Initialiser la base de données
```bash
cd apps/api
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Lancer l'application
```bash
# Depuis la racine
npm run dev
```

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:3001/api

## 📋 Fonctionnalités

- ✅ Authentification (JWT)
- ✅ Gestion des clients (CRUD)
- ✅ Création et gestion de factures
- ✅ Calcul automatique des taxes (TVA)
- ✅ Lien de paiement unique par facture
- ✅ Page de paiement publique (Apple Pay, Google Pay, PayPal)
- ✅ Tableau de bord avec statistiques
- ✅ Interface moderne et responsive
- 🔜 Notifications SMS (Twilio)
- 🔜 Notifications WhatsApp (Cloud API)
- 🔜 Multilingue (FR/EN)

## 🔧 Stack technique

| Composant | Technologie |
|-----------|-------------|
| Frontend | Next.js 15 + Tailwind CSS |
| Backend | NestJS + Prisma ORM |
| Database | PostgreSQL |
| Auth | JWT + Passport |
| Paiements | Stripe (Apple/Google Pay) + PayPal |
| Notifications | Twilio SMS + WhatsApp Cloud API |

## 🐳 Docker

```bash
# Build et lancer tout avec Docker
docker-compose -f docker-compose.yml up --build
```
