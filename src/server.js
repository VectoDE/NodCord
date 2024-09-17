require('dotenv').config();
const http = require('http');

const packageInfo = require('../package.json');

const { api, startApi } = require('./api/app');
const { bot, startBot } = require('./bot/index');
const { client, startClient } = require('./client/main');

const connectDB = require('./database/connectDB');
const { seedRolesIfNotExist } = require('./seeds/rolesSeed');
const { seedUsersIfNotExist } = require('./seeds/usersSeed');

const logger = require('./api/services/loggerService');
const pm2Service = require('./client/services/pm2Service');

const startServer = async () => {
  try {
    pm2Service.monitorComponent(api, 'API Server');
    pm2Service.monitorComponent(client, 'Client Server');

    await connectDB();
    await seedRolesIfNotExist();
    await seedUsersIfNotExist();

    const apiHttps = process.env.API_HTTPS || 'http';
    const apiPort = process.env.API_PORT || 3000;
    const apiBaseURL = process.env.API_BASE_URL || 'localhost';

    if (process.env.NODE_ENV === 'production') {
      http.createServer(api).listen(apiPort, () => {
        logger.info(`[HTTP] Started and running on ${apiHttps}://${apiBaseURL}:${apiPort}`);
      });
    } else if (process.env.NODE_ENV === 'development') {
      http.createServer(api).listen(apiPort, () => {
        logger.info(`[HTTP] Started and running on ${apiHttps}://${apiBaseURL}:${apiPort}`);
      });
    }

    startBot();

    startClient();

  } catch (err) {
    logger.error('[Server] Error starting server:', err);
    process.exit(1);
  }
};

startServer();
logger.info(`[Server] Starting server: ${packageInfo.name}`);
