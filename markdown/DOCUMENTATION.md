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
   ```
   git clone https://github.com/IhrBenutzername/NodCord.git
   ```
2. Wechseln Sie in das Projektverzeichnis:
   ```
   cd NodCord
   ```
3. Installieren Sie die Abhängigkeiten:
   ```
   npm install
   ```
4. Konfigurieren Sie die Umgebungsvariablen: Erstellen Sie eine `.env`-Datei im Stammverzeichnis und fügen Sie die notwendigen Umgebungsvariablen hinzu (siehe [Konfiguration](#konfiguration)).
5. Starten Sie die Anwendung:
   ```
   npm start
   ```

## Verwendung

### Starten der Anwendung

Verwenden Sie eines der bereitgestellten Skripte, um die Anwendung zu starten:

- Mit pm2:
  ```
  ./start.sh
  ```
- Mit nodemon:
  ```
  ./start.sh
  ```

### Stoppen der Anwendung

- Mit pm2:
  ```
  ./stop.sh
  ```
- Mit nodemon:
  ```
  ./stop.sh
  ```

### Neustarten der Anwendung

- Mit pm2:
  ```
  ./restart.sh
  ```
- Mit nodemon:
  ```
  ./restart.sh
  ```

## API-Referenz

### System Routes

#### GET /status

- Beschreibung: Liefert den Status der Anwendung.
- Beispiel:
  ```
  curl http://localhost:3000/status
  ```

### Discord Routes

#### GET /discord/status

- Beschreibung: Liefert den Status des Discord-Bots.
- Beispiel:
  ```
  curl http://localhost:3000/discord/status
  ```

#### POST /discord/restart

- Beschreibung: Startet den Discord-Bot neu.
- Beispiel:
  ```
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
- `messageCreate.js`: Wird ausgelöst, wenn eine Nachricht in einem Kanal gesendet wird.
- `interactionCreate.js`: Wird ausgelöst, wenn eine Interaktion stattfindet.
- `guildMemberAdd.js`: Wird ausgelöst, wenn ein neuer Benutzer dem Server beitritt.
- `guildMemberRemove.js`: Wird ausgelöst, wenn ein Benutzer den Server verlässt.
- `guildBanAdd.js`: Wird ausgelöst, wenn ein Benutzer gebannt wird.
- `guildBanRemove.js`: Wird ausgelöst, wenn ein Benutzer entbannt wird.
- `messageUpdate.js`: Wird ausgelöst, wenn eine Nachricht bearbeitet wird.
- `messageDelete.js`: Wird ausgelöst, wenn eine Nachricht gelöscht wird.
- `roleCreate.js`: Wird ausgelöst, wenn eine Rolle erstellt wird.
- `roleDelete.js`: Wird ausgelöst, wenn eine Rolle gelöscht wird.
- `channelCreate.js`: Wird ausgelöst, wenn ein Kanal erstellt wird.
- `channelDelete.js`: Wird ausgelöst, wenn ein Kanal gelöscht wird.
- `emojiCreate.js`: Wird ausgelöst, wenn ein Emoji erstellt wird.
- `emojiDelete.js`: Wird ausgelöst, wenn ein Emoji gelöscht wird.
- `voiceStateUpdate.js`: Wird ausgelöst, wenn sich der Sprachstatus eines Benutzers ändert.

## Build und Deployment

### Build-Skript

Um die Anwendung für die Produktion zu bauen, verwenden Sie das `build.js`-Skript:

```
node build.js
```

Dieses Skript:

1. Reinigt das `dist`-Verzeichnis.
2. Kopiert die notwendigen Dateien aus dem `src`-Verzeichnis in das `dist`-Verzeichnis.
3. Installiert nur die Produktionsabhängigkeiten.
4. Komprimiert das `dist`-Verzeichnis in eine Zip-Datei `nodcord.zip`.

### Deployment

Nach dem Erstellen können Sie die Anwendung starten, indem Sie die `start.js`-Datei ausführen:

```
node start.js
```

## Skripte

### start.sh

- Beschreibung: Startet die Anwendung mit pm2 oder nodemon.
- Verwendung:
  ```
  ./start.sh
  ```

### stop.sh

- Beschreibung: Stoppt die Anwendung mit pm2 oder nodemon.
- Verwendung:
  ```
  ./stop.sh
  ```

### restart.sh

- Beschreibung: Startet die Anwendung mit pm2 oder nodemon neu.
- Verwendung:
  ```
  ./restart.sh
  ```

## Verzeichnisstruktur

```
NodCord/
├── .gitignore
├── LICENSE
├── README.md
├── package.json
├── yarn.lock
├── build.js
├── src/
│   ├── api/
│   │   ├── app.js
│   │   ├── controllers/
│   │   │   ├── apiController.js
│   │   │   ├── authController.js
│   │   │   ├── roleController.js
│   │   │   ├── userController.js
│   │   │   ├── blogController.js
│   │   │   ├── categoryController.js
│   │   │   ├── tagController.js
│   │   │   ├── teamController.js
│   │   │   ├── organizationController.js
│   │   │   ├── discordbotController.js
│   │   │   ├── productController.js
│   │   │   ├── companyController.js
│   │   │   ├── gameController.js
│   │   │   ├── projectController.js
│   │   │   ├── taskController.js
│   │   │   ├── paymentController.js
│   │   │   ├── groupController.js
│   │   │   ├── chatController.js
│   │   │   └── favoritesController.js
│   │   ├── routes/
│   │   │   ├── api.js
│   │   │   ├── authRoutes.js
│   │   │   ├── roleRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── blogRoutes.js
│   │   │   ├── categoryRoutes.js
│   │   │   ├── tagRoutes.js
│   │   │   ├── teamRoutes.js
│   │   │   ├── organizationRoutes.js
│   │   │   ├── discordbotRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   ├── companyRoutes.js
│   │   │   ├── gameRoutes.js
│   │   │   ├── projectRoutes.js
│   │   │   ├── taskRoutes.js
│   │   │   ├── paymentRoutes.js
│   │   │   ├── groupRoutes.js
│   │   │   ├── chatRoutes.js
│   │   │   └── favoritesRoutes.js
│   │   ├── middlewares/
│   │   │   ├── compressionMiddleware.js
│   │   │   ├── authMiddleware.js
│   │   │   ├── roleMiddleware.js
│   │   │   ├── corsMiddleware.js
│   │   │   └── rateLimiterMiddleware.js
│   │   ├── services/
│   │   │   ├── socketioService.js
│   │   │   └── loggerService.js
│   │   ├── utils/
│   │   │   └── multerUtil.js
│   │   ├── plugins/
│   │   ├── views/
│   │   │   ├── index.ejs
│   │   │   ├── dashboard.ejs
│   │   │   ├── info.ejs
│   │   │   ├── status.ejs
│   │   │   └── error.ejs
│   ├── bot/
│   │   ├── commands/
│   │   │   ├── moderation/
│   │   │   │   ├── ban.js
│   │   │   │   ├── unban.js
│   │   │   │   ├── kick.js
│   │   │   │   ├── timeout.js
│   │   │   │   └── warn.js
│   │   │   ├── fun/
│   │   │   │   ├── 8ball.js
│   │   │   │   ├── dice.js
│   │   │   │   └── joke.js
│   │   │   ├── utility/
│   │   │   │   ├── clear.js
│   │   │   │   ├── help.js
│   │   │   │   ├── poll.js
│   │   │   │   └── role.js
│   │   │   ├── info/
│   │   │   │   ├── avatar.js
│   │   │   │   ├── botinfo.js
│   │   │   │   ├── help.js
│   │   │   │   ├── ping.js
│   │   │   │   ├── serverinfo.js
│   │   │   │   └── userinfo.js
│   │   │   ├── bot-owner/
│   │   │   │   ├── eval.js
│   │   │   │   ├── exec.js
│   │   │   │   ├── reload.js
│   │   │   │   └── shutdown.js
│   │   │   └── system/
│   │   │       ├── announce.js
│   │   │       ├── poll.js
│   │   │       ├── purge.js
│   │   │       └── say.js
│   │   ├── events/
│   │   │   ├── messageCreate.js
│   │   │   ├── ready.js
│   │   │   ├── interactionCreate.js
│   │   │   ├── guildMemberAdd.js
│   │   │   ├── guildMemberRemove.js
│   │   │   ├── guildBanAdd.js
│   │   │   ├── guildBanRemove.js
│   │   │   ├── messageUpdate.js
│   │   │   ├── messageDelete.js
│   │   │   ├── roleCreate.js
│   │   │   ├── roleDelete.js
│   │   │   ├── channelCreate.js
│   │   │   ├── channelDelete.js
│   │   │   ├── emojiCreate.js
│   │   │   ├── emojiDelete.js
│   │   │   ├── voiceStateUpdate.js
│   │   │   └── messageReactionAdd.js
│   │   ├── handlers/
│   │   │   ├── commandHandler.js
│   │   │   ├── eventHandler.js
│   │   │   ├── mongoHandler.js
│   │   │   ├── webhookHandler.js
│   │   │   ├── guildHandler.js
│   │   │   └── statsHandler.js
│   │   ├── models/
│   │   │   ├── user.js
│   │   │   ├── guild.js
│   │   │   ├── role.js
│   │   │   ├── ticket.js
│   │   │   ├── ban.js
│   │   │   ├── warn.js
│   │   │   ├── log.js
│   │   │   └── message.js
│   │   ├── plugins/
│   │   │   ├── levelSystem.js
│   │   │   ├── musicPlayer.js
│   │   │   ├── ticketSystem.js
│   │   │   └── economySystem.js
│   │   ├── services/
│   │   │   ├── mongo.js
│   │   │   ├── levelSystem.js
│   │   │   ├── ticketSystem.js
│   │   │   ├── musicPlayer.js
│   │   │   ├── webhook.js
│   │   │   ├── economySystem.js
│   │   │   └── logger.js
│   │   └── utils/
│   │       ├── config.js
│   │       ├── logger.js
│   │       ├── mongoUtil.js
│   │       ├── queue.js
│   │       ├── paginator.js
│   │       ├── welcomeCard.js
│   │       └── leaveCard.js
│   ├── config/
│   │   ├── default.json
│   │   ├── production.json
│   │   ├── development.json
│   │   └── staging.json
│   ├── middlewares/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── views/
│   ├── plugins/
│   ├── services/
│   ├── handlers/
│   ├── utils/
│   ├── database/
│   ├── public/
│   │   ├── css/
│   │   │   ├── style.css
│   │   ├── js/
│   │   │   ├── script.js
│   │   ├── images/
│   │       ├── logo.png
│   │   ├── fonts/
│   │       ├── fontawesome-webfont.ttf
│   │       ├── fontawesome-webfont.woff
│   │       ├── fontawesome-webfont.woff2
│   │       ├── fontawesome-webfont.eot
│   │       ├── fontawesome-webfont.svg
│   │       ├── fontawesome-webfont.otf
│   ├── data/
│   │   ├── json/
│   │   ├── builds/
│   │   ├── logs/
│   │   │   ├── app.log
│   │   │   ├── error.log
│   │   │   ├── debug.log
│   │   │   ├── info.log
│   │   │   ├── warning.log
│   │   │   ├── audit.log
│   │   │   ├── combined.log
│   │   │   ├── exceptions.log
│   │   │   ├── http.log
│   │   ├── images/
│   │   │   ├── avatars/
│   │   │   ├── icons/
│   │   │   ├── thumbnails/
│   │   │   ├── logos/
│   │   │   ├── backgrounds/
│   │   ├── uploads/
│   │       ├── videos/
│   │       ├── audios/
│   │       ├── documents/
│   │       ├── files/
│   │       ├── images/
│   │       ├── compressed/
│   │       ├── temp/
│   │       └── tmp/
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   ├── api/
│   │   │   ├── api.test.js
│   │   ├── bot/
│   │   │   ├── bot.test.js
│   │   └── mocks/
├── scripts/
│   ├── start.sh
│   ├── stop.sh
│   ├── restart.sh
├── .env
├── .eslintignore
├── .eslintrc.js
├── .babelrc
├── .prettierrc
├── .stylelintrc
├── .dockerignore
├── .editorconfig
├── Dockerfile
├── docker-compose.yml
├── nodemon.json
├── pm2.json
├── tsconfig.json
├── webpack.config.js
├── documentation/
│   ├── DOCUMENTATION.md
│   ├── ROADMAP.md
│   ├── TODO.md
├── README.md
├── LICENSE
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

- api: Tests für die API.
- bot: Tests für den Discord-Bot.
- integration: Integrationstests.

Um die Tests auszuführen, verwenden Sie:

```
npm test
```
