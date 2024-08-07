const http = require('http');
const mongoose = require('mongoose');
const package = require('../package.json');
const { app, startApp } = require('./api/app');
const bot = require('./bot/index');
const connectDB = require('./database/connectDB');
const { seedRolesIfNotExist } = require('./seeds/rolesSeed');
const logger = require('./api/services/loggerService');

const startServer = async () => {
  try {
    await connectDB();

    await seedRolesIfNotExist();

    await startApp();

    bot.start();

  } catch (err) {
    logger.error('Error starting server:', err);
    process.exit(1);
  }
};

startServer();
logger.info(`Starting server: ${package.name}`);
