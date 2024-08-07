const os = require('os');
const { getServers } = require('../../bot/index');
const apiStatusService = require('../services/apiStatusService');
const botStatusService = require('../services/botStatusService');
const logger = require('./loggerService');

async function getSystemInfo() {
  const cpuCores = os.cpus().length;
  const cpuLoad = os.loadavg();
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;

  const diskInfo = [];

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
}

async function getBotInfo() {
  try {
    const servers = await getServers();
    return {
      guildsCount: servers.length,
    };
  } catch (error) {
    logger.error('Error fetching server info:', error);
    return { guildsCount: 'N/A' };
  }
}

async function getApiStatus() {
  try {
    return {
      apiStatus: apiStatusService.getStatus(),
    };
  } catch (error) {
    logger.error('Error fetching API status:', error);
    return { apiStatus: 'N/A' };
  }
}

async function getBotStatus() {
  try {
    return {
      botStatus: botStatusService.getStatus(),
    };
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
