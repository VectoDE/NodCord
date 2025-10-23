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
   git clone https://github.com/vectode/NodCord.git
   cd NodCord
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Prepare Prisma:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```
4. Create a `.env` file (e.g. via your secrets management system) and add the MySQL/Discord credentials (see the README).

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

- Deploy migrations:
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

Controllers and routes live under `src/api`. Frequently used endpoints include:

- `GET /api/discord/status` – Status of the Discord bot.
- `POST /api/discord/message` – Sends a message to a channel.

Additional modules (auth, commerce, tickets, integrations) are gradually migrating to Prisma-based services. The main entry points are `src/api/routes` and the corresponding controllers.

## Discord Bot

The bot currently starts via `src/bot/index.js` (a TypeScript migration is in progress) and reuses shared services. Commands and events are managed under `src/bot/commands` and `src/bot/events`.

## Prisma Schema & Data Models

- Schema file: `prisma/schema.prisma`
- Default models: `User`, `Role`, `Project`, `Ticket` (extensible)
- Migrations: `prisma/migrations/`
- Seeds: `prisma/seed.ts` or TypeScript files inside `src/seeds/`

## Directory Structure

Refer to [`docs/meta/folder-structure.md`](../meta/folder-structure.md) for a complete overview.

## Additional Resources

- [Contributing Guide](../process/contributing.md)
- [Migration roadmap](../planning/todo.md)
- [Architecture overview](../overview/architecture.md)
