# NodCord 2.0.0 – Migrationsfahrplan

## Zielbild
- Vollständiger Wechsel auf TypeScript (keine `.js`-Quelldateien mehr in `src/`).
- Datenzugriff ausschließlich über Prisma Client mit MySQL (keine Mongoose-Modelle, keine MongoDB-Abhängigkeiten).
- EJS bleibt als Templating-Engine für Server-Side-Rendering erhalten.
- Einheitliche Build-/Deploy-Pipeline (ESBuild/TS-Compiler), Tests und Dokumentation für die Versionen Alpha → Beta → LTS.

## Phase 0 – Analyse & Infrastrukturvorbereitung
- [ ] Projektinventur abschließen: Funktionsbereiche, externe Dienste und sensiblen Code aus allen Ordnern `src/api`, `src/bot`, `src/client`, `src/models`, `src/database`, `src/seeds`, `src/public`, `src/views`, `markdown` erfassen und dokumentieren.
- [ ] Abhängigkeiten prüfen (`package.json`): nicht mehr benötigte Pakete markieren (z. B. `mongoose`, `mongodb`, `mongoose-findorcreate`) und fehlende Typdefinitionen erfassen.
- [ ] Build-/Runtime-Ziele festlegen (Node-Version, TS-Compiler, Linting, Test-Framework) und in Architektur-Notiz festhalten.
- [ ] Datenbank-Mapping vorbereiten: für jedes Mongoose-Schema in `src/models` eine Zielstruktur für Prisma entwerfen (inkl. Beziehungen, Enums, Indizes, Default-Werte).
- [ ] Bestehende Seed- und Migration-Strategie (Dateien in `src/seeds`, Skripte in `src/scripts`) evaluieren und Migrationsplan zu MySQL notieren.
- [ ] Environment-Variablen konsolidieren (`.env`-Vorlage erstellen/aktualisieren) mit neuen MySQL/Prisma-Einträgen.

## Phase 1 – NodCord 2.0.0 Alpha (Grundfunktionalität in TypeScript & Prisma)
### 1.1 TypeScript- und Build-Setup
- [ ] `tsconfig.json` erweitern (Aliase, `strict`-Regeln, Pfad-Mapping für Prisma Client).
- [ ] npm-Skripte in `package.json` auf TypeScript-Build umstellen (`ts-node`, `tsup` oder `tsc` + Laufzeit mit `node --enable-source-maps dist/server.js`).
- [ ] Gemeinsame `src/types`-Deklarationen und ESLint/Prettier-Konfiguration hinzufügen.
- [ ] Automatisierte Builds (`build.js`, `nodemon.json`) auf TypeScript-Ausgabe (`dist/`) anpassen.

### 1.2 Prisma-Einführung & Datenbankanbindung
- [ ] Prisma, `@prisma/client`, MySQL-Driver (`mysql2`) installieren und `prisma/schema.prisma` anlegen.
- [ ] Prisma-Schema modellieren (User, Roles, Beta, Developer Program, Blog, Commerce, Tickets etc.) auf Basis der bisherigen Mongoose-Modelle.
- [ ] Erste Migration gegen lokale MySQL-Instanz durchführen und `prisma/migrations/` versionieren.
- [ ] `src/database/connectDB.js` durch `src/database/prismaClient.ts` ersetzen; zentrale Initialisierung im `server.ts` aktualisieren.
- [ ] Seed-Logik (`src/seeds/*.ts`) auf Prisma umstellen und über `prisma db seed` integrieren.
- [ ] Mongo-/Mongoose-Abhängigkeiten aus `package.json` entfernen (nach Abschluss der Migrationen) und Verbindungs-Utilities/Helper aktualisieren.

### 1.3 API-Kernmigration (Routing & Infrastruktur)
- [ ] `src/api/app.js` nach `src/api/app.ts` portieren (ESM-Imports, Typschnittstellen, Express-Konfiguration, EJS-Pfade).
- [ ] Middlewares in `src/api/middlewares/` und `src/api/utils/` auf TypeScript umstellen, inklusive eigener Typdefinitionen für Request/Response-Objekte.
- [ ] Logger-, Rate-Limiter-, Session- und Auth-Services (`src/api/services/`, `src/api/helpers/`) auf Prisma-basierte Implementierungen migrieren.
- [ ] Routing-Layer (`src/api/routes/*.js`) nach TypeScript portieren und Prisma-Controller anbinden.
- [ ] Authentifizierungs- und Session-Speicher (z. B. `connect-mongo`) auf MySQL-/Prisma-kompatible Alternativen (z. B. PrismaAdapter für `express-session` oder Redis) migrieren.

