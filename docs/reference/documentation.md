# NodCord Documentation

## Einführung

NodCord ist eine Express-basierte API mit integriertem Discord-Bot, geschrieben in TypeScript. Die Persistenz erfolgt über Prisma gegen eine MySQL-Datenbank. Dieses Dokument fasst die wichtigsten Arbeitsabläufe, Werkzeuge und Projektstrukturen zusammen.

## Installation & Setup

### Voraussetzungen

- Node.js >= 18 (LTS empfohlen)
- npm >= 9
- Zugriff auf eine MySQL 8.x oder kompatible Instanz
- Optional: Redis für Sessions/Caching

### Setup-Schritte

1. Repository klonen:
   ```bash
   git clone https://github.com/vectode/NodCord.git
   cd NodCord
   ```
2. Abhängigkeiten installieren:
   ```bash
   npm install
   ```
3. Prisma vorbereiten:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```
4. `.env` anhand der Beispielvariablen anlegen (siehe README) und MySQL-/Discord-Zugangsdaten pflegen.

## Entwicklungs- und Betriebs-Workflows

### Server starten

- Entwicklung mit automatischem Reload:
  ```bash
  npm run dev
  ```
- Produktion nach Build (lädt kompilierten Code aus `dist/`):
  ```bash
  npm run build
  npm start
  ```

### Prisma & Datenbank

- Migrationen deployen:
  ```bash
  npm run prisma:migrate
  ```
- Prisma Client neu generieren (bei Schemaänderungen):
  ```bash
  npm run prisma:generate
  ```
- Prisma Studio öffnen:
  ```bash
  npm run prisma:studio
  ```

### Tests & Code-Stil

- Automatisierte Tests (Jest):
  ```bash
  npm test
  ```
- Formatierung prüfen bzw. anwenden:
  ```bash
  npm run lint
  npm run format
  ```

## API-Referenz (Kurzüberblick)

Die Controller und Routen liegen unter `src/api`. Häufig genutzte Endpunkte:

- `GET /api/discord/status` – Status des Discord-Bots.
- `POST /api/discord/message` – Sendet eine Nachricht an einen Kanal.

Weitere Module (Auth, Commerce, Tickets, Integrationen) werden sukzessive auf Prisma-basierte Services migriert. Einstiegspunkte sind `src/api/routes` sowie die zugehörigen Controller.

## Discord-Bot

Der Bot startet derzeit über `src/bot/index.js` (Migration nach TypeScript ist in Arbeit) und nutzt gemeinsam genutzte Services. Kommandos und Events werden unter `src/bot/commands` bzw. `src/bot/events` verwaltet.

## Prisma Schema & Datenmodelle

- Schema-Datei: `prisma/schema.prisma`
- Standardmodelle: `User`, `Role`, `Project`, `Ticket` (erweiterbar)
- Migrationen: `prisma/migrations/`
- Seeds: `prisma/seed.ts` oder TypeScript-Dateien unter `src/seeds/`

## Verzeichnisstruktur

Siehe [`docs/meta/folder-structure.md`](../meta/folder-structure.md) für eine vollständige Übersicht.

## Weitere Ressourcen

- [Contributing Guide](../process/contributing.md)
- [Migrationsfahrplan](../planning/todo.md)
- [Architekturübersicht](../overview/architecture.md)
