# NodCord 2.0.0 – Detailplan zur vollständigen Migration

Dieser Plan ergänzt den high-level Fahrplan in [`todo.md`](./todo.md) und beschreibt konkrete Schritte für eine produktionsreife TypeScript-/Prisma-/MySQL-Version. Jede Aufgabe ist so formuliert, dass sie nachvollziehbar getestet werden kann.

## 1. Tooling & Infrastruktur

- [ ] **TypeScript Tooling vereinheitlichen**: `tsconfig.json` finalisieren, gemeinsame ESLint-/Prettier-Konfiguration ergänzen, Pfad-Aliasse für `src/api`, `src/bot`, `src/client` festlegen.
- [ ] **Dev-Server standardisieren**: `npm run dev` (ts-node-dev) als Single-Entry-Point beibehalten, Hot-Reload für API und Bot sicherstellen.
- [ ] **Prisma Projektstruktur**: `prisma/` Ordner mit `schema.prisma`, Migrationen und optionalen Seeds pflegen; Skripte `npm run prisma:*` nutzen.
- [ ] **Environment Management**: `.env.example` aktualisieren (MySQL, Redis, OAuth, Bot), Secrets-Handling dokumentieren, dotenv-Ladepunkte prüfen.
- [ ] **CI/CD-Erweiterung**: Pipeline definieren (Build, Test, Prisma Migrate, Prisma Generate). GitHub Actions vorbereiten.

## 2. Datenmodell & Persistenz

- [ ] **Prisma-Schema ausbauen**: Alle bisherigen Mongoose-Modelle (`src/models/*.ts`) nach `prisma/schema.prisma` übersetzen, inklusive Relationen, Enums und Default-Werten.
- [ ] **Migrationsstrategie**: Für jedes Modul (Auth, Commerce, Tickets, Developer Program, Analytics, Integrationen) eigene Migrationen erstellen. Historische Datenmigration (Mongo → MySQL) planen.
- [ ] **Prisma Client Integration**: Zentrale Instanz (`src/database/prismaClient.ts`) erstellen, in API/Bot Services injizieren, Lifecycle-Hooks (Shutdown, Error Handling) ergänzen.
- [ ] **Repository Layer**: Abstraktionen für wiederkehrende Queries bauen (z. B. `UserRepository`, `ProjectRepository`) und gemeinsam nutzen.
- [ ] **Seeds & Testdaten**: `prisma/seed.ts` etablieren, modulare Seeds in `src/seeds/` an Prisma anpassen, automatisierte Sample-Daten für E2E-Tests bereitstellen.

## 3. API & Services

### 3.1 Infrastruktur

- [ ] `src/api/app.ts` und `src/server.ts` auf Prisma vorbereiten: Datenbank-Healthchecks, Graceful Shutdown, gemeinsame Logger.
- [ ] Middleware-Schicht (`src/api/middlewares`) auf TypeScript-Definitionen aktualisieren, Request/User-Kontext sauber typisieren.
- [ ] Helpers (`src/api/helpers`) für Responses, JWT, Uploads etc. auf Prisma-basierte Services umstellen.
- [ ] Utility-Funktionen (`src/api/utils`) mit Typed Configs versehen, Dateiupload-/Auth-Flows modernisieren.

### 3.2 Feature-Module (Auswahl)

Für jedes Modul gilt: Routes → Controller → Services → Prisma-Repositories → Tests.

- [ ] **Auth & User Management**: Passport-/Session-Integration auf Prisma-Usermodelle anpassen, Password-Reset & OAuth berücksichtigen.
- [ ] **Role & Permission System**: Prisma-Relationen für Rollen/Rechte implementieren, Guard-Middlewares aktualisieren.
- [ ] **Commerce (Products, Orders, Returns)**: Zahlungs- und Order-Logik über Prisma-Transaktionen abbilden.
- [ ] **Content (Blog, Comments, Tags)**: Prisma-Relationen für Posts, Kommentare, Tags modellieren, Caching-Strategien prüfen.
- [ ] **Support & Tickets**: Ticket-System an Prisma-Tabellen anbinden, Bot-Befehle synchronisieren.
- [ ] **Integrationen (GitHub, Steam, Proxmox, CloudNet, Faceit, Teamspeak)**: Credential-Speicherung über Prisma, Secrets verschlüsseln.
- [ ] **Analytics & Logging**: Prisma-Tabellen für Audit-Logs, Statistiken, Event-Tracking aufbauen.

## 4. Discord-Bot & Client

- [ ] Bot-Kommandos (`src/bot/commands`, `src/bot/events`) vollständig auf TypeScript portieren, gemeinsame Services nutzen.
- [ ] Datenzugriffe des Bots über Prisma-Services abstrahieren (z. B. Ticket-Erstellung, User-Informationen).
- [ ] Client/Frontend-Module (falls aktiv) auf API-Änderungen abstimmen, Shared Types verwenden.

## 5. Qualitätssicherung

- [ ] **Testing**: Jest-Konfiguration aktualisieren, Integrationstests für Prisma (mit Test-DB) aufsetzen, Bot-Kommandos mit Mocks testen.
- [ ] **Linting & Formatting**: Prettier/ESLint in CI verankern, Husky/Commit Hooks optional vorbereiten.
- [ ] **Dokumentation**: Nach jeder größeren Änderung README, `docs/reference/`, `docs/guides/` und `docs/overview/` aktualisieren.
- [ ] **Release Notes & Change Tracking**: `docs/process/changelog.md` pflegen, Breaking Changes klar kommunizieren.

## 6. Kommunikation & Organisation

- [ ] Contribution-Flow laut [`CONTRIBUTING.md`](../../CONTRIBUTING.md) anwenden, Reviews mit Fokus auf TypeScript-Typisierung und Prisma-Migration durchführen.
- [ ] Community-Feedback über Discord/GitHub sammeln und priorisieren.
- [ ] Security-Audits für neue Datenmodelle durchführen (siehe [`SECURITY.md`](../../SECURITY.md)).

Mit diesen Schritten schaffen wir eine stabile Grundlage für NodCord 2.0.0 auf TypeScript und Prisma. Jede erledigte Checkbox sollte mit PR-Referenzen und Tests dokumentiert werden.
