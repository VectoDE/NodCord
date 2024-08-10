const PlexService = require('../services/plexService');

const plexService = new PlexService(
    'http://your-plex-server:32400', // Base URL deines Plex-Servers
    'your-plex-token' // Dein Plex-Token
);

exports.getServerInfo = async (req, res) => {
    try {
        const serverInfo = await plexService.getServerInfo();
        res.json(serverInfo);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch server info' });
    }
};

exports.getLibrarySections = async (req, res) => {
    try {
        const sections = await plexService.getLibrarySections();
        res.json(sections);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch library sections' });
    }
};

exports.getSectionContent = async (req, res) => {
    const { sectionId } = req.params;
    try {
        const content = await plexService.getSectionContent(sectionId);
        res.json(content);
    } catch (error) {
        res.status(500).json({ error: `Failed to fetch content for section ${sectionId}` });
    }
};

exports.playMedia = async (req, res) => {
    const { serverId, key } = req.params;
    try {
        const result = await plexService.playMedia(serverId, key);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: `Failed to play media with key ${key} on server ${serverId}` });
    }
};

exports.pauseMedia = async (req, res) => {
    const { serverId } = req.params;
    try {
        const result = await plexService.pauseMedia(serverId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: `Failed to pause media on server ${serverId}` });
    }
};

exports.stopMedia = async (req, res) => {
    const { serverId } = req.params;
    try {
        const result = await plexService.stopMedia(serverId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: `Failed to stop media on server ${serverId}` });
    }
};
