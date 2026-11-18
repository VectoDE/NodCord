## NodCord Architecture

This document outlines the architecture of NodCord and explains the most important components and how they interact. The platform is built entirely with TypeScript and uses Prisma as the ORM for a MySQL database.

### Core Components

- **Express server:** Handles HTTP requests and exposes the API endpoints. Requests are processed with strong typing inside `src/api`; cross-cutting concerns live in `src/middlewares`.
- **Discord bot:** Runs alongside the API server and relies on the same services and Prisma repositories for data access.
- **Prisma layer:** Central data access through `prisma/schema.prisma`, `prisma/client.ts`, and the generated Prisma Client. The Mongoose models are gone from `src/`; the `mongoose` package is still a dependency until the migration is finished.
- **Service layer:** `src/services` contains business logic and orchestrates API, bot, and external integrations (e.g. OAuth, payment providers).
- **Dashboard client:** `src/client` serves the EJS dashboard on its own port (`CLIENT_PORT`). `src/server.ts` starts API, bot, and client together.

### Data Flow

1. **HTTP request:** A user sends a request to the Express server.
2. **Routing & controllers:** The request is forwarded to the relevant controller, which handles validation, authorization, and transformation.
3. **Services & Prisma:** Controllers call services that use the Prisma Client to access MySQL and execute business logic.
4. **Response:** Typed DTOs are returned to the controller and served as an HTTP response or bot action.

### Discord Bot Interactions

1. The bot receives an event (slash command, guild event, etc.).
2. Event handlers access shared services (e.g. ticket creation, project management).
3. Prisma touches the same tables that the API uses.
4. Feedback is sent back as a Discord message, embed, or follow-up.

### Persistence

- The **Prisma schema** defines the baseline structures for users, roles, projects, and tickets.
- Sync the schema with `npm run prisma:push` for now. `npm run prisma:migrate` (`prisma migrate deploy`) applies committed migrations, and none exist yet.
- Seeds and tests use shared helpers inside `prisma/seeds` and other Prisma utilities.

### Outlook

- Gradually phase out remaining MongoDB/Mongoose components in favor of Prisma repositories.
- Establish a consistent domain layer with shared type definitions and services that power both the API and the bot.
