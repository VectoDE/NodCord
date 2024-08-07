const botStatusService = require('../services/botStatusService');
const apiStatusService = require('../services/apiStatusService');
const logger = require('../services/loggerService');

exports.startBot = (req, res) => {
  try {
    botStatusService.startBot();
    res.redirect('/dashboard');
  } catch (error) {
    logger.error('Fehler beim Starten des Bots:', error);
    res.status(500).send('Fehler beim Starten des Bots');
  }
};

exports.stopBot = (req, res) => {
  try {
    botStatusService.stopBot();
    res.redirect('/dashboard');
  } catch (error) {
    logger.error('Fehler beim Stoppen des Bots:', error);
    res.status(500).send('Fehler beim Stoppen des Bots');
  }
};

exports.restartBot = (req, res) => {
  try {
    botStatusService.restartBot();
    res.redirect('/dashboard');
  } catch (error) {
    logger.error('Fehler beim Neustarten des Bots:', error);
    res.status(500).send('Fehler beim Neustarten des Bots');
  }
};

exports.setBotMaintenance = (req, res) => {
  try {
    botStatusService.setMaintenance();
    res.redirect('/dashboard');
  } catch (error) {
    logger.error('Fehler beim Setzen des Wartungsmodus:', error);
    res.status(500).send('Fehler beim Setzen des Wartungsmodus');
  }
};

exports.removeBotMaintenance = (req, res) => {
  try {
    botStatusService.removeMaintenance();
    res.redirect('/dashboard');
  } catch (error) {
    logger.error('Fehler beim Entfernen des Wartungsmodus:', error);
    res.status(500).send('Fehler beim Entfernen des Wartungsmodus');
  }
};

exports.startApi = (req, res) => {
  try {
    apiStatusService.startApi();
    res.status(200).json({ message: 'API erfolgreich gestartet' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.stopApi = (req, res) => {
  try {
    apiStatusService.stopApi();
    res.status(200).json({ message: 'API erfolgreich gestoppt' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.restartApi = (req, res) => {
  try {
    apiStatusService.restartApi();
    res.status(200).json({ message: 'API wird neu gestartet' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.setAPIMaintenance = (req, res) => {
  try {
    apiStatusService.setMaintenance();
    res.status(200).json({ message: 'Wartungsmodus aktiviert' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.removeAPIMaintenance = (req, res) => {
  try {
    apiStatusService.removeMaintenance();
    res.status(200).json({ message: 'Wartungsmodus deaktiviert' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
