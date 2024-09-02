const mongoose = require('mongoose');
const serverConfig = require('../config/serverConfig');
const logger = require('../api/services/loggerService');

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(serverConfig.mongoURI, {});
    logger.info(`[Database] Connected successfully to ${serverConfig.mongoURI}`);
  } catch (err) {
    logger.error('[Database] Fehler bei der Datenbankverbindung:', err.message);
    throw err;
  }
};

module.exports = connectDB;
