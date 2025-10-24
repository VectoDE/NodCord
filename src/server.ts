import dotenv from 'dotenv';
import http from 'http';
import packageInfo from '../package.json';
import { api } from './api/app';
import { startBot } from './bot/index';
import { client, startClient } from './client/main';
import connectDB from './database/connectDB';
import { seedRolesIfNotExist } from '../prisma/seeds/rolesSeed';
import { seedUsersIfNotExist } from '../prisma/seeds/usersSeed';
import logger from './services/logger.service';
import pm2Service from './client/services/pm2Service';

// Environment-Variablen laden
dotenv.config();

const startServer = async (): Promise<void> => {
  try {
    // PM2-Komponenten überwachen
    pm2Service.monitorComponent(api, 'API Server');
    pm2Service.monitorComponent(client, 'Client Server');

    // Datenbankverbindung herstellen und Seeds ausführen
    await connectDB();
    await seedRolesIfNotExist();
    await seedUsersIfNotExist();

    const apiHttps: string = process.env.API_HTTPS || 'http';
    const apiPort: number = parseInt(process.env.API_PORT || '3000', 10);
    const apiBaseURL: string = process.env.API_BASE_URL || 'localhost';

    // HTTP-Server starten
    http.createServer(api).listen(apiPort, () => {
      logger.info(`[HTTP] Started and running on ${apiHttps}://${apiBaseURL}:${apiPort}`);
    });

    // Bot und Client starten
    await startBot();
    await startClient();

  } catch (err) {
    logger.error('[Server] Error starting server:', err);
    process.exit(1);
  }
};

// Server starten
startServer();
logger.info(`[Server] Starting server: ${packageInfo.name}`);
