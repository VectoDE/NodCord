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
    logger.info(`Bot-Status beim Starten geladen: ${botStatus}`);
  } catch (err) {
    logger.error('Fehler beim Lesen der Statusdatei:', err);
  }
} else {
  botStatus = 'offline';
  try {
    fs.writeFileSync(
      statusFilePath,
      JSON.stringify({ status: botStatus }),
      'utf8'
    );
    logger.info('Statusdatei erstellt und auf offline gesetzt.');
  } catch (err) {
    logger.error('Fehler beim Erstellen der Statusdatei:', err);
  }
}

exports.setStatus = (status) => {
  if (['online', 'offline', 'maintenance'].includes(status)) {
    botStatus = status;
    try {
      fs.writeFileSync(statusFilePath, JSON.stringify({ status }), 'utf8');
      logger.info(`Bot-Status auf ${status} gesetzt.`);
    } catch (err) {
      logger.error('Fehler beim Setzen des Bot-Status:', err);
      throw err;
    }
  } else {
    logger.error('Ungültiger Status beim Setzen des Bot-Status:', status);
    throw new Error('Ungültiger Status');
  }
};

exports.getStatus = () => {
  logger.info(`Aktueller Bot-Status: ${botStatus}`);
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
      logger.info('Bot erfolgreich gestartet.');
    } catch (err) {
      logger.error('Fehler beim Starten des Bots:', err);
      throw err;
    }
  } else {
    logger.error(
      'Bot kann nicht gestartet werden, da er bereits online oder im Wartungsmodus ist.'
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
      logger.info('Bot erfolgreich gestoppt.');
    } catch (err) {
      logger.error('Fehler beim Stoppen des Bots:', err);
      throw err;
    }
  } else {
    logger.error(
      'Bot kann nicht gestoppt werden, da er bereits offline oder im Wartungsmodus ist.'
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
      logger.info('Bot wird neu gestartet...');
      setTimeout(() => {
        botStatus = 'online';
        try {
          fs.writeFileSync(
            statusFilePath,
            JSON.stringify({ status: botStatus }),
            'utf8'
          );
          logger.info('Bot erfolgreich neu gestartet.');
        } catch (err) {
          logger.error('Fehler beim Neu-Starten des Bots:', err);
          throw err;
        }
      }, 5000);
    } catch (err) {
      logger.error('Fehler beim Neustart des Bots:', err);
      throw err;
    }
  } else {
    logger.error(
      'Bot kann nicht neu gestartet werden, da er nicht online ist.'
    );
    throw new Error('Bot ist bereits offline oder im Wartungsmodus');
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
      logger.info('Bot in den Wartungsmodus versetzt.');
    } catch (err) {
      logger.error('Fehler beim Versetzen des Bots in den Wartungsmodus:', err);
      throw err;
    }
  } else {
    logger.error('Bot ist bereits im Wartungsmodus.');
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
      logger.info('Wartungsmodus entfernt. Bot ist jetzt online.');
    } catch (err) {
      logger.error('Fehler beim Entfernen des Wartungsmodus:', err);
      throw err;
    }
  } else {
    logger.error('Bot ist nicht im Wartungsmodus.');
    throw new Error('Bot ist nicht im Wartungsmodus');
  }
};
