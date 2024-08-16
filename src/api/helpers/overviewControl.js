const botStatusService = require('../services/botStatusService');
const apiStatusService = require('../services/apiStatusService');
const logger = require('../services/loggerService');

exports.getOverview = async (req, res) => {
  try {
    res.render('dashboard/controls/overviewControls');
  } catch (error) {
    logger.error('Error rendering overview controls:', error);
    res.status(500).send('Internal Server Error');
  }
};

exports.getBotStatus = async (req, res) => {
  try {
    const status = await botStatusService.getStatus();
    res.status(200).json({ status });
  } catch (error) {
    logger.error('Error fetching bot status:', error);
    res.status(500).json({ error: 'Failed to fetch bot status' });
  }
};

exports.getApiStatus = async (req, res) => {
  try {
    const status = await apiStatusService.getStatus();
    res.status(200).json({ status });
  } catch (error) {
    logger.error('Error fetching API status:', error);
    res.status(500).json({ error: 'Failed to fetch API status' });
  }
};

exports.controlBot = async (req, res) => {
  const action = req.params.action;
  try {
    switch (action) {
      case 'start':
        await botStatusService.startBot();
        break;
      case 'stop':
        await botStatusService.stopBot();
        break;
      case 'restart':
        await botStatusService.restartBot();
        break;
      case 'setMaintenance':
        await botStatusService.setMaintenance();
        break;
      case 'removeMaintenance':
        await botStatusService.removeMaintenance();
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
    res.status(200).json({ message: `Bot ${action}ed successfully` });
  } catch (error) {
    logger.error(`Error performing action ${action} on bot:`, error);
    res.status(500).json({ error: `Failed to ${action} bot` });
  }
};

exports.controlApi = async (req, res) => {
  const action = req.params.action;
  try {
    switch (action) {
      case 'start':
        await apiStatusService.startApi();
        break;
      case 'stop':
        await apiStatusService.stopApi();
        break;
      case 'restart':
        await apiStatusService.restartApi();
        break;
      case 'setMaintenance':
        await apiStatusService.setMaintenance();
        break;
      case 'removeMaintenance':
        await apiStatusService.removeMaintenance();
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
    res.status(200).json({ message: `API ${action}ed successfully` });
  } catch (error) {
    logger.error(`Error performing action ${action} on API:`, error);
    res.status(500).json({ error: `Failed to ${action} API` });
  }
};
