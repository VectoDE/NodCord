const fs = require('fs');
const path = require('path');
const logger = require('./loggerService');

const statusFilePath = path.join(
  __dirname,
  '..',
  '..',
  'public',
  'json',
  'botStatus.json'
);

let botStatus = 'offline';

if (fs.existsSync(statusFilePath)) {
  try {
    const data = fs.readFileSync(statusFilePath, 'utf8');
    botStatus = JSON.parse(data).status;
    logger.info(`[STATUS] Bot-Status beim Starten geladen: ${botStatus}`);
  } catch (err) {
    logger.error('[STATUS] Fehler beim Lesen der Statusdatei:', err);
  }
} else {
  botStatus = 'offline';
  try {
    fs.writeFileSync(
      statusFilePath,
      JSON.stringify({ status: botStatus }),
      'utf8'
    );
    logger.info('[STATUS] Statusdatei erstellt und auf offline gesetzt.');
  } catch (err) {
    logger.error('[STATUS] Fehler beim Erstellen der Statusdatei:', err);
  }
}

exports.setStatus = (status) => {
  if (['online', 'offline', 'maintenance'].includes(status)) {
    botStatus = status;
    try {
      fs.writeFileSync(statusFilePath, JSON.stringify({ status }), 'utf8');
      logger.info(`[STATUS] Bot-Status auf ${status} gesetzt.`);
    } catch (err) {
      logger.error('[STATUS] Fehler beim Setzen des Bot-Status:', err);
      throw err;
    }
  } else {
    logger.error('[STATUS] Ungültiger Status beim Setzen des Bot-Status:', status);
    throw new Error('Ungültiger Status');
  }
};

exports.getStatus = () => {
  logger.info(`[STATUS] Aktueller Bot-Status: ${botStatus}`);
  return botStatus;
};

exports.startBot = () => {
  if (botStatus === 'offline') {
    botStatus = 'online';
    try {
      fs.writeFileSync(
        statusFilePath,
        JSON.stringify({ status: botStatus }),
        'utf8'
      );
      logger.info('[STATUS] Bot erfolgreich gestartet.');
    } catch (err) {
      logger.error('[STATUS] Fehler beim Starten des Bots:', err);
      throw err;
    }
  } else {
    logger.error(
      '[STATUS] Bot kann nicht gestartet werden, da er bereits online oder im Wartungsmodus ist.'
    );
    throw new Error('Bot ist bereits online oder im Wartungsmodus');
  }
};

exports.stopBot = () => {
  if (botStatus === 'online') {
    botStatus = 'offline';
    try {
      fs.writeFileSync(
        statusFilePath,
        JSON.stringify({ status: botStatus }),
        'utf8'
      );
      logger.info('[STATUS] Bot erfolgreich gestoppt.');
    } catch (err) {
      logger.error('[STATUS] Fehler beim Stoppen des Bots:', err);
      throw err;
    }
  } else {
    logger.error(
      '[STATUS] Bot kann nicht gestoppt werden, da er bereits offline oder im Wartungsmodus ist.'
    );
    throw new Error('Bot ist bereits offline oder im Wartungsmodus');
  }
};

exports.restartBot = () => {
  if (botStatus === 'online') {
    botStatus = 'offline';
    try {
      fs.writeFileSync(
        statusFilePath,
        JSON.stringify({ status: botStatus }),
        'utf8'
      );
      logger.info('[STATUS] Bot wird neu gestartet...');
      setTimeout(() => {
        botStatus = 'online';
        try {
          fs.writeFileSync(
            statusFilePath,
            JSON.stringify({ status: botStatus }),
            'utf8'
          );
          logger.info('[STATUS] Bot erfolgreich neu gestartet.');
        } catch (err) {
          logger.error('[STATUS] Fehler beim Neu-Starten des Bots:', err);
          throw err;
        }
      }, 5000);
    } catch (err) {
      logger.error('[STATUS] Fehler beim Neustart des Bots:', err);
      throw err;
    }
  } else {
    logger.error(
      '[STATUS] Bot kann nicht neu gestartet werden, da er nicht online ist.'
    );
    throw new Error('[STATUS] Bot ist bereits offline oder im Wartungsmodus');
  }
};

exports.setMaintenance = () => {
  if (botStatus !== 'maintenance') {
    botStatus = 'maintenance';
    try {
      fs.writeFileSync(
        statusFilePath,
        JSON.stringify({ status: botStatus }),
        'utf8'
      );
      logger.info('[STATUS] Bot in den Wartungsmodus versetzt.');
    } catch (err) {
      logger.error('[STATUS] Fehler beim Versetzen des Bots in den Wartungsmodus:', err);
      throw err;
    }
  } else {
    logger.error('[STATUS] Bot ist bereits im Wartungsmodus.');
    throw new Error('Bot ist bereits im Wartungsmodus');
  }
};

exports.removeMaintenance = () => {
  if (botStatus === 'maintenance') {
    botStatus = 'online';
    try {
      fs.writeFileSync(
        statusFilePath,
        JSON.stringify({ status: botStatus }),
        'utf8'
      );
      logger.info('[STATUS] Wartungsmodus entfernt. Bot ist jetzt online.');
    } catch (err) {
      logger.error('[STATUS] Fehler beim Entfernen des Wartungsmodus:', err);
      throw err;
    }
  } else {
    logger.error('[STATUS] Bot ist nicht im Wartungsmodus.');
    throw new Error('Bot ist nicht im Wartungsmodus');
  }
};
