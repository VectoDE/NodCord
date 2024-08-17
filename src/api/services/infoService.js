const os = require('os');
const { execSync } = require('child_process');
const { getServers, getBots, bot } = require('../../bot/index');
const apiStatusService = require('./apiStatusService');
const botStatusService = require('./botStatusService');
const logger = require('./loggerService');

async function getDiskInfo() {
  try {
    logger.info('Fetching disk information...');
    let diskInfo = [];

    if (os.platform() === 'linux' || os.platform() === 'darwin') {
      const dfOutput = execSync('df -k --output=source,size,used,avail').toString().split('\n');
      dfOutput.shift();
      diskInfo = dfOutput.filter(line => line.trim() !== '').map(line => {
        const [device, size, used, available] = line.split(/\s+/);
        return {
          device: device,
          size: parseInt(size, 10) * 1024,
          used: parseInt(used, 10) * 1024,
          available: parseInt(available, 10) * 1024,
        };
      });
    } else if (os.platform() === 'win32') {
      const wmicOutput = execSync('wmic logicaldisk get size,freespace,caption').toString().split('\n');
      wmicOutput.shift();
      diskInfo = wmicOutput.filter(line => line.trim() !== '').map(line => {
        const [device, freeSpace, size] = line.trim().split(/\s+/);
        return {
          device: device,
          size: parseInt(size, 10),
          used: parseInt(size, 10) - parseInt(freeSpace, 10),
          available: parseInt(freeSpace, 10),
        };
      });
    }

    logger.info('Successfully fetched disk information.');
    return diskInfo;
  } catch (error) {
    logger.error('Error fetching disk information:', error);
    return [];
  }
}

async function getSystemInfo() {
  try {
    logger.info('Fetching system information...');
    const cpuCores = os.cpus().length;
    const cpuLoad = os.loadavg();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const diskInfo = await getDiskInfo();

    let systemManufacturer = 'N/A';
    if (os.platform() === 'win32') {
      try {
        systemManufacturer = execSync('wmic computersystem get manufacturer').toString().split('\n')[1].trim();
      } catch (error) {
        logger.error('Error fetching system manufacturer on Windows:', error);
      }
    } else if (os.platform() === 'linux') {
      try {
        systemManufacturer = execSync('cat /sys/class/dmi/id/board_vendor').toString().trim();
      } catch (error) {
        logger.error('Error fetching system manufacturer on Linux:', error);
      }
    }

    logger.info('Successfully fetched system information.');
    return {
      cpuCores,
      cpuLoad: cpuLoad[0],
      totalMemory,
      freeMemory,
      usedMemory,
      disk: diskInfo,
      systemName: os.hostname(),
      systemManufacturer,
    };
  } catch (error) {
    logger.error('Error fetching system information:', error);
    throw error;
  }
}

async function getBotInfo() {
  try {
    logger.info('Fetching bot information...');
    const servers = await getServers();
    const bots = await getBots();

    const botInfo = {
      name: bots.length > 0 ? bots[0].username : 'N/A',
      username: bots.length > 0 ? bots[0].username : 'N/A',
      token: bots.length > 0 ? bots[0].token : 'N/A',
      guildsCount: servers.length,
      bots,
    };

    logger.info('Successfully fetched bot information.');
    return botInfo;
  } catch (error) {
    logger.error('Error fetching bot information:', error);
    return {
      name: 'N/A',
      username: 'N/A',
      token: 'N/A',
      guildsCount: 'N/A',
    };
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
