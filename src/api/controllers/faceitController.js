const FaceitService = require('../services/faceitService');

const faceitService = new FaceitService('your-faceit-api-key');

// TODO: Function Controller

exports.getPlayerInfo = async (req, res) => {
  const { nickname } = req.params;

  if (!nickname) {
    return res.status(400).json({
      success: false,
      message: 'Nickname is required',
    });
  }

  try {
    const playerInfo = await faceitService.getPlayerInfo(nickname);
    res.status(200).json({
      success: true,
      data: playerInfo,
    });
  } catch (error) {
    console.error('Error fetching player info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch player info',
    });
  }
};

exports.getPlayerStats = async (req, res) => {
  const { playerId, game } = req.params;

  if (!playerId || !game) {
    return res.status(400).json({
      success: false,
      message: 'Player ID and game are required',
    });
  }

  try {
    const stats = await faceitService.getPlayerStats(playerId, game);
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error(
      `Error fetching stats for player ${playerId} in game ${game}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: `Failed to fetch stats for player ${playerId} in game ${game}`,
    });
  }
};

exports.getPlayerMatches = async (req, res) => {
  const { playerId, game } = req.params;

  if (!playerId || !game) {
    return res.status(400).json({
      success: false,
      message: 'Player ID and game are required',
    });
  }

  try {
    const matches = await faceitService.getPlayerMatches(playerId, game);
    res.status(200).json({
      success: true,
      data: matches,
    });
  } catch (error) {
    console.error(
      `Error fetching matches for player ${playerId} in game ${game}:`,
      error
    );
    res.status(500).json({
      success: false,
      message: `Failed to fetch matches for player ${playerId} in game ${game}`,
    });
  }
};

exports.getMatchDetails = async (req, res) => {
  const { matchId } = req.params;

  if (!matchId) {
    return res.status(400).json({
      success: false,
      message: 'Match ID is required',
    });
  }

  try {
    const matchDetails = await faceitService.getMatchDetails(matchId);
    res.status(200).json({
      success: true,
      data: matchDetails,
    });
  } catch (error) {
    console.error(`Error fetching match details for match ${matchId}:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to fetch match details for match ${matchId}`,
    });
  }
};
