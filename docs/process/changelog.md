# CHANGELOG

Alle bemerkenswerten Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

## [2.0.0-alpha] - 2025-10-22
### Hinzugefügt
- Prisma Schema (`prisma/schema.prisma`) mit Kernmodellen für User, Rollen, Projekte und Tickets.
- Überarbeitete Dokumentation (README, Installationsguide, Architekturübersicht, Contributing).
- Neue Projektleitfäden zu TypeScript/Prisma in `docs/planning` und `docs/process`.
- Nodemon-/TypeScript-Konfiguration für `npm run dev` und neue npm-Skripte (Prisma, Build, Formatierung).

### Entfernt
- Legacy `build.js` Skript und veraltete Build-Hinweise.

## [1.0.1] - 2024-08-01
### Geändert
- Aktualisierte Dokumentation

## [1.0.0] - 2024-07-28
### Hinzugefügt
- Initiale Version von NodCord
- Grundlegende API-Endpunkte
- Discord Bot mit `!ping` und `!info` Befehlen
