const fs = require('fs');
const path = require('path');
const logger = require('./loggerService');

const loggerLogPath = path.join(__dirname, '..', '..', '..', 'logs', 'app.log');

const readLogFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      logger.info(`Reading log file from path: ${filePath}`);
      const logContent = fs.readFileSync(filePath, 'utf8');
      logger.info(`Successfully read log file from path: ${filePath}`);
      return logContent;
    } else {
      logger.warn(`Log file not found at path: ${filePath}`);
      return 'Keine Log-Datei gefunden.';
    }
  } catch (err) {
    logger.error(`Fehler beim Lesen der Log-Datei ${filePath}: ${err.message}`);
    return 'Fehler beim Lesen der Log-Datei.';
  }
};

module.exports = {
  getLoggerLogs: () => readLogFile(loggerLogPath),
};
