const fs = require('fs');
const path = require('path');
const logger = require('./loggerService');

const statusFilePath = path.join(
  __dirname,
  '..',
  '..',
  'public',
  'json',
  'dbStatus.json'
);

let dbStatus = 'offline';

if (fs.existsSync(statusFilePath)) {
  try {
    const data = fs.readFileSync(statusFilePath, 'utf8');
    dbStatus = JSON.parse(data).status;
    logger.info(`[STATUS] Statusdatei gefunden. Aktueller Status: ${dbStatus}`);
  } catch (err) {
    logger.error('[STATUS] Fehler beim Lesen der Statusdatei:', err);
    dbStatus = 'online';
    fs.writeFileSync(
      statusFilePath,
      JSON.stringify({ status: dbStatus }),
      'utf8'
    );
  }
} else {
  dbStatus = 'online';
  fs.writeFileSync(
    statusFilePath,
    JSON.stringify({ status: dbStatus }),
    'utf8'
  );
  logger.info('[STATUS] Statusdatei erstellt und Standardstatus auf "online" gesetzt.');
}

exports.setStatus = (status) => {
  if (['online', 'offline', 'maintenance'].includes(status)) {
    dbStatus = status;
    fs.writeFileSync(statusFilePath, JSON.stringify({ status }), 'utf8');
    logger.info(`[STATUS] Datenbankstatus auf ${status} gesetzt.`);
  } else {
    logger.error('[STATUS] Ungültiger Status:', status);
    throw new Error('Ungültiger Status');
  }
};

exports.getStatus = () => {
  logger.info(`[STATUS] Aktueller Datenbankstatus: ${dbStatus}`);
  return dbStatus;
};

exports.startDb = () => {
  if (dbStatus === 'offline') {
    dbStatus = 'online';
    fs.writeFileSync(
      statusFilePath,
      JSON.stringify({ status: dbStatus }),
      'utf8'
    );
    logger.info('[STATUS] Datenbank gestartet und Status auf "online" gesetzt.');
  } else {
    logger.error('[STATUS] Datenbank ist bereits online oder im Wartungsmodus.');
    throw new Error('Datenbank ist bereits online oder im Wartungsmodus');
  }
};

exports.stopDb = () => {
  if (dbStatus === 'online') {
    dbStatus = 'offline';
    fs.writeFileSync(
      statusFilePath,
      JSON.stringify({ status: dbStatus }),
      'utf8'
    );
    logger.info('[STATUS] Datenbank gestoppt und Status auf "offline" gesetzt.');
  } else {
    logger.error('[STATUS] Datenbank ist bereits offline oder im Wartungsmodus.');
    throw new Error('Datenbank ist bereits offline oder im Wartungsmodus');
  }
};

exports.restartDb = () => {
  if (dbStatus === 'online') {
    dbStatus = 'offline';
    fs.writeFileSync(
      statusFilePath,
      JSON.stringify({ status: dbStatus }),
      'utf8'
    );
    logger.info('[STATUS] Datenbank wird neu gestartet. Status auf "offline" gesetzt.');

    setTimeout(() => {
      dbStatus = 'online';
      fs.writeFileSync(
        statusFilePath,
        JSON.stringify({ status: dbStatus }),
        'utf8'
      );
      logger.info('[STATUS] Datenbank nach Neustart auf "online" gesetzt.');
    }, 5000);
  } else {
    logger.error('[STATUS] Datenbank ist bereits offline oder im Wartungsmodus.');
    throw new Error('Datenbank ist bereits offline oder im Wartungsmodus');
  }
};
