require('dotenv').config();
const getBaseUrl = require('../helpers/getBaseUrlHelper');
const sendResponse = require('../helpers/sendResponseHelper');
const logger = require('../services/loggerService');
const TournamentService = require('../services/tournamentService');
const tournamentService = new TournamentService();

exports.createTournament = async (req, res) => {
  try {
    const tournament = await tournamentService.createTournament(req.body);
    logger.info('Tournament created successfully:', { tournamentId: tournament._id });
    const redirectUrl = `${getBaseUrl()}/dashboard/tournaments`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Tournament created successfully',
      tournament
    });
  } catch (error) {
    logger.error('Failed to create tournament:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/tournaments/create`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Failed to create tournament',
      error: error.message
    });
  }
};

exports.registerTeam = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const team = await tournamentService.registerTeam(tournamentId, req.body);
    logger.info('Team registered successfully:', { tournamentId, teamId: team._id });
    const redirectUrl = `${getBaseUrl()}/dashboard/tournaments/${tournamentId}/teams`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Team registered successfully',
      team
    });
  } catch (error) {
    logger.error('Failed to register team:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/tournaments/${tournamentId}/teams/register`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Failed to register team',
      error: error.message
    });
  }
};

exports.createMatch = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const match = await tournamentService.createMatch(tournamentId, req.body);
    logger.info('Match created successfully:', { tournamentId, matchId: match._id });
    const redirectUrl = `${getBaseUrl()}/dashboard/tournaments/${tournamentId}/matches`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Match created successfully',
      match
    });
  } catch (error) {
    logger.error('Failed to create match:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/tournaments/${tournamentId}/matches/create`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Failed to create match',
      error: error.message
    });
  }
};

exports.getTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const tournament = await tournamentService.getTournament(tournamentId);
    if (!tournament) {
      logger.warn('Tournament not found:', { tournamentId });
      const redirectUrl = `${getBaseUrl()}/dashboard/tournaments`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Tournament not found'
      });
    }
    logger.info('Tournament fetched successfully:', { tournamentId });
    const redirectUrl = `${getBaseUrl()}/dashboard/tournaments/${tournamentId}`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      tournament
    });
  } catch (error) {
    logger.error('Failed to fetch tournament:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/tournaments`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Failed to fetch tournament',
      error: error.message
    });
  }
};

exports.listTournaments = async (req, res) => {
  try {
    const tournaments = await tournamentService.listTournaments();
    logger.info('Fetched tournaments list:', { count: tournaments.length });
    const redirectUrl = `${getBaseUrl()}/dashboard/tournaments`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      tournaments
    });
  } catch (error) {
    logger.error('Failed to fetch tournaments:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/tournaments`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Failed to fetch tournaments',
      error: error.message
    });
  }
};

exports.updateTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const updatedTournament = await tournamentService.updateTournament(tournamentId, req.body);
    if (!updatedTournament) {
      logger.warn('Tournament not found for update:', { tournamentId });
      const redirectUrl = `${getBaseUrl()}/dashboard/tournaments`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Tournament not found'
      });
    }
    logger.info('Tournament updated successfully:', { tournamentId });
    const redirectUrl = `${getBaseUrl()}/dashboard/tournaments/${tournamentId}`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Tournament updated successfully',
      updatedTournament
    });
  } catch (error) {
    logger.error('Failed to update tournament:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/tournaments/${tournamentId}/edit`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Failed to update tournament',
      error: error.message
    });
  }
};

exports.deleteTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    await tournamentService.deleteTournament(tournamentId);
    logger.info('Tournament deleted successfully:', { tournamentId });
    const redirectUrl = `${getBaseUrl()}/dashboard/tournaments`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Tournament deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete tournament:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/tournaments`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Failed to delete tournament',
      error: error.message
    });
  }
};
