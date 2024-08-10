const TournamentService = require('../services/tournamentService');
const tournamentService = new TournamentService();

exports.createTournament = async (req, res) => {
  try {
    const tournament = await tournamentService.createTournament(req.body);
    res.status(201).json(tournament);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create tournament' });
  }
};

exports.registerTeam = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const team = await tournamentService.registerTeam(tournamentId, req.body);
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ error: 'Failed to register team' });
  }
};

exports.createMatch = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const match = await tournamentService.createMatch(tournamentId, req.body);
    res.status(201).json(match);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create match' });
  }
};

exports.getTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const tournament = await tournamentService.getTournament(tournamentId);
    res.status(200).json(tournament);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tournament' });
  }
};

exports.listTournaments = async (req, res) => {
  try {
    const tournaments = await tournamentService.listTournaments();
    res.status(200).json(tournaments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
};

exports.updateTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const updatedTournament = await tournamentService.updateTournament(tournamentId, req.body);
    res.status(200).json(updatedTournament);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update tournament' });
  }
};

exports.deleteTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    await tournamentService.deleteTournament(tournamentId);
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete tournament' });
  }
};
