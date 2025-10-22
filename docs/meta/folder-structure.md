# Ordnerstruktur

Die folgende Übersicht zeigt die wichtigsten Ordner und Dateien im Projekt und beschreibt ihre Aufgaben. Sie dient als Einstieg, um schnell die relevanten Bereiche zu finden.

```text
NodCord/
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── LICENSE
├── README.md
├── SECURITY.md
├── docs/                   # Dokumentation, Leitfäden und Planungsunterlagen
│   ├── guides/             # Schritt-für-Schritt-Anleitungen (Installation, FAQ, Support)
│   ├── meta/               # Meta-Dokumente wie diese Strukturübersicht
│   ├── overview/           # Architektur- und High-Level-Übersichten
│   ├── planning/           # Roadmaps, Aufgabenlisten und detaillierte Migrationspläne
│   ├── process/            # Projektprozesse (Changelog, Release-Plan, Contribution-Richtlinien)
│   └── reference/          # Technische Referenzen und tiefere Beschreibungen
├── nodemon.json            # Dev-Server-Konfiguration für ts-node-dev
├── package.json            # Projektabhängigkeiten und Skripte
├── prisma/                 # Prisma-Schema, Migrationen und Seeds
│   └── schema.prisma       # MySQL-Modelldefinitionen
├── tsconfig.json           # TypeScript-Compiler-Einstellungen
├── dist/                   # Kompilierte Ausgabedateien (wird beim Build erstellt)
└── src/                    # Anwendungscode (API, Bot, Client, Seeds etc.)
    ├── api/                # Express-App, Controller, Routen, Middlewares, Helper & Services
    ├── bot/                # Discord-Bot mit Commands, Events und Utility-Funktionen
    ├── client/             # Frontend-Code/Assets für das Dashboard
    ├── config/             # Konfigurationsdateien für API, Bot und Server
    ├── database/           # Verbindungslogik und Datenbank-spezifische Hilfen
    ├── models/             # Übergangsweise vorhandene Mongoose-Modelle (werden durch Prisma ersetzt)
    ├── public/             # Statische Assets (CSS, Bilder, hochgeladene Dateien)
    ├── scripts/            # Automatisierungs- und Wartungsskripte
    ├── seeds/              # Seed-Daten und Initialisierungsskripte
    ├── server.ts           # Einstiegspunkt für den Serverstart
    └── views/              # EJS-Templates für serverseitiges Rendering
```

> **Hinweis:** Der Fokus aktueller Arbeiten liegt auf der Konsolidierung des TypeScript-Codes und der Migration von MongoDB/Mongoose zu Prisma + MySQL. Änderungen am `src/`-Bereich sollten eng mit dem Maintainer-Team abgestimmt werden.
