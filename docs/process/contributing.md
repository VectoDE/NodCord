## Beitragende willkommen!

Vielen Dank für dein Interesse, zu NodCord beizutragen! Dieser Leitfaden fasst die wichtigsten Regeln für Beiträge zur TypeScript-/Prisma-Codebasis zusammen.

## Wie du beitragen kannst

- **Fehler melden**: Öffne ein Issue und beschreibe das Problem, inklusive Steps, Logs und Prisma-Migration (falls relevant).
- **Funktionen vorschlagen**: Skizziere das gewünschte Verhalten und die betroffenen Module (API, Bot, Prisma-Schema).
- **Code beisteuern**: Erstelle einen Fork, entwickle in einem Feature-Branch und öffne einen Pull Request.

## Code-Richtlinien

- Schreibe ausschließlich TypeScript-Dateien (`.ts`/`.tsx`).
- Nutze Prisma Client für Datenzugriffe. Direkte MySQL-Queries nur in begründeten Ausnahmefällen.
- Teile gemeinsame Typen in `src/types/` und Services im passenden Modul (`src/api/services`, `src/bot/services`).
- Achte auf saubere Fehlerrückgaben und Logging, insbesondere bei Datenbankoperationen.

## Pull-Request-Prozess

1. Branch erstellen: `git checkout -b feature/mein-feature`
2. Änderungen durchführen und bei Schema-Anpassungen `prisma migrate dev --name <name>` ausführen.
3. Tests und Checks laufen lassen:
   ```bash
   npm run build
   npm test
   npm run prisma:migrate
   ```
4. Dokumentation aktualisieren (README, docs/…), falls sich Abläufe ändern.
5. Pull Request erstellen und folgende Punkte dokumentieren:
   - Zusammenfassung der Änderung
   - Auswirkungen auf Prisma-Schema/Migrationen
   - Hinweise auf neue Env-Variablen oder Konfigurationsschritte

## Danke!

Wir freuen uns über jede Unterstützung. Bei Fragen wende dich an [tim.hauke@hauknetz.de](mailto:tim.hauke@hauknetz.de) oder per Discord an `vecto.`.
