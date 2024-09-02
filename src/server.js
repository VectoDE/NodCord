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

    const port = process.env.API_PORT || 3000;
    const baseURL = process.env.API_BASE_URL || 'localhost';

    http.createServer(api).listen(port, () => {
      logger.info(`[HTTP] Started and running on https://${baseURL}:${port}`);
    });

    startBot();
    startClient();

  } catch (err) {
    logger.error('[Server] Error starting server:', err);
    process.exit(1);
  }
};

startServer();
logger.info(`[Server] Starting server: ${packageInfo.name}`);
