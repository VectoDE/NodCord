const SteamService = require('../services/steamService');

const steamService = new SteamService('your-steam-api-key');

exports.getPlayerSummaries = async (req, res) => {
    const { steamId } = req.params;
    try {
        const playerSummary = await steamService.getPlayerSummaries(steamId);
        res.json(playerSummary);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch player summaries' });
    }
};

exports.getOwnedGames = async (req, res) => {
    const { steamId } = req.params;
    try {
        const ownedGames = await steamService.getOwnedGames(steamId);
        res.json(ownedGames);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch owned games' });
    }
};

exports.getPlayerAchievements = async (req, res) => {
    const { steamId, appId } = req.params;
    try {
        const achievements = await steamService.getPlayerAchievements(steamId, appId);
        res.json(achievements);
    } catch (error) {
        res.status(500).json({ error: `Failed to fetch achievements for app ${appId}` });
    }
};

exports.getGameDetails = async (req, res) => {
    const { appId } = req.params;
    try {
        const gameDetails = await steamService.getGameDetails(appId);
        res.json(gameDetails);
    } catch (error) {
        res.status(500).json({ error: `Failed to fetch details for app ${appId}` });
    }
};
