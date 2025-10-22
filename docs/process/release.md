## Release Prozess

Dieser Leitfaden beschreibt den Prozess zur Erstellung eines neuen Releases von NodCord.

### Schritte

1. **Version aktualisieren**
   - Aktualisiere die Version in der `package.json`.
   - Ergänze den Eintrag im `docs/process/changelog.md` mit Versionsnummer und Datum.

2. **Prisma prüfen**
   - Stelle sicher, dass alle Migrationen committed sind (`prisma/migrations`).
   - Führe `npm run prisma:migrate` gegen eine frische MySQL-Instanz aus.
   - Generiere den Prisma Client neu (`npm run prisma:generate`).

3. **Tests & Builds**
   - `npm run build`
   - `npm test`
   - Optional: Smoke-Tests gegen eine Staging-Umgebung durchführen.

4. **Code einfrieren**
   - Keine neuen Features mehr, nur kritische Fixes.
   - Prüfe offene Pull Requests und Issues.

5. **Release erstellen**
   - Tag auf GitHub setzen (`git tag vX.Y.Z && git push origin vX.Y.Z`).
   - Release Notes aus dem Changelog übernehmen.

6. **Veröffentlichen**
   - Merge des Release-Branches in `main`.
   - Prisma Migrationen auf Produktion ausführen.
   - Monitoring und Alerts aktivieren.

7. **Nachbereitung**
   - Release in der Roadmap markieren.
   - Feedback aus der Community sammeln.
