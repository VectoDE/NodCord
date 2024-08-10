const EslService = require('../services/eslService');

const eslService = new EslService('your-esl-api-key');

exports.getTournaments = async (req, res) => {
    try {
        const tournaments = await eslService.getTournaments();
        res.json(tournaments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tournaments' });
    }
};

exports.getTournamentDetails = async (req, res) => {
    const { tournamentId } = req.params;
    try {
        const tournamentDetails = await eslService.getTournamentDetails(tournamentId);
        res.json(tournamentDetails);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tournament details' });
    }
};

exports.getTeamDetails = async (req, res) => {
    const { teamId } = req.params;
    try {
        const teamDetails = await eslService.getTeamDetails(teamId);
        res.json(teamDetails);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch team details' });
    }
};

exports.getPlayerDetails = async (req, res) => {
    const { playerId } = req.params;
    try {
        const playerDetails = await eslService.getPlayerDetails(playerId);
        res.json(playerDetails);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch player details' });
    }
};
