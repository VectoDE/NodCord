# FAQ

## Häufig gestellte Fragen

### Wie erhalte ich meinen Discord Bot Token?

1. Gehe zum [Discord Developer Portal](https://discord.com/developers/applications).
2. Erstelle eine neue Anwendung oder wähle eine bestehende aus.
3. Gehe zum Bot-Tab und erstelle einen neuen Bot.
4. Kopiere den Token deines Bots und füge ihn in deine `.env`-Datei als `DISCORD_TOKEN` ein.

### Wie verbinde ich NodCord mit meiner MySQL-Datenbank?

- Lege eine Datenbank an, z. B. `nodcord`.
- Trage die Zugangsdaten in deiner `.env`-Datei als `DATABASE_URL` ein, z. B. `mysql://user:pass@localhost:3306/nodcord`.
- Führe `npx prisma migrate deploy` aus, um das Schema zu installieren.
- Starte den Server mit `npm run dev`.

### Der Bot reagiert nicht auf Befehle. Was kann ich tun?

- Überprüfe, ob `DISCORD_TOKEN`, `DISCORD_CLIENT_ID` und `DISCORD_GUILD_ID` korrekt gesetzt sind.
- Stelle sicher, dass der Bot die richtigen Berechtigungen auf dem Server hat.
- Prüfe die Logs des Bots/Servers. Prisma-Fehler deuten häufig auf eine fehlende Migration oder falsche Datenbank-URL hin.

### Prisma meldet einen Fehler beim Generieren oder Migrieren. Wie gehe ich vor?

- Kontrolliere, ob MySQL läuft und der Benutzer die nötigen Rechte besitzt.
- Lösche keine Migrationen manuell – verwende `prisma migrate dev --name <beschreibung>` für neue Änderungen.
- Für lokale Tests kann `npx prisma db push` helfen, das Schema schnell zu synchronisieren.

### Wo finde ich weitere Hilfe?

- Sieh dir den [Support-Guide](./support.md) an.
- Öffne ein Issue auf GitHub, wenn du einen Bug vermutest.
- Kontaktiere das Maintainer-Team per E-Mail (siehe SECURITY.md) oder über Discord (`vecto.`).
