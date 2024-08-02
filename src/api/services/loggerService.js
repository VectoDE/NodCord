const winston = require('winston');

// Erstelle einen Logger mit winston
const logger = winston.createLogger({
  level: 'info', // Standard-Log-Level
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    // Logge in die Konsole
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // Optional: Logge in eine Datei
    new winston.transports.File({ filename: '../../public/logs/app.log' })
  ]
});

// Log-Level-Methoden
const logInfo = (message) => logger.info(message);
const logWarn = (message) => logger.warn(message);
const logError = (message) => logger.error(message);

module.exports = {
  logInfo,
  logWarn,
  logError
};
