# Ordnerstruktur

Die folgende Übersicht zeigt die wichtigsten Ordner und Dateien im Projekt und beschreibt ihre Aufgaben. Sie dient als Einstieg, um schnell die relevanten Bereiche zu finden.

```text
NodCord/
├── CODE_OF_CONDUCT.md
├── LICENSE
├── README.md
├── SECURITY.md
├── build.js                # Skript zum Erstellen eines produktionsfähigen Builds
├── node_modules/
├── nodemon.json            # Konfiguration für den Entwicklungs-Reload
├── package-lock.json
├── package.json
├── tsconfig.json
├── docs/                   # Dokumentation, Leitfäden und Planungsunterlagen
│   ├── guides/             # Schritt-für-Schritt-Anleitungen (Installation, FAQ, Support)
│   ├── meta/               # Meta-Dokumente wie diese Strukturübersicht
│   ├── overview/           # Architektur- und High-Level-Übersichten
│   ├── planning/           # Roadmaps, Aufgabenlisten und detaillierte Migrationspläne
│   ├── process/            # Projektprozesse (Changelog, Release-Plan, Contribution-Richtlinien)
│   └── reference/          # Technische Referenzen und tiefere Beschreibungen
└── src/                    # Anwendungscode (bitte nicht ohne Abstimmung ändern)
    ├── api/                # Express-App, Controller, Routen, Middlewares, Helper & Services
    ├── bot/                # Discord-Bot mit Commands, Events und Utility-Funktionen
    ├── client/             # Frontend-Code/Assets für das Dashboard
    ├── config/             # Konfigurationsdateien für API, Bot und Server
    ├── database/           # Verbindungslogik und Datenbank-spezifische Hilfen
    ├── models/             # Mongoose-Modelle für die verschiedenen Domänenobjekte
    ├── public/             # Statische Assets (CSS, Bilder, hochgeladene Dateien)
    ├── scripts/            # Automatisierungs- und Wartungsskripte
    ├── seeds/              # Seed-Daten und Initialisierungsskripte
    ├── server.ts           # Einstiegspunkt für den Serverstart
    └── views/              # EJS-Templates für serverseitiges Rendering
```

> **Hinweis:** Der `src/`-Bereich bleibt in der aktuellen Arbeitsanweisung unangetastet. Änderungen konzentrieren sich auf Dokumentation und Projektorganisation.
