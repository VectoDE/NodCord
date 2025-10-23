## Welcome, Contributors!

Thank you for your interest in contributing to NodCord! This guide summarizes the key rules for working with the TypeScript/Prisma codebase.

## Ways to Contribute

- **Report bugs:** Open an issue that describes the problem, including reproduction steps, logs, and Prisma migration context when relevant.
- **Propose features:** Outline the desired behavior and the affected modules (API, bot, Prisma schema).
- **Submit code:** Fork the repository, develop on a feature branch, and open a pull request.

## Coding Guidelines

- Write TypeScript files only (`.ts`/`.tsx`).
- Use the Prisma Client for database access. Direct MySQL queries are reserved for exceptional cases.
- Share common types under `src/types/` and services inside the corresponding module (`src/api/services`, `src/bot/services`).
- Handle errors and logging carefully, especially around database operations.

## Pull Request Process

1. Create a branch: `git checkout -b feature/my-feature`
2. Implement your changes and run `prisma migrate dev --name <name>` when you touch the schema.
3. Execute tests and checks:
   ```bash
   npm run build
   npm test
   npm run prisma:migrate
   ```
4. Update documentation (README, docs/…) whenever workflows change.
5. Open a pull request and document the following:
   - Summary of the change
   - Impact on the Prisma schema/migrations
   - Notes about new environment variables or configuration steps

## Thank You!

We appreciate every contribution. If you have questions, contact [tim.hauke@hauknetz.de](mailto:tim.hauke@hauknetz.de) or reach out on Discord (`vecto.`).
