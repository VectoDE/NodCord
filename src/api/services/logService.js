const fs = require('fs');
const path = require('path');
const readline = require('readline');
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

const readRecentLines = (filePath, numLines) => {
  return new Promise((resolve, reject) => {
    const lines = [];
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath, { encoding: 'utf8' }),
      crlfDelay: Infinity
    });

    rl.on('line', (line) => {
      lines.push(line);
      if (lines.length > numLines) {
        lines.shift();
      }
    });

    rl.on('close', () => {
      resolve(lines.reverse());
    });

    rl.on('error', (err) => {
      logger.error(`Fehler beim Lesen der Log-Datei ${filePath}: ${err.message}`);
      reject(err);
    });
  });
};

module.exports = {
  getLoggerLogs: () => readLogFile(loggerLogPath),
  getRecentLoggerLogs: (numLines) => readRecentLines(loggerLogPath, numLines),
};
