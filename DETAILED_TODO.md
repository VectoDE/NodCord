# NodCord 2.0.0 – Detailplan zur vollständigen Migration

Dieser Plan ergänzt die high-level Roadmap in `TODO.md` und listet jede konkrete Code-Stelle auf, die für eine produktionsreife TypeScript-/Prisma-/MySQL-Version angepasst werden muss. Alle Aufgaben sind als iterative, überprüfbare Schritte formuliert.

## Globale Grundlagen
- [ ] Tooling vereinheitlichen: ESLint/Prettier/TSConfig und Pfad-Aliase für alle Teilbereiche (`src/api`, `src/bot`, `src/client`).
- [ ] `prisma/schema.prisma` modellieren (Äquivalente zu allen Mongoose-Schemas in `src/models/*.ts`, inklusive Relationen, Unique-Indizes, Default-Werten, Enums).
- [ ] Prisma-Client-Setup erstellen (`src/database/prismaClient.ts`) und in `src/server.ts`, API, Bot und Client injizieren.
- [ ] Gemeinsame Fehler- und Antworttypen definieren (`src/types/http.ts`, `src/types/domain/*.ts`), die von Controllern, Services, Middlewares genutzt werden.
- [ ] `src/api/helpers/sendResponseHelper.js` → `sendResponseHelper.ts` refaktorieren und als zentrale Response-Utility typisieren.
- [ ] Security/Config: `.env.example` für MySQL/Redis/Mail/etc. erweitern, Secrets-Handling dokumentieren.

## Backend – Express-Anwendung
### Bootstrap & Infrastruktur
- [ ] `src/api/app.js` → `app.ts`: Express-Setup, Session-Store, Passport-/JWT-Anbindung, EJS-Konfiguration mit TypeScript-Typen.
- [ ] `src/server.ts`: Server-Bootstrap auf Prisma-/TypeScript-Build anpassen (HTTP, Socket.io falls benötigt, Shutdown-Hooks für Prisma).
- [ ] `src/database/connectDB.js` entfernen, MySQL/Prisma-Verbindung in neuem Prisma-Client kapseln.

### Middlewares (`src/api/middlewares`)
- [ ] `apiKeyMiddleware.js`, `authMiddleware.js`, `betaMiddleware.js`, `compressionMiddleware.js`, `corsMiddleware.js`, `developerProgramMiddleware.js`, `rateLimiterMiddleware.js`, `roleMiddleware.js` zu `.ts` portieren; Request/User-Kontext typisieren; Mongo-Abhängigkeiten durch Prisma-Aufrufe ersetzen.

### Helpers (`src/api/helpers`)
- [ ] `getBaseUrlHelper.js`, `jwtHelper.js`, `overviewControl.js`, `routesCollector.js`, `sendResponseHelper.js` nach TypeScript übertragen; JWT- und Routing-Logik auf neue Services/Typen abstimmen.

### Utils (`src/api/utils`)
- [ ] `multerUtil.js` und `passportUtil.js` typisieren, Speicherpfade/Konfiguration auf MySQL-/Prisma-Backends und neue Auth-Strategien abstimmen.

## Backend – Routen & Controller
Für jede Route ist die zugehörige Controller-Logik auf Prisma-Queries umzustellen, Input/Output zu typisieren, Validierungen zu ergänzen und Tests/Swagger-Einträge (falls geplant) vorzubereiten. Alle nachfolgenden Punkte umfassen: `routes/*.js` → `.ts`, `controllers/*.js` → `.ts`, Services auf Prisma umstellen, Mongoose-Modelle aus `src/models` ablösen.

