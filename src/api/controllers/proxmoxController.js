const ProxmoxService = require('../services/proxmoxService');
const logger = require('../services/loggerService');

const proxmoxService = new ProxmoxService(
  'https://your-proxmox-url:8006', // Base URL der Proxmox-API
  'your-username', // Proxmox-Benutzername
  'your-password', // Proxmox-Passwort
  'pam' // Realm, z.B. pam oder pve
);

// TODO: Function Controller

exports.getNodes = async (req, res) => {
  try {
    const nodes = await proxmoxService.getNodes();
    logger.info('Fetched Proxmox nodes successfully');
    res.status(200).json(nodes);
  } catch (error) {
    logger.error('Failed to fetch Proxmox nodes:', error);
    res.status(500).json({ error: 'Failed to fetch nodes' });
  }
};

exports.getNodeStatus = async (req, res) => {
  const { node } = req.params;
  try {
    const status = await proxmoxService.getNodeStatus(node);
    logger.info(`Fetched status for Proxmox node: ${node}`);
    res.status(200).json(status);
  } catch (error) {
    logger.error(`Failed to fetch status for node ${node}:`, error);
    res.status(500).json({ error: `Failed to fetch status for node ${node}` });
  }
};

exports.startVM = async (req, res) => {
  const { node, vmid } = req.params;
  try {
    const result = await proxmoxService.startVM(node, vmid);
    logger.info(`Started VM ${vmid} on node ${node}`);
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Failed to start VM ${vmid} on node ${node}:`, error);
    res
      .status(500)
      .json({ error: `Failed to start VM ${vmid} on node ${node}` });
  }
};

exports.stopVM = async (req, res) => {
  const { node, vmid } = req.params;
  try {
    const result = await proxmoxService.stopVM(node, vmid);
    logger.info(`Stopped VM ${vmid} on node ${node}`);
    res.status(200).json(result);
  } catch (error) {
    logger.error(`Failed to stop VM ${vmid} on node ${node}:`, error);
    res
      .status(500)
      .json({ error: `Failed to stop VM ${vmid} on node ${node}` });
  }
};
