const TournamentService = require('../services/tournamentService');
const logger = require('../services/loggerService');
const tournamentService = new TournamentService();

exports.createTournament = async (req, res) => {
  try {
    const tournament = await tournamentService.createTournament(req.body);
    logger.info('Tournament created successfully:', {
      tournamentId: tournament._id,
    });
    res.status(201).json(tournament);
  } catch (error) {
    logger.error('Failed to create tournament:', error);
    res.status(500).json({ error: 'Failed to create tournament' });
  }
};

exports.registerTeam = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const team = await tournamentService.registerTeam(tournamentId, req.body);
    logger.info('Team registered successfully:', {
      tournamentId,
      teamId: team._id,
    });
    res.status(201).json(team);
  } catch (error) {
    logger.error('Failed to register team:', error);
    res.status(500).json({ error: 'Failed to register team' });
  }
};

exports.createMatch = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const match = await tournamentService.createMatch(tournamentId, req.body);
    logger.info('Match created successfully:', {
      tournamentId,
      matchId: match._id,
    });
    res.status(201).json(match);
  } catch (error) {
    logger.error('Failed to create match:', error);
    res.status(500).json({ error: 'Failed to create match' });
  }
};

exports.getTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const tournament = await tournamentService.getTournament(tournamentId);
    if (!tournament) {
      logger.warn('Tournament not found:', { tournamentId });
      return res.status(404).json({ error: 'Tournament not found' });
    }
    logger.info('Tournament fetched successfully:', { tournamentId });
    res.status(200).json(tournament);
  } catch (error) {
    logger.error('Failed to fetch tournament:', error);
    res.status(500).json({ error: 'Failed to fetch tournament' });
  }
};

exports.listTournaments = async (req, res) => {
  try {
    const tournaments = await tournamentService.listTournaments();
    logger.info('Fetched tournaments list:', { count: tournaments.length });
    res.status(200).json(tournaments);
  } catch (error) {
    logger.error('Failed to fetch tournaments:', error);
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
};

exports.updateTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const updatedTournament = await tournamentService.updateTournament(
      tournamentId,
      req.body
    );
    if (!updatedTournament) {
      logger.warn('Tournament not found for update:', { tournamentId });
      return res.status(404).json({ error: 'Tournament not found' });
    }
    logger.info('Tournament updated successfully:', { tournamentId });
    res.status(200).json(updatedTournament);
  } catch (error) {
    logger.error('Failed to update tournament:', error);
    res.status(500).json({ error: 'Failed to update tournament' });
  }
};

exports.deleteTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    await tournamentService.deleteTournament(tournamentId);
    logger.info('Tournament deleted successfully:', { tournamentId });
    res.status(204).json();
  } catch (error) {
    logger.error('Failed to delete tournament:', error);
    res.status(500).json({ error: 'Failed to delete tournament' });
  }
};
