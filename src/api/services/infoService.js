const os = require('os');
const { getServers } = require('../../bot/index');
const apiStatusService = require('./apiStatusService');
const botStatusService = require('./botStatusService');
const logger = require('./loggerService');

async function getSystemInfo() {
  try {
    logger.info('Fetching system information...');
    const cpuCores = os.cpus().length;
    const cpuLoad = os.loadavg();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    const diskInfo = [];

    logger.info('Successfully fetched system information.');
    return {
      cpuCores,
      cpuLoad: cpuLoad[0],
      totalMemory,
      freeMemory,
      usedMemory,
      disk: diskInfo,
      systemName: os.hostname(),
      systemManufacturer: 'N/A',
    };
  } catch (error) {
    logger.error('Error fetching system information:', error);
    throw error; // Optional: Re-throw the error if needed
  }
}

async function getBotInfo() {
  try {
    logger.info('Fetching bot information...');
    const servers = await getServers();
    const botInfo = {
      guildsCount: servers.length,
    };
    logger.info('Successfully fetched bot information.');
    return botInfo;
  } catch (error) {
    logger.error('Error fetching bot information:', error);
    return { guildsCount: 'N/A' };
  }
}

async function getApiStatus() {
  try {
    logger.info('Fetching API status...');
    const apiStatus = await apiStatusService.getStatus();
    logger.info('Successfully fetched API status.');
    return { apiStatus };
  } catch (error) {
    logger.error('Error fetching API status:', error);
    return { apiStatus: 'N/A' };
  }
}

async function getBotStatus() {
  try {
    logger.info('Fetching bot status...');
    const botStatus = await botStatusService.getStatus();
    logger.info('Successfully fetched bot status.');
    return { botStatus };
  } catch (error) {
    logger.error('Error fetching bot status:', error);
    return { botStatus: 'N/A' };
  }
}

module.exports = {
  getSystemInfo,
  getBotInfo,
  getApiStatus,
  getBotStatus,
};
