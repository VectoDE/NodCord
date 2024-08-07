![NodCord Logo with Text](https://github.com/user-attachments/assets/f13e96c2-4dff-48f9-8da0-c2acfd49c09b)

NodCord ist eine Node.js API mit Express.js, die einen integrierten Discord Bot beinhaltet. Die API enthält einen Discord Service mit Controller und Router, um den Bot auch über die API steuern zu können.

## Inhaltsverzeichnis

- [Inhaltsverzeichnis](#inhaltsverzeichnis)
- [Installation](#installation)
- [Verwendung](#verwendung)
- [API Endpoints](#api-endpoints)
  - [GET /api/discord/status](#get-apidiscordstatus)
  - [POST /api/discord/message](#post-apidiscordmessage)
  - [Weitere Endpoints werden bald hinzugefügt...](#weitere-endpoints-werden-bald-hinzugefügt)
- [Discord Bot Befehle](#discord-bot-befehle)
  - [Weitere Befehle werden bald hinzugefügt...](#weitere-befehle-werden-bald-hinzugefügt)
- [Konfiguration](#konfiguration)
- [Contributing](#contributing)
- [Lizenz](#lizenz)

## Installation

1. Klone das Repository:
   ```sh
   git clone https://github.com/deinbenutzername/NodCord.git
   ```
2. Navigiere in das Projektverzeichnis:
   ```sh
   cd NodCord
   ```
3. Installiere die Abhängigkeiten:
   ```sh
   npm install
   ```

## Verwendung

1. Starte den Server:

   ```sh
   npm start
   ```

2. Der Server läuft nun auf `http://localhost:3000`.

## API Endpoints

### GET /api/discord/status

Gibt den aktuellen Status des Discord Bots zurück.

### POST /api/discord/message

Sendet eine Nachricht an einen bestimmten Discord Channel.

**Request Body:**

```json
{
  "channelId": "123456789012345678",
  "message": "Hallo Welt!"
}
```

### Weitere Endpoints werden bald hinzugefügt...

## Discord Bot Befehle

- **!ping** - Antwortet mit "Pong!"
- **!info** - Gibt Informationen über den Bot zurück.

### Weitere Befehle werden bald hinzugefügt...

## Konfiguration

Erstelle eine `.env`-Datei im Stammverzeichnis und füge die folgenden Variablen hinzu:

```
DISCORD_TOKEN=dein_discord_token
CLIENT_ID=dein_client_id
GUILD_ID=dein_guild_id
PORT=3000
```

## Contributing

Beiträge sind willkommen! Bitte erstelle einen Fork des Repositories und öffne einen Pull Request mit deinen Änderungen.

## Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert. Siehe die [LICENSE](LICENSE)-Datei für weitere Details.

![NodCord Logo](https://imgur.com/dCl3Q6H.png)
