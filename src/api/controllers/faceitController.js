const FaceitService = require('../services/faceitService');

const faceitService = new FaceitService('your-faceit-api-key');

exports.getPlayerInfo = async (req, res) => {
    const { nickname } = req.params;
    try {
        const playerInfo = await faceitService.getPlayerInfo(nickname);
        res.json(playerInfo);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch player info' });
    }
};

exports.getPlayerStats = async (req, res) => {
    const { playerId, game } = req.params;
    try {
        const stats = await faceitService.getPlayerStats(playerId, game);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: `Failed to fetch stats for player ${playerId} in game ${game}` });
    }
};

exports.getPlayerMatches = async (req, res) => {
    const { playerId, game } = req.params;
    try {
        const matches = await faceitService.getPlayerMatches(playerId, game);
        res.json(matches);
    } catch (error) {
        res.status(500).json({ error: `Failed to fetch matches for player ${playerId} in game ${game}` });
    }
};

exports.getMatchDetails = async (req, res) => {
    const { matchId } = req.params;
    try {
        const matchDetails = await faceitService.getMatchDetails(matchId);
        res.json(matchDetails);
    } catch (error) {
        res.status(500).json({ error: `Failed to fetch match details for match ${matchId}` });
    }
};
