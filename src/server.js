const http = require('http');
const packageInfo = require('../package.json');
const { api } = require('./api/app');
const bot = require('./bot/index');
const connectDB = require('./database/connectDB');
const { seedRolesIfNotExist } = require('./seeds/rolesSeed');
const logger = require('./api/services/loggerService');

const startServer = async () => {
  try {
    await connectDB();

    await seedRolesIfNotExist();

    const port = process.env.PORT || 3000;
    const baseURL = process.env.BASE_URL || 'localhost';
    http.createServer(api).listen(port, () => {
      logger.info(`Server is running on https://${baseURL}:${port}`);
    });

    bot.start();

  } catch (err) {
    logger.error('Error starting server:', err);
    process.exit(1);
  }
};

startServer();
logger.info(`Starting server: ${packageInfo.name}`);
