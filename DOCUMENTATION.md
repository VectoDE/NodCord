# NodCord Documentation

## Inhaltsverzeichnis
1. [Einführung](#einführung)
2. [Installation](#installation)
3. [Verwendung](#verwendung)
4. [API-Referenz](#api-referenz)
5. [Discord Bot Referenz](#discord-bot-referenz)
6. [Build und Deployment](#build-und-deployment)
7. [Skripte](#skripte)
8. [Verzeichnisstruktur](#verzeichnisstruktur)
9. [Konfiguration](#konfiguration)
10. [Tests](#tests)

## Einführung

NodCord ist ein Projekt, das eine Node.js-API mit Express.js und einen Discord-Bot kombiniert. Die API enthält einen Discord-Service, der über Controller und Router gesteuert werden kann. Der Discord-Bot kann ebenfalls über die API gesteuert werden.

## Installation

### Voraussetzungen

- Node.js (>= 14.x)
- npm (>= 6.x)
- MongoDB

### Installationsschritte

1. Klonen Sie das Repository:
   ```bash
   git clone https://github.com/IhrBenutzername/NodCord.git
   cd NodCord
   ```

2. Installieren Sie die Abhängigkeiten:
   ```bash
   npm install
   ```

3. Konfigurieren Sie die Umgebungsvariablen:
   Erstellen Sie eine `.env`-Datei im Stammverzeichnis und fügen Sie die notwendigen Umgebungsvariablen hinzu (siehe [Konfiguration](#konfiguration)).

4. Starten Sie die Anwendung:
   ```bash
   npm start
   ```

## Verwendung

### Starten der Anwendung

Verwenden Sie eines der bereitgestellten Skripte, um die Anwendung zu starten:

- Mit pm2:
  ```bash
  ./start.sh
  ```

- Mit nodemon:
  ```bash
  ./start.sh
  ```

### Stoppen der Anwendung

- Mit pm2:
  ```bash
  ./stop.sh
  ```

- Mit nodemon:
  ```bash
  ./stop.sh
  ```

### Neustarten der Anwendung

- Mit pm2:
  ```bash
  ./restart.sh
  ```

- Mit nodemon:
  ```bash
  ./restart.sh
  ```

## API-Referenz

### System Routes

#### GET /status
- Beschreibung: Liefert den Status der Anwendung.
- Beispiel:
  ```bash
  curl http://localhost:3000/status
  ```

### Discord Routes

#### GET /discord/status
- Beschreibung: Liefert den Status des Discord-Bots.
- Beispiel:
  ```bash
  curl http://localhost:3000/discord/status
  ```

#### POST /discord/restart
- Beschreibung: Startet den Discord-Bot neu.
- Beispiel:
  ```bash
  curl -X POST http://localhost:3000/discord/restart
  ```

## Discord Bot Referenz

### Befehle

#### !ping
- Beschreibung: Gibt eine Ping-Antwort zurück.
- Beispiel: `!ping`

#### !info
- Beschreibung: Gibt Informationen über den Bot und die API zurück.
- Beispiel: `!info`

#### !restart
- Beschreibung: Startet den Bot neu.
- Beispiel: `!restart`

### Events

- `ready.js`: Wird ausgelöst, wenn der Bot erfolgreich gestartet wurde.
- `message.js`: Wird ausgelöst, wenn eine Nachricht in einem Kanal gesendet wird.
- `guildMemberAdd.js`: Wird ausgelöst, wenn ein neuer Benutzer dem Server beitritt.

## Build und Deployment

### Build-Skript

Um die Anwendung für die Produktion zu bauen, verwenden Sie das `build.js`-Skript:

```bash
node build.js
```

Dieses Skript:
1. Reinigt das `dist`-Verzeichnis.
2. Kopiert die notwendigen Dateien aus dem `src`-Verzeichnis in das `dist`-Verzeichnis.
3. Installiert nur die Produktionsabhängigkeiten.
4. Komprimiert das `dist`-Verzeichnis in eine Zip-Datei `nodcord.zip`.

### Deployment

Nach dem Erstellen können Sie die Anwendung starten, indem Sie die `start.js`-Datei ausführen:

```bash
node start.js
```

## Skripte

### start.sh

- Beschreibung: Startet die Anwendung mit pm2 oder nodemon.
- Verwendung:
  ```bash
  ./start.sh
  ```

### stop.sh

- Beschreibung: Stoppt die Anwendung mit pm2 oder nodemon.
- Verwendung:
  ```bash
  ./stop.sh
  ```

### restart.sh

- Beschreibung: Startet die Anwendung mit pm2 oder nodemon neu.
- Verwendung:
  ```bash
  ./restart.sh
  ```

## Verzeichnisstruktur

```
NodCord/
├── src/
│   ├── api/
│   │   ├── controllers/
│   │   │   ├── discordController.js
│   │   │   └── systemController.js
│   │   ├── routes/
│   │   │   ├── discordRoutes.js
│   │   │   └── systemRoutes.js
│   │   ├── services/
│   │   │   ├── discordService.js
│   │   │   └── dbService.js
│   │   ├── utils/
│   │   │   └── logger.js
│   │   ├── views/
│   │   │   └── index.ejs
│   │   └── app.js
│   ├── bot/
│   │   ├── commands/
│   │   │   ├── ping.js
│   │   │   ├── info.js
│   │   │   └── restart.js
│   │   ├── events/
│   │   │   ├── message.js
│   │   │   ├── ready.js
│   │   │   └── guildMemberAdd.js
│   │   ├── handlers/
│   │   │   ├── commandHandler.js
│   │   │   └── eventHandler.js
│   │   ├── utils/
│   │   │   └── config.js
│   │   └── bot.js
│   ├── data/
│   │   ├── images/
│   │   ├── json/
│   │   ├── builds/
│   │   └── logs/
│   │       └── app.log
│   ├── models/
│   │   ├── user.js
│   │   └── message.js
│   ├── config/
│   │   ├── default.json
│   │   └── production.json
├── public/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── script.js
│   └── images/
│       └── logo.png
├── tests/
│   ├── api/
│   │   └── api.test.js
│   ├── bot/
│   │   └── bot.test.js
│   └── integration/
│       └── integration.test.js
├── .env
├── .gitignore
├── README.md
├── DOCUMENTATION.md
├── ROADMAP.md
├── Todo.md
├── start.sh
├── stop.sh
├── restart.sh
├── build.js
└── start.js
```

## Konfiguration

### .env Datei

Erstellen Sie eine `.env`-Datei im Stammverzeichnis des Projekts und fügen Sie die folgenden Umgebungsvariablen hinzu:

```
PORT=3000
DISCORD_TOKEN=your_discord_token
MONGO_URI=your_mongo_connection_string
```

### Konfigurationsdateien

Die Konfigurationsdateien befinden sich im `src/config`-Verzeichnis. Sie können die `default.json` und `production.json` an Ihre Bedürfnisse anpassen.

## Tests

Tests befinden sich im `tests`-Verzeichnis und sind in drei Kategorien unterteilt:

- `api`: Tests für die API.
- `bot`: Tests für den Discord-Bot.
- `integration`: Integrationstests.

Um die Tests auszuführen, verwenden Sie:
```bash
npm test
```

Diese `DOCUMENTATION.md` bietet eine umfassende Anleitung zur Installation, Verwendung, API-Referenz, Build- und Deployment-Prozess sowie Konfiguration und Tests des NodCord-Projekts.