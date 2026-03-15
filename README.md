# PayFlow

En cours de développement

Plateforme SaaS de gestion de paiements et factures pour les petites entreprises.

## Architecture

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

## Démarrage rapide

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



## Stack technique


Frontend : Next.js 15 + Tailwind CSS
Backend :NestJS + Prisma ORM 
Database | PostgreSQL
Auth | JWT + Passport
Paiements :Stripe (Apple/Google Pay) + PayPal
Notifications :Twilio SMS + WhatsApp Cloud API

## Docker

```bash
# Build et lancer tout avec Docker
docker-compose -f docker-compose.yml up --build
```
