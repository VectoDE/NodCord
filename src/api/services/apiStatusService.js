const fs = require('fs');
const path = require('path');
const logger = require('./loggerService');

const statusFilePath = path.join(
  __dirname,
  '..',
  '..',
  'public',
  'json',
  'apiStatus.json'
);

let apiStatus = 'offline';

if (fs.existsSync(statusFilePath)) {
  try {
    const data = fs.readFileSync(statusFilePath, 'utf8');
    apiStatus = JSON.parse(data).status;
    logger.info(`[STATUS] API-Status beim Starten geladen: ${apiStatus}`);
  } catch (err) {
    logger.error('[STATUS] Fehler beim Lesen der Statusdatei:', err);
  }
} else {
  apiStatus = 'online';
  try {
    fs.writeFileSync(
      statusFilePath,
      JSON.stringify({ status: apiStatus }),
      'utf8'
    );
    logger.info('[STATUS] Statusdatei erstellt und auf online gesetzt.');
  } catch (err) {
    logger.error('[STATUS] Fehler beim Erstellen der Statusdatei:', err);
  }
}

exports.setStatus = (status) => {
  if (['online', 'offline', 'maintenance'].includes(status)) {
    apiStatus = status;
    try {
      fs.writeFileSync(statusFilePath, JSON.stringify({ status }), 'utf8');
      logger.info(`[STATUS] API-Status auf ${status} gesetzt.`);
    } catch (err) {
      logger.error('[STATUS] Fehler beim Setzen des API-Status:', err);
      throw err;
    }
  } else {
    logger.error('[STATUS] Ungültiger Status beim Setzen des API-Status:', status);
    throw new Error('Ungültiger Status');
  }
};

exports.getStatus = () => {
  logger.info(`[STATUS] Aktueller API-Status: ${apiStatus}`);
  return apiStatus;
};

exports.startApi = () => {
  if (apiStatus === 'offline') {
    apiStatus = 'online';
    try {
      fs.writeFileSync(
        statusFilePath,
        JSON.stringify({ status: apiStatus }),
        'utf8'
      );
      logger.info('[STATUS] API erfolgreich gestartet.');
    } catch (err) {
      logger.error('[STATUS] Fehler beim Starten der API:', err);
      throw err;
    }
  } else {
    logger.error(
      '[STATUS] API kann nicht gestartet werden, da sie bereits online oder im Wartungsmodus ist.'
    );
    throw new Error('API ist bereits online oder im Wartungsmodus');
  }
};

exports.stopApi = () => {
  if (apiStatus === 'online') {
    apiStatus = 'offline';
    try {
      fs.writeFileSync(
        statusFilePath,
        JSON.stringify({ status: apiStatus }),
        'utf8'
      );
      logger.info('[STATUS] API erfolgreich gestoppt.');
    } catch (err) {
      logger.error('[STATUS] Fehler beim Stoppen der API:', err);
      throw err;
    }
  } else {
    logger.error(
      '[STATUS] API kann nicht gestoppt werden, da sie bereits offline oder im Wartungsmodus ist.'
    );
    throw new Error('API ist bereits offline oder im Wartungsmodus');
  }
};

exports.restartApi = () => {
  if (apiStatus === 'online') {
    apiStatus = 'offline';
    try {
      fs.writeFileSync(
        statusFilePath,
        JSON.stringify({ status: apiStatus }),
        'utf8'
      );
      logger.info('[STATUS] API wird neu gestartet...');
      setTimeout(() => {
        apiStatus = 'online';
        try {
          fs.writeFileSync(
            statusFilePath,
            JSON.stringify({ status: apiStatus }),
            'utf8'
          );
          logger.info('[STATUS] API erfolgreich neu gestartet.');
        } catch (err) {
          logger.error('[STATUS] Fehler beim Neu-Starten der API:', err);
          throw err;
        }
      }, 5000);
    } catch (err) {
      logger.error('[STATUS] Fehler beim Neustarten der API:', err);
      throw err;
    }
  } else {
    logger.error(
      '[STATUS] API kann nicht neu gestartet werden, da sie nicht online ist.'
    );
    throw new Error('API ist bereits offline oder im Wartungsmodus');
  }
};

exports.setMaintenance = () => {
  if (apiStatus !== 'maintenance') {
    apiStatus = 'maintenance';
    try {
      fs.writeFileSync(
        statusFilePath,
        JSON.stringify({ status: apiStatus }),
        'utf8'
      );
      logger.info('[STATUS] API in den Wartungsmodus versetzt.');
    } catch (err) {
      logger.error('[STATUS] Fehler beim Versetzen der API in den Wartungsmodus:', err);
      throw err;
    }
  } else {
    logger.error('[STATUS] API ist bereits im Wartungsmodus.');
    throw new Error('API ist bereits im Wartungsmodus');
  }
};

exports.removeMaintenance = () => {
  if (apiStatus === 'maintenance') {
    apiStatus = 'online';
    try {
      fs.writeFileSync(
        statusFilePath,
        JSON.stringify({ status: apiStatus }),
        'utf8'
      );
      logger.info('[STATUS] Wartungsmodus entfernt. API ist jetzt online.');
    } catch (err) {
      logger.error('[STATUS] Fehler beim Entfernen des Wartungsmodus:', err);
      throw err;
    }
  } else {
    logger.error('[STATUS] API ist nicht im Wartungsmodus.');
    throw new Error('API ist nicht im Wartungsmodus');
  }
};
