const CloudNetService = require('../services/cloudNetService');

const cloudNetService = new CloudNetService('http://localhost:8080', 'your-cloudnet-api-key');

exports.getStatus = async (req, res) => {
    try {
        const status = await cloudNetService.getCloudNetStatus();
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch CloudNet status' });
    }
};

exports.createServer = async (req, res) => {
    try {
        const serverData = req.body;
        const server = await cloudNetService.createServer(serverData);
        res.json(server);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create server' });
    }
};

exports.stopServer = async (req, res) => {
    const { serverId } = req.params;
    try {
        const result = await cloudNetService.stopServer(serverId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to stop server' });
    }
};

exports.getServers = async (req, res) => {
    try {
        const servers = await cloudNetService.getServers();
        res.json(servers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch servers' });
    }
};

exports.getServerDetails = async (req, res) => {
    const { serverId } = req.params;
    try {
        const server = await cloudNetService.getServerDetails(serverId);
        res.json(server);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch server details' });
    }
};

exports.deleteServer = async (req, res) => {
    const { serverId } = req.params;
    try {
        const result = await cloudNetService.deleteServer(serverId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete server' });
    }
};
