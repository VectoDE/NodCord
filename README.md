# NodCord

![NodCord Logo with Text](https://github.com/user-attachments/assets/f13e96c2-4dff-48f9-8da0-c2acfd49c09b)

NodCord ist eine in **TypeScript** geschriebene Service-Plattform rund um Discord-Automatisierung. Die REST-API basiert auf Express.js, der integrierte Bot nutzt discord.js und sämtliche Persistenz erfolgt über **Prisma** mit einer MySQL-Datenbank. Ziel ist eine einheitliche Codebasis, die API, Bot und begleitende Tools auf denselben Datenquellen aufbaut.

> 💡 Die Anwendung befindet sich in einer laufenden Migration von älteren JavaScript-/Mongoose-Komponenten. Neue Beiträge sollten sich am beschriebenen TypeScript/Prisma-Stack orientieren.

## Inhaltsverzeichnis

- [Features](#features)
- [Technologien](#technologien)
- [Installation](#installation)
- [Verwendung](#verwendung)
- [Datenbank & Prisma](#datenbank--prisma)
- [Konfiguration](#konfiguration)
- [Dokumentation](#dokumentation)
- [Contributing](#contributing)
- [Sicherheit](#sicherheit)
- [Lizenz](#lizenz)

## Features

- REST-API mit TypeScript-Controller-Layer und klaren Response-Typen
- Discord Bot mit gemeinsam genutzten Services und Datenbankzugriff über Prisma
- MySQL als zentrale Datenquelle (lokal via Docker oder gehostete Instanz)
- Modularer Aufbau (API, Bot, Client, Seeds, Scripts) für einfache Erweiterungen
- Ausführliche Projekt- und Migrationsdokumentation im `docs/` Verzeichnis

## Technologien

| Bereich         | Stack                                                                 |
| --------------- | --------------------------------------------------------------------- |
| Laufzeit        | Node.js ≥ 18                                                           |
| Sprache         | TypeScript (strict mode)                                              |
| Framework       | Express.js                                                             |
| Datenbank       | MySQL 8.x oder kompatibel (MariaDB ≥ 10.6 getestet)                    |
| ORM/Client      | Prisma                                                                |
| Discord         | discord.js                                                             |
| Tooling         | ts-node-dev, Jest, Prettier, Prisma CLI                                |

## Installation

### Voraussetzungen

- Node.js **>= 18** und npm **>= 9**
- Laufende MySQL-Instanz (z. B. Docker: `docker run --name nodcord-mysql -e MYSQL_ROOT_PASSWORD=secret -p 3306:3306 -d mysql:8`)
- Git

### Schritte

1. Repository klonen:
   ```bash
   git clone https://github.com/deinbenutzername/NodCord.git
   ```
2. Projektverzeichnis betreten:
   ```bash
   cd NodCord
   ```
3. Abhängigkeiten installieren:
   ```bash
   npm install
   ```
4. Prisma Client generieren (erstellt `node_modules/@prisma/client` anhand des Schemas):
   ```bash
   npx prisma generate
   ```
5. Erste Migration gegen die MySQL-Datenbank ausführen:
   ```bash
   npx prisma migrate deploy
   ```
6. Entwicklungsserver starten:
   ```bash
   npm run dev
   ```

## Verwendung

Die wichtigsten npm-Skripte:

```json
{
  "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
  "build": "tsc --project tsconfig.json",
  "start": "node dist/server.js",
  "prisma:migrate": "prisma migrate deploy",
  "prisma:studio": "prisma studio"
}
```

- `npm run dev` startet den Server mit Hot-Reloading (ts-node-dev).
- `npm run build` erzeugt ein `dist/` Verzeichnis mit kompilierter JS-Ausgabe.
- `npm start` führt den Build im Produktionsmodus aus.
- `npm run prisma:migrate` deployt Migrationen in die konfigurierte Datenbank.
- `npm run prisma:studio` öffnet die Prisma Oberfläche zur Dateninspektion.

## Datenbank & Prisma

Das Prisma Schema befindet sich unter [`prisma/schema.prisma`](./prisma/schema.prisma). Es definiert alle Models (z. B. Benutzer, Rollen, Projekte) und beschreibt Relationen sowie Constraints für MySQL. Weitere Hinweise:

- Lege eine `.env`-Datei im Projektstamm an und definiere darin `DATABASE_URL`, z. B. `mysql://user:password@localhost:3306/nodcord`.
- Verwende `npx prisma db push`, wenn du das Schema während der Entwicklung schnell synchronisieren möchtest.
- Seeds werden über `prisma db seed` ausgeführt und greifen auf die Dateien in `src/seeds/` zurück.

## Konfiguration

1. Lege eine neue Datei `.env` im Projektstamm an (oder befülle die von deinem Secrets-Management-System ausgerollte Variante).
2. Trage alle benötigten Variablen aus den folgenden Kategorien ein:
   - **Core Runtime:** `VERSION`, `NODE_ENV`, `SERVER_NAME`, `LOG_LEVEL`, `TZ`
   - **Server & API:** `PORT`, `BASE_URL`, `API_HTTPS`, `API_BASE_URL`, `API_PORT`
   - **Datenbanken:** `DATABASE_URL`, `MONGO_URI`
   - **Security & Monitoring:** `SESSION_SECRET`, `JWT_SECRET`, `JWT_SESSION_SECRET`, `SENTRY_AUTH_TOKEN`
   - **Client-Routing:** `CLIENT_HTTPS`, `CLIENT_BASE_URL`, `CLIENT_PORT`
   - **Discord & Bot:** `DISCORD_*`, `BOT_ACTIVITY_*`, `OWNER_ID`
   - **OAuth:** `GOOGLE_*`, `GITHUB_*`, `LINKEDIN_*`
   - **Payments:** `STRIPE_SECRET_KEY`, `PAYPAL_CLIENT_*`
   - **Mail & Kontakt:** `SMTP_*`, `CONTACT_EMAIL`, `CONTACT_SMTP_*`
   - **Infrastruktur:** `TS_*`

Weitere Erläuterungen findest du in den Modul-spezifischen Dateien unter `src/config/` sowie in den Referenzdokumenten im Ordner `docs/`.

## Dokumentation

Ausführliche Architekturhinweise, Installationsanleitungen, Roadmaps und Prozessbeschreibungen befinden sich im Ordner [`docs/`](./docs). Wichtige Einstiegspunkte:

- [`docs/guides/`](./docs/guides) – Installations-, FAQ- und Support-Anleitungen
- [`docs/overview/`](./docs/overview) – Architektur, Komponenten und Datenflüsse
- [`docs/planning/`](./docs/planning) – Migrationsfahrpläne Richtung vollständiger Prisma-Nutzung
- [`docs/reference/`](./docs/reference) – Technische Referenzen und Arbeitsabläufe
- [`docs/process/`](./docs/process) – Contributing-, Release- und Change-Management

## Contributing

Beiträge sind willkommen! Lies bitte die [CONTRIBUTING.md](./CONTRIBUTING.md), bevor du Pull Requests öffnest. Dort findest du Informationen zu Branch-Strategie, Coding-Guidelines für TypeScript sowie zum Umgang mit Prisma Migrationen.

## Sicherheit

Sicherheitsrelevante Hinweise findest du in der [SECURITY.md](./SECURITY.md). Melde Schwachstellen vertraulich, damit wir die MySQL-/Prisma-Infrastruktur schnell absichern können.

## Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert. Siehe die [LICENSE](./LICENSE)-Datei für weitere Details.

![NodCord Logo](https://imgur.com/dCl3Q6H.png)
