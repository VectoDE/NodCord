# NodCord 2.0.0 – Migrationsfahrplan

## Zielbild
- Vollständiger Wechsel auf TypeScript (keine `.js`-Quelldateien mehr in `src/`).
- Datenzugriff ausschließlich über Prisma Client mit MySQL (Mongoose wird ersetzt).
- Gemeinsame Services für API, Bot und Client.
- Konsistente Build-/Deploy-Pipeline (`npm run build`, `npm start`, `npm run dev`).

## Phase 0 – Analyse & Vorbereitung
- [ ] Bestandsaufnahme aller Module (`src/api`, `src/bot`, `src/client`, `src/models`, `src/database`, `src/seeds`).
- [ ] Abhängigkeiten prüfen (`package.json`): veraltete Pakete markieren, Prisma/TypeScript-Setup finalisieren.
- [ ] Datenbank-Mapping vorbereiten: Mongoose-Schemas den Prisma-Modellen im `prisma/schema.prisma` gegenüberstellen.
- [ ] Secrets-Quelle für MySQL, Redis, Discord, OAuth und externe Integrationen pflegen (z. B. zentrale `.env`-Vorlage im Secret-Manager).

## Phase 1 – Alpha (Grundfunktionalität lauffähig)
- [ ] TypeScript-Konfiguration und ts-node-dev Setup abschließen (`npm run dev`).
- [ ] Prisma Client in `src/server.ts` und zentralen Services verwenden.
- [ ] Auth, User, Roles, Tickets und Kernmodule auf Prisma portieren.
- [ ] Seeds auf Prisma umstellen (`prisma db seed`).
- [ ] Basis-Dokumentation aktualisieren (README, Installationsanleitung, Architektur).

## Phase 2 – Beta (Feature-Parität & Stabilität)
- [ ] Alle verbleibenden Module (Commerce, Blog, Integrationen, Analytics) auf Prisma migrieren.
- [ ] Integrationstests und Bot-Kommandos mit Prisma-Datenanbindung validieren.
- [ ] CI/CD-Pipeline mit Build, Test, Prisma-Migrationen und Linting aufsetzen.
- [ ] Performance- und Sicherheitsprüfungen durchführen (Indexe, Rate-Limits, Secrets Management).

## Phase 3 – LTS (Härtung & Release)
- [ ] Finales Review aller Prisma-Modelle und Migrationen.
- [ ] Release-Plan (Versionierung, Changelog, Upgrade Guide) fertigstellen.
- [ ] Monitoring, Observability und Backups für MySQL/Prisma etablieren.
- [ ] LTS-Support-Prozess definieren (Bugfix-Policy, Wartungsfenster).

## Laufende Aufgaben
- [ ] Coding-Guidelines pflegen (`CONTRIBUTING.md`, `docs/process/contributing.md`).
- [ ] Dokumentation mit jeder größeren Änderung aktualisieren.
- [ ] Feedback aus Community/Issue-Tracker regelmäßig einarbeiten.
