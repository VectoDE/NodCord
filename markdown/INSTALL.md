## Installation

Diese Anleitung führt dich durch die Installation von NodCord.

### Voraussetzungen

- Node.js (Version 14 oder höher)
- npm (Node Package Manager)
- Git

### Schritte

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

4. Erstelle eine `.env`-Datei im Stammverzeichnis und füge die folgenden Variablen hinzu:
    ```
    DISCORD_TOKEN=dein_discord_token
    CLIENT_ID=dein_client_id
    GUILD_ID=dein_guild_id
    PORT=3000
    ```

5. Starte den Server:
    ```sh
    npm start
    ```

6. Der Server läuft nun auf `http://localhost:3000`.