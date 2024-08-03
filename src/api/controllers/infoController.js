const os = require('os');
const checkDiskSpace = require('check-disk-space').default;

const getSystemInfo = async (req, res) => {
  try {
    const cpuInfo = os.cpus();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const uptime = os.uptime();
    const platform = os.platform();
    const arch = os.arch();

    const disk = await checkDiskSpace('/');

    const systemInfo = {
      cpu: cpuInfo.map(cpu => ({
        model: cpu.model,
        speed: cpu.speed,
        times: cpu.times
      })),
      memory: {
        total: totalMemory,
        free: freeMemory,
        used: totalMemory - freeMemory
      },
      disk: {
        total: disk.size,
        free: disk.free,
        available: disk.free
      },
      uptime: uptime,
      platform: platform,
      architecture: arch
    };

    res.status(200).json(systemInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getSystemInfo
};