### 1.4 Datenmodelle & Services
- [ ] Jede Datei in `src/models` evaluieren, Prisma-Äquivalent definieren und schrittweise entfernen.
- [ ] Controller-Logik (Start mit kritischen Pfaden: Auth, Users, Roles, Versions, Beta, Developer Program) auf Prisma-Queries umstellen und Typen definieren.
- [ ] Hilfsfunktionen (`src/api/helpers`) für E-Mails, Tokens, Statistiken auf TypeScript konvertieren.
- [ ] Fehler- und Antwort-Handling (`sendResponseHelper`, Error-Middleware) typisieren und zentralisieren.

### 1.5 Discord-Bot & Client (Minimal-Portierung für Alpha)
- [ ] Einstiegspunkte `src/bot/index.js` und `src/client/main.js` nach TypeScript portieren (Basiskommandos, Logging, Start/Stop).
- [ ] Gemeinsame Konfiguration (`src/config/*.js`) nach TypeScript verschieben (`src/config/*.ts`) und Prisma/TypeScript-konform gestalten.
- [ ] Sicherstellen, dass Kernpfade (`startServer`, Bot-Start, Client-Start) über TypeScript-Build lauffähig sind.

### 1.6 Alpha-Abschluss
- [ ] Smoke-Tests (API Healthcheck, Auth-Login, Bot-Login) durchführen und dokumentieren.
- [ ] Alpha-Release-Notes (Migration, Breaking Changes, Setup-Anleitung) im `markdown/`-Ordner festhalten.

## Phase 2 – NodCord 2.0.0 Beta (Feature-Parität & Stabilität)
### 2.1 Vollständige Modulportierung
- [ ] Alle verbleibenden Controller/Services (Blog, Games, Commerce, Tickets, Analytics, Integrationen) auf TypeScript + Prisma migrieren.
- [ ] Routing und Validierung (z. B. `src/api/routes`, `src/api/middlewares`) bereinigen, Input-Schemas mit Zod/Yup o. Ä. ergänzen.
- [ ] Hintergrundprozesse & Cronjobs (falls vorhanden in `src/api/services`, `src/scripts`) auf TypeScript anpassen.
- [ ] Bot-Kommandos (Prefix & Slash unter `src/bot/prefix` etc.) vollständig typisieren und, falls sinnvoll, in modulare Handler-Struktur migrieren.
- [ ] Client-Routen und Services (`src/client/routes`, `src/client/services`) nach TypeScript überführen und API-Aufrufe auf Prisma-gestützte Endpunkte ausrichten.

### 2.2 Daten & Migrationen
- [ ] Komplexe Beziehungen (Nested Documents wie `posts`, `projects`, `friends`) in Prisma modellieren und Datenmigrationen planen/ausführen.
- [ ] Historische Datenmigration von MongoDB zu MySQL (ETL-Skripte, ggf. temporäre Import-Tools).
- [ ] Prisma-Seeds und -Fixtures für Tests erweitern.

### 2.3 Test- & Qualitätsabsicherung
- [ ] Teststrategie aktualisieren (Unit-, Integration-, E2E-Tests mit Jest/Supertest oder Vitest) für API, Bot und Client.
- [ ] CI/CD-Pipeline (GitHub Actions oder alternative) einführen/aktualisieren: Lint, Test, Build, Prisma-Migrations-Check.
- [ ] Performance- und Lasttests für kritische Endpunkte planen.

### 2.4 Beta-Abschluss
- [ ] Feature-Parität zur v0.x sicherstellen; QA-Checkliste abarbeiten.
- [ ] Beta-Dokumentation: Upgrade Guide, Datenmigration, bekannte Einschränkungen.
- [ ] Feedback-Schleife mit Testern einplanen (Beta-Programm in `src/api/routes/betaRoutes` berücksichtigen).

## Phase 3 – NodCord 2.0.0 LTS (Härtung & Release)
- [ ] Sicherheitshärtung: Secrets-Management, Rate-Limits, Audit-Logs (Logger-Service, `securityRoutes`).
- [ ] Monitoring & Observability erweitern (PM2-Integration, Sentry, Health Checks für Prisma/MySQL).
- [ ] Performance-Tuning: Indexe in Prisma, Caching-Strategien (Redis), Query-Optimierung.
- [ ] Vollständige Dokumentation (README, Setup, API-Reference, Bot-Kommandos, Architekturübersicht) auf aktuellen Stand bringen.
- [ ] Release-Management vorbereiten (Versionierung auf `2.0.0`, Tagging, Changelog, Upgrade-Anleitung).
- [ ] Langzeit-Support-Prozesse definieren (Bugfix-Flow, Backporting, Wartungsfenster).
- [ ] Abschließende Regressionstests und LTS-Freigabe.

## Laufende Querschnittsaufgaben
- [ ] Code-Reviews und Coding-Guidelines für TypeScript/Prisma etablieren.
- [ ] Sicherheits- und Datenschutzanforderungen regelmäßig prüfen.
- [ ] Feature-Flags/Configuration-Management für schrittweise Aktivierung neuer Module nutzen.
- [ ] Stakeholder-Kommunikation (Alpha/Beta/LTS Statusberichte) pflegen.
