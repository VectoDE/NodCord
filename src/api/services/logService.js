const fs = require('fs');
const path = require('path');

const loggerLogPath = path.join(__dirname, '..', '..', '..' ,'logs', 'app.log');

const readLogFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    } else {
      return 'Keine Log-Datei gefunden.';
    }
  } catch (err) {
    console.error(`Fehler beim Lesen der Log-Datei ${filePath}:`, err);
    return 'Fehler beim Lesen der Log-Datei.';
  }
};

module.exports = {
  getLoggerLogs: () => readLogFile(loggerLogPath),
};
