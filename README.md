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
- Modular structure (API, bot, client, seeds, scripts) for easy extensions
- Extensive project and migration documentation inside the `docs/` directory
- Enterprise-ready test layout (API, bot, and EJS views) including coverage reports and JUnit output

## Technologies

| Area            | Stack                                                                 |
| --------------- | --------------------------------------------------------------------- |
| Runtime         | Node.js ≥ 18                                                          |
| Language        | TypeScript (strict mode)                                             |
| Framework       | Express.js                                                            |
| Database        | MySQL 8.x or compatible (MariaDB ≥ 10.6 verified)                     |
| ORM/Client      | Prisma                                                                |
| Discord         | discord.js                                                            |
| Tooling         | ts-node-dev, Jest (multi-project), Supertest, Testing Library, Prettier, Prisma CLI |

## Installation

### Requirements

- Node.js **>= 18** and npm **>= 9**
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
4. Generate the Prisma Client (creates `node_modules/@prisma/client` based on the schema):
   ```bash
   npx prisma generate
   ```
5. Run the initial migration against your MySQL database:
   ```bash
   npx prisma migrate deploy
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

Key npm scripts:

```json
{
  "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
  "build": "tsc --project tsconfig.json",
  "start": "node dist/server.js",
  "test": "jest --config jest.config.cjs",
  "test:api": "jest --config jest.config.cjs --selectProjects api",
  "test:bot": "jest --config jest.config.cjs --selectProjects bot",
  "test:views": "jest --config jest.config.cjs --selectProjects views",
  "test:coverage": "jest --config jest.config.cjs --coverage",
  "test:ci": "npm run lint && npm run typecheck && npm run test:coverage",
  "prisma:migrate": "prisma migrate deploy",
  "prisma:studio": "prisma studio"
}
```

- `npm run dev` starts the server with hot reloading (ts-node-dev).
- `npm run build` creates a `dist/` directory with compiled JS output.
- `npm start` launches the build in production mode.
- `npm test` executes all Jest projects (API, bot, views) together.
- `npm run test:api|bot|views` enables focused test runs per responsibility.
- `npm run test:coverage` produces combined coverage reports (`text`, `lcov`, `cobertura`).
- `npm run test:ci` chains linting, type checking, and coverage for CI/CD pipelines.
- `npm run prisma:migrate` deploys migrations to the configured database.
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

- Create a `.env` file at the project root and define `DATABASE_URL`, e.g. `mysql://user:password@localhost:3306/nodcord`.
- Use `npx prisma db push` when you want to sync the schema quickly during development.
- Run seeds through `prisma db seed`; they rely on files inside `src/seeds/`.

## Configuration

1. Create a `.env` file in the project root (or populate the version provided by your secrets management system).
2. Provide the variables required from the following categories:
   - **Core runtime:** `VERSION`, `NODE_ENV`, `SERVER_NAME`, `LOG_LEVEL`, `TZ`
   - **Server & API:** `PORT`, `BASE_URL`, `API_HTTPS`, `API_BASE_URL`, `API_PORT`
   - **Databases:** `DATABASE_URL`, `MONGO_URI`
   - **Security & monitoring:** `SESSION_SECRET`, `JWT_SECRET`, `JWT_SESSION_SECRET`, `SENTRY_AUTH_TOKEN`
   - **Client routing:** `CLIENT_HTTPS`, `CLIENT_BASE_URL`, `CLIENT_PORT`
   - **Discord & bot:** `DISCORD_*`, `BOT_ACTIVITY_*`, `OWNER_ID`
   - **OAuth:** `GOOGLE_*`, `GITHUB_*`, `LINKEDIN_*`
   - **Payments:** `STRIPE_SECRET_KEY`, `PAYPAL_CLIENT_*`
   - **Mail & contact:** `SMTP_*`, `CONTACT_EMAIL`, `CONTACT_SMTP_*`
   - **Infrastructure:** `TS_*`

Further explanations live in the module-specific files under `src/config/` and in the reference documentation under `docs/`.

## Documentation

Detailed architecture notes, installation guides, roadmaps, and process descriptions live inside [`docs/`](./docs). Key entry points:

- [`docs/guides/`](./docs/guides) – Installation, FAQ, and support guides
- [`docs/overview/`](./docs/overview) – Architecture, components, and data flows
- [`docs/planning/`](./docs/planning) – Migration plans toward full Prisma adoption
- [`docs/reference/`](./docs/reference) – Technical references and workflows
- [`docs/process/`](./docs/process) – Contributing, release, and change management

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening pull requests. It covers the branch strategy, TypeScript coding guidelines, and how to manage Prisma migrations.

## Security

Security-relevant information can be found in [SECURITY.md](./SECURITY.md). Report vulnerabilities confidentially so that we can secure the MySQL/Prisma infrastructure quickly.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

![NodCord Logo](https://imgur.com/dCl3Q6H.png)
