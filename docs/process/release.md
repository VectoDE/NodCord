## Release Prozess

Dieser Leitfaden beschreibt den Prozess zur Erstellung eines neuen Releases von NodCord.

### Schritte

1. **Version aktualisieren**

   - Aktualisiere die Version in der `package.json` Datei.
   - Erstelle eine neue Zeile im `CHANGELOG.md` mit der neuen Versionsnummer und dem Datum.

2. **Tests ausführen**

   - Stelle sicher, dass alle Tests erfolgreich sind.
   - Führe manuelle Tests durch, um sicherzustellen, dass alle Funktionen wie erwartet arbeiten.

3. **Code einfrieren**

   - Keine neuen Funktionen oder Änderungen mehr, außer kritische Fehlerbehebungen.

4. **Release erstellen**

   - Erstelle ein neues Release auf GitHub und tagge es mit der neuen Versionsnummer.
   - Füge die Änderungen aus dem `CHANGELOG.md` zur Release-Beschreibung hinzu.

5. **Veröffentlichen**
   - Merge den Release-Branch in den Hauptbranch (`main` oder `master`).
   - Stelle sicher, dass die neue Version auf allen Plattformen verfügbar ist.
