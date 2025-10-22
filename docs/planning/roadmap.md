# NodCord Roadmap

## Übersicht

Diese Roadmap skizziert geplante Features, Verbesserungen und Meilensteine für NodCord. Der Fokus liegt auf der Migration zu einer konsistenten TypeScript-Codebasis mit Prisma/MySQL sowie auf stabilen Bot- und API-Features.

## Aktueller Status

- **Version**: 2.0.0-alpha
- **Schwerpunkt**: TypeScript/Prisma Infrastruktur, Kernmodule, Dokumentation

## Meilensteine

### 2.0.0-alpha – Fundament schaffen

- [x] TypeScript-Build-Setup (`tsconfig.json`, `npm run build`, `npm run dev`)
- [x] Prisma Schema initialisieren (`User`, `Role`, `Project`, `Ticket`)
- [x] Dokumentation für Installation, Architektur, Contributing aktualisieren
- [x] Dev-Server auf ts-node-dev/nodemon abstimmen
- [ ] Erste Prisma-Migrationen und Seeds bereitstellen
- [ ] Kernmodule (Auth, User, Tickets) auf Prisma-Services migrieren

### 2.0.0-beta – Feature-Parität herstellen

- [ ] Sämtliche API-Module auf Prisma portieren (Commerce, Blog, Integrationen, Analytics)
- [ ] Bot-Kommandos auf gemeinsame Services und Prisma-Datenzugriff umstellen
- [ ] Integrationstests und E2E-Workflows mit Test-Datenbank etablieren
- [ ] CI/CD-Pipeline mit Build, Test, Prisma Migrate und Sicherheitschecks veröffentlichen

### 2.0.0 – Stable Release

- [ ] Prisma-Schema finalisieren, Migrationen einfrieren
- [ ] Upgrade Guide und Migrationshinweise dokumentieren
- [ ] Monitoring/Observability (Logging, Health Checks, Alerts) ausrollen
- [ ] Release Notes und Changelog veröffentlichen

## Zukünftige Pläne

- [ ] Mehrmandantenfähigkeit (Organisationen/Teams mit isolierten Datenräumen)
- [ ] Erweiterte Analytics-Module (Dashboards, Event-Tracking)
- [ ] Erweiterbare Bot-Plugin-Schnittstellen
- [ ] Infrastruktur-Automatisierung (Docker Compose, Helm Charts)

## Mitwirken

Wir begrüßen Beiträge aus der Community! Wenn du Ideen für Features, Verbesserungen oder Fehlerbehebungen hast, eröffne bitte ein Issue oder reiche einen Pull Request ein. Sieh dir unsere [Contributing-Richtlinien](../process/contributing.md) an, bevor du beginnst.

## Kontakt

Für Fragen oder Vorschläge kontaktiere bitte den Projektbetreuer:

- **E-Mail**: [tim.hauke@hauknetz.de](mailto:tim.hauke@hauknetz.de)
- **Discord**: `vecto.`

Vielen Dank für dein Interesse an NodCord! Lass uns gemeinsam etwas Großartiges aufbauen.
