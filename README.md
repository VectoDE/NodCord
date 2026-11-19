# NodCord

![NodCord Logo with Text](https://github.com/user-attachments/assets/f13e96c2-4dff-48f9-8da0-c2acfd49c09b)

NodCord is a **TypeScript** service platform for Discord automation. The REST API is powered by Express.js, the integrated bot uses discord.js, and all persistence is handled through **Prisma** with a MySQL database. The goal is to provide a unified codebase so that the API, bot, and supporting tools all operate on the same data sources.

> 💡 The application is currently migrating from older JavaScript/Mongoose components. New contributions should follow the TypeScript/Prisma stack described here.

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
- [Usage](#usage)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [Database & Prisma](#database--prisma)
- [Configuration](#configuration)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)

## Features

- REST API with a TypeScript controller layer and strongly typed responses
- Discord bot that shares services and database access through Prisma
- MySQL as the central data source (run locally via Docker or use a hosted instance)
- Modular structure (API, bot, client, Prisma seeds, scripts) for easy extensions
- Extensive project and migration documentation inside the `docs/` directory
- Enterprise-ready test layout (API, bot, and EJS views) including coverage reports and JUnit output

## Technologies

| Area       | Stack                                                                               |
| ---------- | ----------------------------------------------------------------------------------- |
| Runtime    | Node.js 20.17.0 (npm 11.6.2)                                                        |
| Language   | TypeScript (strict mode)                                                            |
| Framework  | Express.js                                                                          |
| Database   | MySQL 8.x or compatible (MariaDB ≥ 10.6 verified)                                   |
| ORM/Client | Prisma                                                                              |
| Discord    | discord.js                                                                          |
| Tooling    | nodemon, esbuild, Jest (multi-project), Supertest, Testing Library, Prettier, Prisma CLI |

## Installation

### Requirements

- Node.js **20.17.0** and npm **11.6.2** (as declared in `engines` in `package.json`; `.nvmrc` matches)
- Running MySQL instance (e.g. Docker: `docker run --name nodcord-mysql -e MYSQL_ROOT_PASSWORD=secret -p 3306:3306 -d mysql:8`)
- Git

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/vectode/NodCord.git
   ```
2. Enter the project directory:
   ```bash
   cd NodCord
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Generate the Prisma Client (creates `node_modules/@prisma/client` based on the schema; also runs automatically after `npm install`):
   ```bash
   npx prisma generate
   ```
5. Create the schema in your MySQL database. No Prisma migrations are committed yet, so `prisma migrate deploy` has nothing to apply:
   ```bash
   npx prisma db push
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

Key npm scripts:

```json
{
  "dev": "nodemon --config nodemon.json",
  "build": "node scripts/build.mjs",
  "start": "node --import ./scripts/register-alias-loader.mjs dist/src/server.js",
  "test": "jest --config jest.config.cjs",
  "test:api": "jest --config jest.config.cjs --selectProjects api",
  "test:bot": "jest --config jest.config.cjs --selectProjects bot",
  "test:views": "jest --config jest.config.cjs --selectProjects views",
  "test:coverage": "jest --config jest.config.cjs --coverage",
  "test:ci": "npm run lint && npm run typecheck && npm run test:coverage",
  "prisma:push": "prisma db push",
  "prisma:migrate": "prisma migrate deploy",
  "prisma:studio": "prisma studio"
}
```

- `npm run dev` starts the server with nodemon (configuration in `nodemon.json`, watches `src` and `prisma`).
- `npm run build` runs `scripts/build.mjs` (esbuild) and creates a `dist/` directory with the compiled JS output.
- `npm start` runs the build first (`prestart`) and then launches `dist/src/server.js`.
- `npm test` executes all Jest projects (API, bot, views) together.
- `npm run test:api|bot|views` enables focused test runs per responsibility.
- `npm run test:coverage` produces combined coverage reports (`text`, `lcov`, `cobertura`).
- `npm run test:ci` chains linting, type checking, and coverage for CI/CD pipelines.
- `npm run prisma:push` syncs the schema to the configured database (`prisma db push`).
- `npm run prisma:migrate` runs `prisma migrate deploy`. It only applies committed migrations, and none exist yet.
- `npm run prisma:studio` opens the Prisma Studio UI for data inspection.

## Testing & Quality Assurance

The test landscape is based on a Jest multi-project configuration:

- **API**: Runs in the Node test environment and uses `supertest`/`nock` to validate REST endpoints and external integrations.
- **Bot**: Uses the Node environment so Discord-specific services can be tested in isolation through mocks.
- **Views**: Runs in the `jsdom` environment and relies on `@testing-library/jest-dom` to verify EJS templates and client-adjacent logic.

All projects share `jest.setup.ts`, which enables `jest-extended` and unifies the runtime environment. Test results are also exported as a JUnit file at `reports/junit/jest-junit.xml`, and coverage reports are collected inside `coverage/`.

> 💡 Run `npm run test:watch -- --selectProjects api` to start any area in watch mode.

## Database & Prisma

The Prisma schema lives at [`prisma/schema.prisma`](./prisma/schema.prisma). It defines all models (e.g. users, roles, projects) and describes relations plus constraints for MySQL. Additional tips:

- Copy `.env.example` to `.env` and set `DATABASE_URL`, e.g. `mysql://user:password@localhost:3306/nodcord`. The example value in `.env.example` points to PostgreSQL, the schema targets MySQL.
- Use `npx prisma db push` (`npm run prisma:push`) to sync the schema. There is no `prisma/migrations/` directory yet.
- Seed files live in `prisma/seeds/` (`rolesSeed.ts`, `usersSeed.ts`). `package.json` has no `prisma db seed` entry yet, so `npm run prisma:seed` has nothing to run.

## Configuration

1. Copy `.env.example` to `.env` in the project root (or populate the version provided by your secrets management system).
2. Provide the variables required from the following categories:
   - **Core runtime:** `NODE_ENV`, `TZ`, `SERVICE_NAME`, `API_VERSION`, `API_STATUS`
   - **Server & API:** `PORT`, `BASE_URL`, `API_HTTPS`, `API_BASE_URL`, `API_PORT`, `API_KEY`, `BOT_API_KEY`
   - **Databases:** `DATABASE_URL`, `PROD_DATABASE_URL`, `DEV_DATABASE_URL`, `TEST_DATABASE_URL`, `STAGING_DATABASE_URL`, `DATABASE_STATUS`, `DISABLE_PRISMA`
   - **Security:** `SESSION_SECRET`, `JWT_*`, `ACCESS_TOKEN_SECRET`, `COOKIE_DOMAIN`, `COOKIE_SECURE`, `CSRF_SECRET`
   - **Client routing:** `CLIENT_HTTPS`, `CLIENT_BASE_URL`, `CLIENT_PORT`
   - **Discord & bot:** `BOT_TOKEN`, `DISCORD_*`, `DEV_GUILD_ID`, `CLIENT_ID`, `OWNER_ID`
   - **Payments:** `STRIPE_*`
   - **Mail, SMS & contact:** `SMTP_*`, `CONTACT_EMAIL`, `CONTACT_SMTP_*`, `SMS_*`
   - **Seeds:** `SEED_*`
   - **Further:** `CLOUDNET_*`, `PUBLIC_AI_*`
   - **Translation (`/translate`):** `LIBRETRANSLATE_URL`, `LIBRETRANSLATE_API_KEY`. Only a self-hosted LibreTranslate server is accepted (https, or http on localhost/private networks/a Docker service name); public instances are refused and an empty URL keeps the command off. Users must agree once before their first translation and can withdraw with `/translate-consent revoke`. Operator duties and a sample privacy notice: [`docs/guides/translation-privacy.md`](./docs/guides/translation-privacy.md).

Further explanations live in the module-specific files under `src/configs/` and in the reference documentation under `docs/`.

## Documentation

Detailed architecture notes, installation guides, roadmaps, and process descriptions live inside [`docs/`](./docs). Key entry points:

- [`docs/guides/`](./docs/guides) – Installation, FAQ, support, and translation privacy guides
- [`docs/overview/`](./docs/overview) – Architecture, components, and data flows
- [`docs/planning/`](./docs/planning) – Migration plans toward full Prisma adoption
- [`docs/reference/`](./docs/reference) – Technical references and workflows
- [`docs/process/`](./docs/process) – Contributing, release, and change management

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening pull requests. It covers the branch strategy, TypeScript coding guidelines, and how to keep the Prisma schema in sync (`prisma db push` until the first migration is committed).

## Security

Security-relevant information can be found in [SECURITY.md](./SECURITY.md). Report vulnerabilities confidentially so that we can secure the MySQL/Prisma infrastructure quickly.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

![NodCord Logo](https://imgur.com/dCl3Q6H.png)
