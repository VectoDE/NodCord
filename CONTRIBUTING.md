# Contributing to NodCord

Thank you for your interest in improving NodCord! This document explains the most important workflows for contributing to our TypeScript/Prisma codebase.

## Core Principles

- **TypeScript first:** New modules and changes are implemented in TypeScript. Enable strict compiler options (`noImplicitOverride`, `noUncheckedIndexedAccess`, …) and share common types through `src/types/`.
- **Prisma + MySQL:** Use the Prisma Client for all database access. Avoid direct MySQL queries or Mongoose models; replace them gradually where they still exist.
- **Separation of concerns:** API, bot, and client share services. Encapsulate reusable logic instead of duplicating it.

## Development Workflow

1. **Choose or open an issue:** Describe the problem or feature briefly and note whether Prisma schema changes are required.
2. **Create a branch:** `git checkout -b feature/my-topic`
3. **Prepare the environment:**
   - `npm install`
   - `npx prisma generate`
   - Provide a local MySQL database and populate `.env` with `DATABASE_URL`
4. **Implement your changes:**
   - Create TypeScript files with clear interfaces.
   - For schema changes run `prisma migrate dev --name my_migration_name`.
   - Update seeds in `prisma/seed.ts` or `prisma/seeds/`.
5. **Run tests and checks:**
   - `npm run lint && npm run typecheck` (style and static analysis)
   - `npm run build` (ensures the TypeScript compiler passes)
   - `npm test` or a focused run via `npm run test:api|bot|views`
   - `npm run test:coverage` for changes to core logic or services
   - `npm run prisma:migrate` against a test database when adding migrations
6. **Open a pull request:**
   - Summarize your changes, migration steps, and new environment variables.
   - Reference relevant documents in `docs/` (e.g. updated architecture or installation guides).

## Style & Quality Guidelines

- Use Prettier (`npm run format`) for consistent formatting.
- Write descriptive commit messages in the imperative.
- Document new services or data models in the relevant files under `docs/reference/` or `docs/overview/`.

## Security & Privacy

If you find a security issue, report it confidentially as described in [SECURITY.md](./SECURITY.md). Never expose secrets or production database connections in pull requests.

## Questions

If you are unsure about anything, reach out to the maintainer team via [tim.hauke@hauknetz.de](mailto:tim.hauke@hauknetz.de) or Discord (`vecto.`). We are happy to support you!
