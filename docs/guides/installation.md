## Installation

This guide walks you through installing NodCord with TypeScript, Prisma, and MySQL.

### Requirements

- Node.js 20.17.0 and npm 11.6.2 (as declared in `engines` in `package.json`)
- MySQL 8.x or compatible (e.g. MariaDB ≥ 10.6)
- Git

### Steps

1. Clone the repository:

   ```sh
   git clone https://github.com/VectoDE/NodCord.git
   ```

2. Switch into the project directory:

   ```sh
   cd NodCord
   ```

3. Install dependencies:

   ```sh
   npm install
   ```

4. Generate the Prisma Client (also runs automatically after `npm install`) and create the schema in your MySQL database:

   ```sh
   npx prisma generate
   npx prisma db push
   ```

   No Prisma migrations are committed yet, so `prisma migrate deploy` has nothing to apply.

5. Prepare the configuration file:
   - Copy `.env.example` to `.env` (or roll it out through your secrets management).
   - Populate the required variables. The key sections are listed in the README under “Configuration.”
   - Set `DATABASE_URL` to a MySQL URL (`mysql://user:password@localhost:3306/nodcord`); the example value in `.env.example` points to PostgreSQL.

6. Start the development server:
   ```sh
   npm run dev
   ```

The API listens on the port from `PORT` (default `8080`), the dashboard client on `CLIENT_PORT` (default `4000`). For production environments, run `npm run build` first and then launch `npm start`.
