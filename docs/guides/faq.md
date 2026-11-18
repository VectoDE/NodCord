# FAQ

## Frequently Asked Questions

### How do I get my Discord bot token?

1. Visit the [Discord Developer Portal](https://discord.com/developers/applications).
2. Create a new application or select an existing one.
3. Open the **Bot** tab and create a bot user.
4. Copy the bot token and add it to your `.env` file as `DISCORD_BOT_TOKEN`.

### How do I connect NodCord to my MySQL database?

- Create a database, e.g. `nodcord`.
- Add the credentials to your `.env` file as `DATABASE_URL`, for example `mysql://user:pass@localhost:3306/nodcord`. The Prisma schema targets MySQL, so replace the PostgreSQL example URL from `.env.example`.
- Run `npx prisma db push` to create the schema. No migrations are committed yet, so `prisma migrate deploy` has nothing to apply.
- Start the server with `npm run dev`.

### The bot does not respond to commands. What can I do?

- Verify that `DISCORD_BOT_TOKEN`, `DISCORD_CLIENT_ID`, and (for development) `DISCORD_DEV_GUILD_ID` are set correctly.
- Make sure the bot has the required permissions on the server.
- Check the server/bot logs. Prisma errors often indicate a missing migration or an incorrect database URL.

### Prisma reports an error while generating or migrating. What should I do?

- Confirm that MySQL is running and that the user has the necessary privileges.
- Do not delete migrations manually—use `prisma migrate dev --name <description>` for new changes. Until the first migration is committed, `prisma migrate deploy` has nothing to apply.
- For local testing, `npx prisma db push` (or `npm run prisma:push`) synchronizes the schema quickly.

### Where can I get additional help?

- Read the [support guide](./support.md).
- Open an issue on GitHub if you suspect a bug.
- Contact the maintainer team via email (see [SECURITY.md](../../SECURITY.md)) or on Discord (`vecto.`).
