## Architektur von NodCord

Diese Datei beschreibt die Architektur von NodCord und erklärt die wichtigsten Komponenten und deren Interaktionen. Die Plattform setzt vollständig auf TypeScript und nutzt Prisma als ORM für eine MySQL-Datenbank.

### Hauptkomponenten

- **Express Server**: Behandelt HTTP-Anfragen und dient als API-Endpunkt. Eingänge werden in `src/api` typisiert verarbeitet.
- **Discord Bot**: Läuft parallel zum API-Server, nutzt die gleichen Services und Prisma-Repositories für Datenzugriffe.
- **Prisma Layer**: Zentraler Datenzugriff über `prisma/schema.prisma` und generierten Prisma Client. Ersetzt nach und nach ältere Mongoose-Modelle.
- **Service-Schicht**: Enthält Geschäftslogik, orchestriert API, Bot und externe Integrationen (z. B. OAuth, Zahlungsdienste).

### Datenfluss

1. **HTTP-Anfrage**: Ein Benutzer sendet eine Anfrage an den Express-Server.
2. **Routing & Controller**: Die Anfrage wird an den passenden Controller geleitet, der Validierung, Autorisierung und Transformation übernimmt.
3. **Services & Prisma**: Controller rufen Services auf, die über den Prisma Client auf MySQL zugreifen und Geschäftslogik ausführen.
4. **Antwort**: Typisierte DTOs werden zurück an den Controller gereicht und als HTTP-Response oder Bot-Aktion ausgegeben.

### Discord-Bot-Interaktionen

1. Der Bot empfängt ein Event (Slash Command, Guild-Event etc.).
2. Event-Handler greifen auf gemeinsame Services zu (z. B. Ticket-Erstellung, Projektverwaltung).
3. Über Prisma werden dieselben Tabellen angesprochen wie in der API.
4. Rückmeldungen gehen als Discord-Nachricht, Embed oder Follow-up an den Benutzer.

### Persistenz

- Das **Prisma Schema** definiert User-, Rollen-, Projekt- und Ticket-Strukturen als Ausgangsbasis.
- Migrationen werden mit `npm run prisma:migrate` ausgerollt.
- Seeds und Tests nutzen gemeinsame Helper unter `src/seeds` und `prisma`.

### Zukunftsaussichten

- Schrittweise Ablösung der verbliebenen MongoDB/Mongoose-Komponenten zugunsten von Prisma-Repositories.
- Aufbau eines konsistenten Domain-Layers mit geteilten Typdefinitionen und Services, die sowohl der API als auch dem Bot dienen.
