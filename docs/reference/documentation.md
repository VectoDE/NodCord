# NodCord Documentation

## Introduction

NodCord is an Express-based API with an integrated Discord bot written in TypeScript. Data persistence is handled through Prisma on top of a MySQL database. This document summarizes the key workflows, tooling, and project structure.

## Installation & Setup

### Requirements

- Node.js >= 18 (LTS recommended)
- npm >= 9
- Access to a MySQL 8.x or compatible instance
- Optional: Redis for sessions/caching

### Setup Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/VectoDE/NodCord.git
   cd NodCord
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Prepare Prisma (no migrations are committed yet, so use `db push` to create the schema):
   ```bash
   npx prisma generate
   npx prisma db push
   ```
4. Copy `.env.example` to `.env` (or use your secrets management system) and add the MySQL/Discord credentials (see the README). `DATABASE_URL` must be a MySQL URL.

## Development & Operations Workflows

### Starting the server

- Development with automatic reload:
  ```bash
  npm run dev
  ```
- Production after building (runs compiled code from `dist/`):
  ```bash
  npm run build
  npm start
  ```

### Prisma & Database

- Sync the schema during development:
  ```bash
  npm run prisma:push
  ```
- Deploy committed migrations (none exist yet):
  ```bash
  npm run prisma:migrate
  ```
- Regenerate the Prisma Client (after schema changes):
  ```bash
  npm run prisma:generate
  ```
- Open Prisma Studio:
  ```bash
  npm run prisma:studio
  ```

### Tests & Code Style

- Automated tests (Jest):
  ```bash
  npm test
  ```
- Check or apply formatting:
  ```bash
  npm run lint
  npm run format
  ```

## API Reference (short overview)

Controllers and routers live under `src/api` (`src/api/controllers`, `src/api/routers`); the app is assembled in `src/api/app.ts` and served under `/api/v1`. The endpoints that are documented formally (health, metrics, docs, CSRF token, API keys) are described in [`docs/openapi.yml`](../openapi.yml).

Additional modules (auth, commerce, tickets, integrations) are gradually migrating to Prisma-based services.

## Discord Bot

The bot currently starts via `src/bot/index.ts` (called from `src/server.ts`) and reuses shared services. Commands and events are managed under `src/bot/commands` and `src/bot/events`.

## Prisma Schema & Data Models

- Schema file: `prisma/schema.prisma`
- Default models: `User`, `Role`, `Project`, `Ticket` (extensible)
- Migrations: `prisma/migrations/` (not committed yet)
- Seeds: TypeScript files inside `prisma/seeds/` (`rolesSeed.ts`, `usersSeed.ts`); no `prisma db seed` entry is configured in `package.json` yet

## Directory Structure

Refer to [`docs/meta/folder-structure.md`](../meta/folder-structure.md) for a complete overview.

## Additional Resources

- [Contributing Guide](../process/contributing.md)
- [Migration roadmap](../planning/todo.md)
- [Architecture overview](../overview/architecture.md)