- [ ] API Keys (`src/api/routes/apiKeyRoutes.js`, `src/api/controllers/apiKeyController.js`) – Prisma-Tabellen `ApiKey`, `User` nutzen; Key-Generierung in Service kapseln.
- [ ] Auth (`authRoutes.js`, `authController.js`) – Login/Registration auf Prisma-User, Passwort-Hashing, Session-/Token-Handling via TypeScript.
- [ ] Beta (`betaRoutes.js`, `betaController.js`) – Beta-Key-Verwaltung (`betaKeyModel.ts`, `betaSystemModel.ts`) nach Prisma migrieren, Status-Flags typisieren.
- [ ] Blog (`blogRoutes.js`, `blogController.js`) – Blog-Posts/Tags/Comments über Prisma-Relationen (`blogModel.ts`, `commentModel.ts`, `tagModel.ts`).
- [ ] Bug Tracking (`bugRoutes.js`, `bugController.js`) – Bug-Modelle, Status, User-Zuordnung mit Prisma.
- [ ] Categories (`categoryRoutes.js`, `categoryController.js`) – Kategorietypen, Slugs, Sortierung.
- [ ] Chat (`chatRoutes.js`, `chatController.js`) – ChatRooms/Messages via Prisma, ggf. Socket.io-Schnittstellen prüfen.
- [ ] CloudNet (`cloudnetRoutes.js`, `cloudnetController.js`) – API-Aufrufe typisieren, Credentials in Prisma-hinterlegten Tabellen speichern.
- [ ] Comments (`commentRoutes.js`, `commentController.js`) – Kommentare/Replies mit Prisma und referenzierten Entities.
- [ ] Company (`companyRoutes.js`, `companyController.js`) – Firmenprofile, zugehörige Users/Organizations.
- [ ] Control Panel (`controlRoutes.js`, `controlController.js`) – Admin-/Dashboard-Endpunkte, Stats aus Prisma aggregieren.
- [ ] Customers (`customerRoutes.js`, `customerController.js`) – Kundenstammdaten, Relationen zu Orders (`customerOrderModel.ts`).
- [ ] Customer Orders (`customerOrderRoutes.js`, `customerOrderController.js`) – Aufträge, Status-Übergänge, Payment-Verknüpfung.
- [ ] Developer Program (`developerProgramRoutes.js`, `developerProgramController.js`) – Programm-Anmeldungen, Token-Handling.
- [ ] Dislikes (`dislikeRoutes.js`, `dislikeController.js`) – Like/Dislike-Systeme vereinheitlichen, Prisma Unique-Constraints.
- [ ] Faceit (`faceitRoutes.js`, `faceitController.js`) – API-Keys, Account-Verknüpfungen, Prisma Storage.
- [ ] Favorites (`favoriteRoutes.js`, `favoriteController.js`) – Favoritenlisten und Bezüge zu Projekten/Posts.
- [ ] Feature Requests (`featureRoutes.js`, `featureController.js`) – Request-Verwaltung, Voting.
- [ ] Feedback (`feedbackRoutes.js`, `feedbackController.js`) – Feedback-Entries, Status, Replies.
- [ ] File Storage (`fileRoutes.js`, `fileController.js`) – Upload-Handling (Multer), Metadaten in Prisma.
- [ ] Game (`gameRoutes.js`, `gameController.js`) – Game-Datensätze, Plattformen (`gameModel.ts`, `platformModel.ts`).
- [ ] GitHub (`githubRoutes.js`, `githubController.js`) – OAuth-Flow, Repo-Data, Token-Storage.
- [ ] Group (`groupRoutes.js`, `groupController.js`) – Gruppen, Mitglieder, Rollen.
- [ ] Info (`infoRoutes.js`, `infoController.js`) – Info/Status-Endpunkte, Prisma-Statistiken.
- [ ] Issue Tracker (`issueRoutes.js`, `issueController.js`) – Tickets, Status, Kommentare, Zuweisungen.
- [ ] Like (`likeRoutes.js`, `likeController.js`) – Likes analog zu Dislikes/Favorites.
- [ ] Log (`logRoutes.js`, `logController.js`) – Audit/Activity Logs, Prisma Logging-Tabelle.
- [ ] Newsletter (`newsletterRoutes.js`, `newsletterController.js`) – Subscriber-Verwaltung, Opt-In.
- [ ] Order (`orderRoutes.js`, `orderController.js`) – Shop-Bestellungen, Payment-Schnittstellen.
- [ ] Organization (`organizationRoutes.js`, `organizationController.js`) – Organisationsstruktur, Teams.
- [ ] Payment (`paymentRoutes.js`, `paymentController.js`) – Provider-Integrationen, Payment-Records.
- [ ] Plex (`plexRoutes.js`, `plexController.js`) – Token/Session-Management, Device-Registrierung.
- [ ] Product (`productRoutes.js`, `productController.js`) – Produktkatalog, Preise, Varianten.
- [ ] Profile (`profileRoutes.js`, `profileController.js`) – Benutzerprofile, Privacy-Einstellungen.
- [ ] Project (`projectRoutes.js`, `projectController.js`) – Projekte, Status, Mitwirkende.
- [ ] Proxmox (`proxmoxRoutes.js`, `proxmoxController.js`) – Cluster-/Node-Verwaltung, Token-Storage.
- [ ] Returns (`returnRoutes.js`, `returnController.js`) – Rücksendungen, Status-Handling.
- [ ] Role (`roleRoutes.js`, `roleController.js`) – Rollenverwaltung, Rechte mit Prisma.
- [ ] Security (`securityRoutes.js`, `securityController.js`) – Sicherheitsfeatures, 2FA, Logs.
- [ ] Share (`shareRoutes.js`, `shareController.js`) – Sharing-Links, Expiration-Handling.
- [ ] Steam (`steamRoutes.js`, `steamController.js`) – Steam-API-Key-Verwaltung, User-Verknüpfung.
- [ ] Story (`storyRoutes.js`, `storyController.js`) – Stories/Timeline-Features.
- [ ] Subscriber (`subscriberRoutes.js`, `subscriberController.js`) – Abonnenten-Handling (Blog/Newsletter).
- [ ] Tag (`tagRoutes.js`, `tagController.js`) – Tags, Zuweisungen zu Content.
- [ ] Task (`taskRoutes.js`, `taskController.js`) – Aufgabenverwaltung, Statuswechsel.
- [ ] Team (`teamRoutes.js`, `teamController.js`) – Teams, Mitglieder, Rollen.
- [ ] Teamspeak (`teamspeakRoutes.js`, `teamspeakController.js`) – Server-Verknüpfungen, Auth.
- [ ] Ticket (`ticketRoutes.js`, `ticketController.js`) – Support-Tickets, Antworten (`ticketResponseModel.ts`).
- [ ] User (`userRoutes.js`, `userController.js`) – Benutzerverwaltung, Rollen, Passwort-Resets.
- [ ] Version (`versionRoutes.js`, `versionController.js`) – Versioning, Release-Notes, Tags (`versionTagModel.ts`).

