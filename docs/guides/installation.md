## Installation

This guide walks you through installing NodCord with TypeScript, Prisma, and MySQL.

### Requirements

- Node.js (version 18 or higher)
- npm (version 9 or higher)
- MySQL 8.x or compatible (e.g. MariaDB ≥ 10.6)
- Git

### Steps

1. Clone the repository:
   ```sh
   git clone https://github.com/vectode/NodCord.git
   ```

2. Switch into the project directory:
   ```sh
   cd NodCord
   ```

3. Install dependencies:
   ```sh
   npm install
   ```

4. Generate the Prisma Client and apply migrations:
   ```sh
   npx prisma generate
   npx prisma migrate deploy
   ```

5. Prepare the configuration file:
   - Create a `.env` file (e.g. via `touch .env` or by rolling it out through your secrets management).
   - Populate the required variables. The key sections are listed in the README under “Server & API,” “Databases,” “Security,” “Discord & Bot,” “OAuth & Payments,” “Email,” and “Infrastructure.”

6. Start the development server:
   ```sh
   npm run dev
   ```

The server will be available at `http://localhost:3000`. For production environments, run `npm run build` first and then launch `npm start`.
