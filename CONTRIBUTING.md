# Beiträge zu NodCord

Vielen Dank, dass du zur Weiterentwicklung von NodCord beitragen möchtest! Dieses Dokument erläutert die wichtigsten Abläufe für Beiträge zu unserer TypeScript-/Prisma-Codebasis.

## Grundprinzipien

- **TypeScript zuerst**: Neue Module und Änderungen werden in TypeScript umgesetzt. Nutze die strengen Compiler-Optionen (`noImplicitOverride`, `noUncheckedIndexedAccess`, …) und teile gemeinsame Typen in `src/types/`.
- **Prisma + MySQL**: Datenzugriffe erfolgen über den Prisma Client. Direkte MySQL-Abfragen oder Mongoose-Modelle sollten vermieden bzw. schrittweise ersetzt werden.
- **Getrennte Verantwortlichkeiten**: API, Bot und Client teilen sich Services. Achte darauf, Logik wiederverwendbar zu kapseln, statt sie zu duplizieren.

## Entwicklungsablauf

1. **Issue wählen oder erstellen**: Beschreibe kurz das Problem bzw. Feature und markiere, ob Prisma-Schemaänderungen notwendig sind.
2. **Branch erstellen**: `git checkout -b feature/mein-thema`
3. **Umgebung vorbereiten**:
   - `npm install`
   - `npx prisma generate`
   - Lokale MySQL-Datenbank bereitstellen und `.env` mit `DATABASE_URL` befüllen
4. **Code anpassen**:
   - TypeScript-Dateien mit eindeutigen Interfaces erstellen.
   - Bei Schemaänderungen `prisma migrate dev --name mein_migrationsname` ausführen.
   - Seeds in `prisma/seed.ts` oder `src/seeds/` aktualisieren.
5. **Tests & Checks**:
   - `npm run lint && npm run typecheck` (stilistische und statische Analyse)
   - `npm run build` (stellt sicher, dass der TypeScript-Compiler fehlerfrei durchläuft)
   - `npm test` oder gezielt `npm run test:api|bot|views` (abhängig vom betroffenen Bereich)
   - `npm run test:coverage` bei Änderungen an Kernlogik oder Services
   - `npm run prisma:migrate` gegen eine Testdatenbank, falls Migrationen hinzugefügt wurden.
6. **Pull Request eröffnen**:
   - Fasse Änderungen, Migrationsschritte und neue Env-Variablen zusammen.
   - Verweise auf relevante Dokumente im `docs/`-Ordner (z. B. aktualisierte Architektur- oder Installationsguides).

## Stil- & Qualitätsrichtlinien

- Verwende Prettier (`npm run format`) für konsistente Formatierung.
- Schreibe sprechende Commit-Nachrichten im Imperativ.
- Dokumentiere neue Services oder Datenmodelle kurz in den passenden Dateien unter `docs/reference/` oder `docs/overview/`.

## Sicherheit & Datenschutz

Solltest du sicherheitsrelevante Probleme finden, melde sie bitte vertraulich wie in [SECURITY.md](./SECURITY.md) beschrieben. Lege keine Secrets oder produktiven Datenbankverbindungen in Pull Requests offen.

## Fragen

Wenn du unsicher bist, kontaktiere das Maintainer-Team per E-Mail an [tim.hauke@hauknetz.de](mailto:tim.hauke@hauknetz.de) oder über Discord (`vecto.`). Wir unterstützen dich gerne bei der Umsetzung deiner Idee!
