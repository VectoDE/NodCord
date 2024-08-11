const EslService = require('../services/eslService');

const eslService = new EslService('your-esl-api-key');

exports.getTournaments = async (req, res) => {
  try {
    const tournaments = await eslService.getTournaments();
    res.status(200).json({
      success: true,
      data: tournaments,
    });
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tournaments',
    });
  }
};

exports.getTournamentDetails = async (req, res) => {
  const { tournamentId } = req.params;

  if (!tournamentId) {
    return res.status(400).json({
      success: false,
      message: 'Tournament ID is required',
    });
  }

  try {
    const tournamentDetails = await eslService.getTournamentDetails(
      tournamentId
    );
    res.status(200).json({
      success: true,
      data: tournamentDetails,
    });
  } catch (error) {
    console.error(
      `Error fetching details for tournament ${tournamentId}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tournament details',
    });
  }
};

exports.getTeamDetails = async (req, res) => {
  const { teamId } = req.params;

  if (!teamId) {
    return res.status(400).json({
      success: false,
      message: 'Team ID is required',
    });
  }

  try {
    const teamDetails = await eslService.getTeamDetails(teamId);
    res.status(200).json({
      success: true,
      data: teamDetails,
    });
  } catch (error) {
    console.error(`Error fetching details for team ${teamId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team details',
    });
  }
};

exports.getPlayerDetails = async (req, res) => {
  const { playerId } = req.params;

  if (!playerId) {
    return res.status(400).json({
      success: false,
      message: 'Player ID is required',
    });
  }

  try {
    const playerDetails = await eslService.getPlayerDetails(playerId);
    res.status(200).json({
      success: true,
      data: playerDetails,
    });
  } catch (error) {
    console.error(`Error fetching details for player ${playerId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch player details',
    });
  }
};
