const PlexService = require('../services/plexService');
const logger = require('../services/loggerService');

const plexService = new PlexService(
  'http://your-plex-server:32400',
  'your-plex-token'
);

// TODO: Function Controller

exports.getServerInfo = async (req, res) => {
  try {
    const serverInfo = await plexService.getServerInfo();
    logger.info('Fetched Plex server info successfully');
    res.json(serverInfo);
  } catch (error) {
    logger.error('Error fetching server info:', error);
    res.status(500).json({ error: 'Failed to fetch server info' });
  }
};

exports.getLibrarySections = async (req, res) => {
  try {
    const sections = await plexService.getLibrarySections();
    logger.info('Fetched Plex library sections successfully');
    res.json(sections);
  } catch (error) {
    logger.error('Error fetching library sections:', error);
    res.status(500).json({ error: 'Failed to fetch library sections' });
  }
};

exports.getSectionContent = async (req, res) => {
  const { sectionId } = req.params;
  try {
    const content = await plexService.getSectionContent(sectionId);
    logger.info(`Fetched content for section ID: ${sectionId} successfully`);
    res.json(content);
  } catch (error) {
    logger.error(`Error fetching content for section ID ${sectionId}:`, error);
    res
      .status(500)
      .json({ error: `Failed to fetch content for section ${sectionId}` });
  }
};

exports.playMedia = async (req, res) => {
  const { serverId, key } = req.params;
  try {
    const result = await plexService.playMedia(serverId, key);
    logger.info(`Started playing media with key ${key} on server ${serverId}`);
    res.json(result);
  } catch (error) {
    logger.error(
      `Error playing media with key ${key} on server ${serverId}:`,
      error
    );
    res
      .status(500)
      .json({
        error: `Failed to play media with key ${key} on server ${serverId}`,
      });
  }
};

exports.pauseMedia = async (req, res) => {
  const { serverId } = req.params;
  try {
    const result = await plexService.pauseMedia(serverId);
    logger.info(`Paused media on server ${serverId}`);
    res.json(result);
  } catch (error) {
    logger.error(`Error pausing media on server ${serverId}:`, error);
    res
      .status(500)
      .json({ error: `Failed to pause media on server ${serverId}` });
  }
};

exports.stopMedia = async (req, res) => {
  const { serverId } = req.params;
  try {
    const result = await plexService.stopMedia(serverId);
    logger.info(`Stopped media on server ${serverId}`);
    res.json(result);
  } catch (error) {
    logger.error(`Error stopping media on server ${serverId}:`, error);
    res
      .status(500)
      .json({ error: `Failed to stop media on server ${serverId}` });
  }
};
