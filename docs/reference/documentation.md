# NodCord Documentation

## Einführung

NodCord ist eine Express-basierte Node.js-API mit integriertem Discord-Bot. Die Plattform kombiniert klassische REST-Endpunkte mit Bot-Funktionalität, damit Automatisierungen sowohl per HTTP als auch direkt im Discord-Ökosystem steuerbar sind. Dieses Dokument fasst die wichtigsten Arbeitsabläufe und Projektstrukturen zusammen.

## Installation

### Voraussetzungen

- Node.js >= 16 (Node 18 LTS empfohlen)
- npm >= 8
- Eine MongoDB-Instanz (lokal oder gehostet)
- Optional: Redis-Instanz für Caching/Sessions

### Installationsschritte

1. Repository klonen:
   ```bash
   git clone https://github.com/vectode/NodCord.git
   ```
2. Projektverzeichnis betreten:
   ```bash
   cd NodCord
   ```
3. Abhängigkeiten installieren:
   ```bash
   npm install
   ```
4. Eine `.env`-Datei auf Basis der bereitgestellten Beispielvariablen anlegen und die benötigten Secrets (Discord-Token, Datenbank-URLs etc.) pflegen.

## Entwicklungs- und Betriebs-Workflows

### Server starten

- Entwicklung mit automatischem Reload:
  ```bash
  npm run start:dev
  ```
- Produktion ohne Build-Artefakte (direkt aus dem Quellcode):
  ```bash
  npm start
  ```
- Produktion nach Erstellung eines Builds (siehe unten):
  ```bash
  npm run start:prod
  ```

### Build & Packaging

- Produktions-Build erzeugen (führt `build.js` aus, räumt alte Artefakte auf und erstellt das `build/`-Verzeichnis):
  ```bash
  npm run start:build
  ```
- Nach dem Build startet `npm run start:prod` den Server aus dem `build/`-Verzeichnis.

### Tests & Code-Stil

- Automatisierte Tests (Jest):
  ```bash
  npm test
  ```
- Code-Formatierung vereinheitlichen:
  ```bash
  npm run prettify
  ```

## API-Referenz (Kurzüberblick)

Die vollständigen Controller und Routen befinden sich unter `src/api`. Häufig genutzte Endpunkte sind unter anderem:

- `GET /api/discord/status` – gibt den aktuellen Status des Discord-Bots zurück.
- `POST /api/discord/message` – sendet eine Nachricht an einen angegebenen Kanal.

Ergänzende Module (z. B. Authentifizierung, Blog, Tickets, Commerce) sind jeweils in eigenen Controllern und Routen gekapselt. Die Dateien in `src/api/routes` bilden den Einstiegspunkt für weitere Endpunkte.

## Discord-Bot (Kurzüberblick)

Der Discord-Bot wird über `src/bot/index.js` initialisiert. Befehle und Events sind modular aufgebaut:

- Prefix-/Slash-Kommandos: `src/bot/commands/`
- Ereignishandler: `src/bot/events/`
- Hilfsfunktionen: `src/bot/functions/`

Standardbefehle wie `!ping` oder `!info` stehen bereit und können über weitere Module ergänzt werden.

## Verzeichnisstruktur

```text
NodCord/
├── CODE_OF_CONDUCT.md
├── README.md
├── build.js
├── docs/
│   ├── guides/
│   │   ├── faq.md
│   │   ├── installation.md
│   │   └── support.md
│   ├── meta/
│   │   └── folder-structure.md
│   ├── overview/
│   │   └── architecture.md
│   ├── planning/
│   │   ├── detailed-todo.md
│   │   └── todo.md
│   ├── process/
│   │   ├── changelog.md
│   │   ├── contributing.md
│   │   └── release.md
│   └── reference/
│       └── documentation.md
├── nodemon.json
├── package-lock.json
├── package.json
├── tsconfig.json
└── src/
    ├── api/
    ├── bot/
    ├── client/
    ├── config/
    ├── database/
    ├── models/
    ├── public/
    ├── scripts/
    ├── seeds/
    └── views/
```

Weitere Details zu den einzelnen Teilbereichen finden sich in den spezialisierten Dokumenten innerhalb des `docs/`-Ordners.
