# NodCord 2.0.0 – Migration Roadmap

## Target State
- Complete transition to TypeScript (no `.js` source files left in `src/`).
- Database access exclusively through Prisma Client with MySQL (replacing Mongoose).
- Shared services for API, bot, and client.
- Consistent build/deploy pipeline (`npm run build`, `npm start`, `npm run dev`).

## Phase 0 – Analysis & preparation
- [ ] Assess all modules (`src/api`, `src/bot`, `src/client`, `src/models`, `src/database`, `prisma/seeds`).
- [ ] Review dependencies (`package.json`): mark outdated packages and finalize the Prisma/TypeScript setup.
- [ ] Prepare database mapping: align Mongoose schemas with Prisma models in `prisma/schema.prisma`.
- [ ] Maintain the secrets source for MySQL, Redis, Discord, OAuth, and external integrations (e.g. a central `.env` template in secrets management).

## Phase 1 – Alpha (core functionality running)
- [ ] Finalize TypeScript configuration and the ts-node-dev setup (`npm run dev`).
- [ ] Use the Prisma Client inside `src/server.ts` and central services.
- [ ] Port auth, user, roles, tickets, and other core modules to Prisma.
- [ ] Migrate seeds to Prisma (`prisma db seed` using data in `prisma/seeds/`).
- [ ] Update baseline documentation (README, installation guide, architecture).

## Phase 2 – Beta (feature parity & stability)
- [ ] Migrate all remaining modules (commerce, blog, integrations, analytics) to Prisma.
- [ ] Validate integration tests and bot commands with Prisma-backed data access.
- [ ] Implement a CI/CD pipeline that covers build, test, Prisma migrations, and linting.
- [ ] Run performance and security checks (indexes, rate limits, secrets management).

## Phase 3 – LTS (hardening & release)
- [ ] Final review of all Prisma models and migrations.
- [ ] Finalize the release plan (versioning, changelog, upgrade guide).
- [ ] Establish monitoring, observability, and backups for MySQL/Prisma.
- [ ] Define the LTS support process (bugfix policy, maintenance windows).

## Ongoing tasks
- [ ] Maintain coding guidelines (`CONTRIBUTING.md`, `docs/process/contributing.md`).
- [ ] Update documentation with each major change.
- [ ] Incorporate community/issue tracker feedback regularly.
