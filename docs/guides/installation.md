## Installation

Diese Anleitung führt dich durch die Installation von NodCord auf Basis von TypeScript, Prisma und MySQL.

### Voraussetzungen

- Node.js (Version 18 oder höher)
- npm (Version 9 oder höher)
- MySQL 8.x oder kompatibel (z. B. MariaDB ≥ 10.6)
- Git

### Schritte

1. Repository klonen:
   ```sh
   git clone https://github.com/deinbenutzername/NodCord.git
   ```

2. In das Projektverzeichnis wechseln:
   ```sh
   cd NodCord
   ```

3. Abhängigkeiten installieren:
   ```sh
   npm install
   ```

4. Prisma Client generieren und Migrationen anwenden:
   ```sh
   npx prisma generate
   npx prisma migrate deploy
   ```

5. `.env` Datei anlegen und mindestens folgende Werte setzen:
   ```env
   DATABASE_URL="mysql://user:pass@localhost:3306/nodcord"
   DISCORD_TOKEN=dein_discord_token
   DISCORD_CLIENT_ID=deine_client_id
   DISCORD_GUILD_ID=deine_guild_id
   PORT=3000
   ```

6. Entwicklungsserver starten:
   ```sh
   npm run dev
   ```

Der Server läuft anschließend unter `http://localhost:3000`. Für Produktionsumgebungen führe zuvor `npm run build` aus und starte anschließend mit `npm start`.
