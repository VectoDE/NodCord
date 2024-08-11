const CloudNetService = require('../services/cloudNetService');

const cloudNetService = new CloudNetService(
  'http://localhost:8080',
  'your-cloudnet-api-key'
);

exports.getStatus = async (req, res) => {
  try {
    const status = await cloudNetService.getCloudNetStatus();
    res.status(200).json(status);
  } catch (error) {
    console.error('Error fetching CloudNet status:', error);
    res.status(500).json({ error: 'Failed to fetch CloudNet status' });
  }
};

exports.createServer = async (req, res) => {
  try {
    const serverData = req.body;

    if (!serverData) {
      return res.status(400).json({ error: 'Server data is required' });
    }

    const server = await cloudNetService.createServer(serverData);
    res.status(201).json(server);
  } catch (error) {
    console.error('Error creating server:', error);
    res.status(500).json({ error: 'Failed to create server' });
  }
};

exports.stopServer = async (req, res) => {
  const { serverId } = req.params;

  if (!serverId) {
    return res.status(400).json({ error: 'Server ID is required' });
  }

  try {
    const result = await cloudNetService.stopServer(serverId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error stopping server:', error);
    res.status(500).json({ error: 'Failed to stop server' });
  }
};

exports.getServers = async (req, res) => {
  try {
    const servers = await cloudNetService.getServers();
    res.status(200).json(servers);
  } catch (error) {
    console.error('Error fetching servers:', error);
    res.status(500).json({ error: 'Failed to fetch servers' });
  }
};

exports.getServerDetails = async (req, res) => {
  const { serverId } = req.params;

  if (!serverId) {
    return res.status(400).json({ error: 'Server ID is required' });
  }

  try {
    const server = await cloudNetService.getServerDetails(serverId);
    res.status(200).json(server);
  } catch (error) {
    console.error('Error fetching server details:', error);
    res.status(500).json({ error: 'Failed to fetch server details' });
  }
};

exports.deleteServer = async (req, res) => {
  const { serverId } = req.params;

  if (!serverId) {
    return res.status(400).json({ error: 'Server ID is required' });
  }

  try {
    const result = await cloudNetService.deleteServer(serverId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error deleting server:', error);
    res.status(500).json({ error: 'Failed to delete server' });
  }
};
