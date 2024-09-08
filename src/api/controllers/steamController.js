const SteamService = require('../services/steamService');
const logger = require('../services/loggerService');

const steamService = new SteamService('your-steam-api-key');

// TODO: Function Controller

exports.getPlayerSummaries = async (req, res) => {
  const { steamId } = req.params;
  try {
    logger.info('Fetching player summaries for Steam ID:', { steamId });
    const playerSummary = await steamService.getPlayerSummaries(steamId);
    logger.info('Successfully fetched player summaries:', {
      steamId,
      playerSummary,
    });
    res.status(200).json(playerSummary);
  } catch (error) {
    logger.error('Failed to fetch player summaries:', { steamId, error });
    res.status(500).json({ error: 'Failed to fetch player summaries' });
  }
};

exports.getOwnedGames = async (req, res) => {
  const { steamId } = req.params;
  try {
    logger.info('Fetching owned games for Steam ID:', { steamId });
    const ownedGames = await steamService.getOwnedGames(steamId);
    logger.info('Successfully fetched owned games:', { steamId, ownedGames });
    res.status(200).json(ownedGames);
  } catch (error) {
    logger.error('Failed to fetch owned games:', { steamId, error });
    res.status(500).json({ error: 'Failed to fetch owned games' });
  }
};

exports.getPlayerAchievements = async (req, res) => {
  const { steamId, appId } = req.params;
  try {
    logger.info('Fetching achievements for Steam ID and App ID:', {
      steamId,
      appId,
    });
    const achievements = await steamService.getPlayerAchievements(steamId, appId);
    logger.info('Successfully fetched achievements:', {
      steamId,
      appId,
      achievements,
    });
    res.status(200).json(achievements);
  } catch (error) {
    logger.error('Failed to fetch achievements for app:', {
      steamId,
      appId,
      error,
    });
    res.status(500).json({ error: `Failed to fetch achievements for app ${appId}` });
  }
};

exports.getGameDetails = async (req, res) => {
  const { appId } = req.params;
  try {
    logger.info('Fetching details for app ID:', { appId });
    const gameDetails = await steamService.getGameDetails(appId);
    logger.info('Successfully fetched game details:', { appId, gameDetails });
    res.status(200).json(gameDetails);
  } catch (error) {
    logger.error('Failed to fetch game details for app:', { appId, error });
    res.status(500).json({ error: `Failed to fetch details for app ${appId}` });
  }
};