## Backend – Services (`src/api/services`)
- [ ] `apiStatusService.js`, `dbStatusService.js` auf Prisma-/MySQL-Gesundheitschecks umstellen.
- [ ] Kommunikations-/Integration-Services (`botStatusService.js`, `cloudnetService.js`, `faceitService.js`, `githubService.js`, `googleService.js`, `plexService.js`, `proxmoxService.js`, `steamService.js`, `teamspeakService.js`) typisieren und Secrets via Prisma gespeicherte Credentials beziehen.
- [ ] Content/Business-Services (`appleService.js`, `blogService.js`, `infoService.js`, `logService.js`, `nodemailerService.js`) refaktorieren: Abhängigkeiten injizieren, Prisma verwenden, Fehlerbehandlung zentralisieren.
- [ ] `loggerService.js` auf strukturiertes Logging mit gemeinsamen Typen/Tracing erweitern.

## Datenmodelle (`src/models`)
- [ ] Für jedes bestehende Mongoose-Schema (`*.ts`) Prisma-Modelle definieren und Mongoose-Implementierungen entfernen. Sicherstellen, dass alle Referenzen (z. B. `userId`, `projectId`, `guildId`) als Prisma-Relationen oder Foreign Keys modelliert werden.
- [ ] Migration-Skripte für Alt-Daten erstellen (Mongo → MySQL) pro Modellgruppe: Benutzer/Rollen, Commerce (Products/Orders/Returns), Tickets, Blog, Games, Developer Program etc.

## Seeds & Skripte
- [ ] `src/seeds/rolesSeed.ts`, `src/seeds/usersSeed.ts` auf Prisma-Seeding (`prisma db seed`) umstellen, zusätzliche Seeds für kritische Tabellen ergänzen.
- [ ] `src/scripts` (falls vorhanden) auf TypeScript + Prisma refaktorieren, Deployment-Skripte aktualisieren.

## Discord-Bot (`src/bot`)
- [ ] `src/bot/index.js` → `.ts` (Bot-Initialisierung, Login, Prisma-Anbindung für Persistenz).
- [ ] Kommandos unter `src/bot/commands`, `src/bot/prefix` und Events unter `src/bot/events` nach TypeScript portieren; Datenzugriffe (z. B. Prefixe, Logs, Warns) über Prisma statt direkte Modelle.
- [ ] Hilfsfunktionen unter `src/bot/functions` typisieren und mit gemeinsamen Domain-Typen teilen.

## Client (`src/client`)
- [ ] Einstieg `src/client/main.js` → `.ts`; Frontend-Build (Webpack/Vite) auf TypeScript vorbereiten.
- [ ] Routes, Services, Stores im Client nach TypeScript migrieren; API-Aufrufe an neue Prisma-basierten Endpunkte anpassen.
- [ ] Gemeinsame UI-Typen und Interfaces definieren, Response-Objekte synchron mit Backend halten.

## Views & Public Assets
- [ ] EJS-Templates unter `src/views` auf geänderte Datenmodelle/Controller-Outputs anpassen.
- [ ] Statische Assets in `src/public` prüfen und ggf. Build-Pipeline (hashing, CDN) ergänzen.

## Tests & Qualitätssicherung
- [ ] Unit-/Integrationstests für jede API-Route erstellen (Jest/Vitest + Supertest) mit Prisma-Testdatenbank.
- [ ] Bot- und Client-Tests (Mock Discord.js, API-Mocks) hinzufügen.
- [ ] End-to-End-Tests für kritische Flows (Auth, Orders, Tickets).

## DevOps & Betrieb
- [ ] CI/CD-Workflows (Lint/Test/Build/Prisma Migrate) konfigurieren.
- [ ] Docker-/Compose-Setup für Node + MySQL + Redis vorbereiten.
- [ ] Monitoring/Alerting (Healthchecks, Prisma-Metrics) implementieren.
- [ ] Release-Checklisten für Alpha → Beta → LTS dokumentieren (Rollout-Plan, Migrationsschritte, Kommunikationspakete).
