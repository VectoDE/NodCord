# NodCord 2.0.0 – Detailed Plan for the Full Migration

This plan complements the high-level roadmap in [`todo.md`](./todo.md) and describes concrete steps toward a production-ready TypeScript/Prisma/MySQL release. Each task is formulated so it can be verified through testing.

## 1. Tooling & Infrastructure

- [ ] **Unify TypeScript tooling:** Finalize `tsconfig.json`, add shared ESLint/Prettier configuration, define path aliases for `src/api`, `src/bot`, `src/client`.
- [ ] **Standardize the dev server:** Keep `npm run dev` (ts-node-dev) as the single entry point and ensure hot reload works for both API and bot.
- [ ] **Prisma project structure:** Maintain the `prisma/` directory with `schema.prisma`, migrations, and optional seeds; rely on the `npm run prisma:*` scripts.
- [ ] **Environment management:** Maintain a central `.env` baseline in secrets management (MySQL, Redis, OAuth, bot), document secret handling, review dotenv entry points.
- [ ] **CI/CD expansion:** Define the pipeline (build, test, Prisma migrate, Prisma generate). Prepare GitHub Actions.

## 2. Data Model & Persistence

- [ ] **Extend the Prisma schema:** Translate all remaining Mongoose models (`src/models/*.ts`) into `prisma/schema.prisma`, including relations, enums, and default values.
- [ ] **Migration strategy:** Create dedicated migrations for each module (auth, commerce, tickets, developer program, analytics, integrations). Plan the historical data migration (Mongo → MySQL).
- [ ] **Prisma Client integration:** Create a central instance (`src/database/prismaClient.ts`), inject it into API/bot services, and add lifecycle hooks (shutdown, error handling).
- [ ] **Repository layer:** Build abstractions for recurring queries (e.g. `UserRepository`, `ProjectRepository`) and use them consistently.
- [ ] **Seeds & test data:** Establish `prisma/seed.ts`, adapt modular seeds in `src/seeds/` to Prisma, and provide automated sample data for E2E tests.

## 3. API & Services

### 3.1 Infrastructure

- [ ] Prepare `src/api/app.ts` and `src/server.ts` for Prisma: database health checks, graceful shutdown, shared logger.
- [ ] Update the middleware layer (`src/api/middlewares`) to modern TypeScript definitions and ensure the request/user context is well typed.
- [ ] Migrate helpers (`src/api/helpers`) for responses, JWT, uploads, etc. to Prisma-backed services.
- [ ] Provide typed configs for utility functions (`src/api/utils`) and modernize file-upload/auth flows.

### 3.2 Feature Modules (selection)

For each module: routes → controller → services → Prisma repositories → tests.

- [ ] **Auth & user management:** Adjust Passport/session integration to Prisma user models; include password reset & OAuth flows.
- [ ] **Role & permission system:** Implement Prisma relations for roles/permissions and refresh guard middleware.
- [ ] **Commerce (products, orders, returns):** Model payments and order logic with Prisma transactions.
- [ ] **Content (blog, comments, tags):** Model posts, comments, and tags with Prisma relations; assess caching strategies.
- [ ] **Support & tickets:** Connect the ticket system to Prisma tables and align bot commands.
- [ ] **Integrations (GitHub, Steam, Proxmox, CloudNet, Faceit, Teamspeak):** Store credentials through Prisma and encrypt secrets.
- [ ] **Analytics & logging:** Create Prisma tables for audit logs, statistics, and event tracking.

## 4. Discord Bot & Client

- [ ] Port bot commands (`src/bot/commands`, `src/bot/events`) fully to TypeScript and reuse shared services.
- [ ] Abstract bot data access through Prisma services (e.g. ticket creation, user information).
- [ ] Align client/frontend modules (if active) with API changes and reuse shared types.

## 5. Quality Assurance

- [ ] **Testing:** Refresh the Jest configuration, add integration tests for Prisma (with a test database), test bot commands with mocks.
- [ ] **Linting & formatting:** Anchor Prettier/ESLint in CI and optionally prepare Husky/commit hooks.
- [ ] **Documentation:** After major changes update the README, `docs/reference/`, `docs/guides/`, and `docs/overview/`.
- [ ] **Release notes & change tracking:** Maintain `docs/process/changelog.md` and communicate breaking changes clearly.

## 6. Communication & Organization

- [ ] Follow the contribution flow defined in [`CONTRIBUTING.md`](../../CONTRIBUTING.md); focus reviews on TypeScript typing and Prisma migrations.
- [ ] Collect and prioritize community feedback via Discord/GitHub.
- [ ] Run security reviews for new data models (see [`SECURITY.md`](../../SECURITY.md)).

These steps provide a solid foundation for NodCord 2.0.0 on TypeScript and Prisma. Each completed checkbox should be documented with PR references and tests.
