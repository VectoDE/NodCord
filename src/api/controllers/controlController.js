const botStatusService = require('../services/botStatusService');
const apiStatusService = require('../services/apiStatusService');
const logger = require('../services/loggerService');

exports.startBot = (req, res) => {
  try {
    botStatusService.startBot();
    res.status(200).json({ message: 'Bot successfully started' });
  } catch (error) {
    logger.error('Error starting the bot:', error);
    res.status(500).json({ error: 'Failed to start the bot' });
  }
};

exports.stopBot = (req, res) => {
  try {
    botStatusService.stopBot();
    res.status(200).json({ message: 'Bot successfully stopped' });
  } catch (error) {
    logger.error('Error stopping the bot:', error);
    res.status(500).json({ error: 'Failed to stop the bot' });
  }
};

exports.restartBot = (req, res) => {
  try {
    botStatusService.restartBot();
    res.status(200).json({ message: 'Bot successfully restarted' });
  } catch (error) {
    logger.error('Error restarting the bot:', error);
    res.status(500).json({ error: 'Failed to restart the bot' });
  }
};

exports.setBotMaintenance = (req, res) => {
  try {
    botStatusService.setMaintenance();
    res.status(200).json({ message: 'Bot maintenance mode enabled' });
  } catch (error) {
    logger.error('Error setting bot maintenance mode:', error);
    res.status(500).json({ error: 'Failed to set bot maintenance mode' });
  }
};

exports.removeBotMaintenance = (req, res) => {
  try {
    botStatusService.removeMaintenance();
    res.status(200).json({ message: 'Bot maintenance mode disabled' });
  } catch (error) {
    logger.error('Error removing bot maintenance mode:', error);
    res.status(500).json({ error: 'Failed to remove bot maintenance mode' });
  }
};

exports.startApi = (req, res) => {
  try {
    apiStatusService.startApi();
    res.status(200).json({ message: 'API successfully started' });
  } catch (error) {
    logger.error('Error starting the API:', error);
    res.status(500).json({ error: 'Failed to start the API' });
  }
};

exports.stopApi = (req, res) => {
  try {
    apiStatusService.stopApi();
    res.status(200).json({ message: 'API successfully stopped' });
  } catch (error) {
    logger.error('Error stopping the API:', error);
    res.status(500).json({ error: 'Failed to stop the API' });
  }
};

exports.restartApi = (req, res) => {
  try {
    apiStatusService.restartApi();
    res.status(200).json({ message: 'API restarting' });
  } catch (error) {
    logger.error('Error restarting the API:', error);
    res.status(500).json({ error: 'Failed to restart the API' });
  }
};

exports.setAPIMaintenance = (req, res) => {
  try {
    apiStatusService.setMaintenance();
    res.status(200).json({ message: 'API maintenance mode enabled' });
  } catch (error) {
    logger.error('Error setting API maintenance mode:', error);
    res.status(500).json({ error: 'Failed to set API maintenance mode' });
  }
};

exports.removeAPIMaintenance = (req, res) => {
  try {
    apiStatusService.removeMaintenance();
    res.status(200).json({ message: 'API maintenance mode disabled' });
  } catch (error) {
    logger.error('Error removing API maintenance mode:', error);
    res.status(500).json({ error: 'Failed to remove API maintenance mode' });
  }
};
