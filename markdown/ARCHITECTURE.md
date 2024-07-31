## Architektur von NodCord

Diese Datei beschreibt die Architektur von NodCord und erklärt die wichtigsten Komponenten und deren Interaktionen.

### Hauptkomponenten

- **Express Server**: Behandelt HTTP-Anfragen und dient als API-Endpunkt.
- **Discord Bot**: Behandelt Discord-spezifische Logik und interagiert mit der Discord API.
- **Controller**: Vermittelt zwischen den Routen und der Geschäftslogik.
- **Service**: Enthält die Geschäftslogik und die Interaktion mit externen Diensten (z.B. Discord API).

### Interaktionen

1. **HTTP-Anfrage**: Ein Benutzer sendet eine HTTP-Anfrage an den Express-Server.
2. **Routing**: Die Anfrage wird an den entsprechenden Controller weitergeleitet.
3. **Controller**: Der Controller ruft die notwendigen Dienste auf, um die Anfrage zu bearbeiten.
4. **Service**: Der Service führt die Geschäftslogik aus und interagiert mit der Discord API.
5. **Antwort**: Die Antwort wird durch den Controller und den Server an den Benutzer zurückgegeben.

### Nachricht senden

1. Der Benutzer sendet eine `POST /api/discord/message` Anfrage.
2. Der `discordController` verarbeitet die Anfrage.
3. Der Controller ruft den `discordService` auf, um die Nachricht zu senden.
4. Der Service verwendet die Discord API, um die Nachricht zu senden.
5. Die Erfolgs- oder Fehlermeldung wird an den Benutzer zurückgegeben.