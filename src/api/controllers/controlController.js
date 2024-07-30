const { exec } = require('child_process');
const logger = require('../services/loggerService');

// Funktion zum Starten des Bots
const startBot = (req, res) => {
    exec('node path/to/bot.js', (error, stdout, stderr) => {
        if (error) {
            logger.logError(`Fehler beim Starten des Bots: ${error.message}`);
            return res.status(500).json({ message: 'Fehler beim Starten des Bots', error: error.message });
        }
        logger.logInfo(`Bot gestartet:\n${stdout}`);
        res.status(200).json({ message: 'Bot gestartet', output: stdout });
    });
};

// Funktion zum Stoppen des Bots
const stopBot = (req, res) => {
    exec('pkill -f bot.js', (error, stdout, stderr) => {
        if (error) {
            logger.logError(`Fehler beim Stoppen des Bots: ${error.message}`);
            return res.status(500).json({ message: 'Fehler beim Stoppen des Bots', error: error.message });
        }
        logger.logInfo(`Bot gestoppt:\n${stdout}`);
        res.status(200).json({ message: 'Bot gestoppt', output: stdout });
    });
};

// Funktion zum Neustarten des Bots
const restartBot = (req, res) => {
    stopBot(req, res, () => {
        startBot(req, res);
    });
};

// Exportiere die Controller-Funktionen
module.exports = {
    startBot,
    stopBot,
    restartBot
};
