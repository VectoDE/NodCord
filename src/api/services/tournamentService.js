const Tournament = require('../../models/tournamentModel');
const Team = require('../../models/teamModel');
const Match = require('../../models/matchModel');
const logger = require('./loggerService');

class TournamentService {
  async createTournament(data) {
    try {
      logger.info('Creating a new tournament', { data });
      const tournament = new Tournament(data);
      await tournament.save();
      logger.info('Tournament created successfully', { tournament });
      return tournament;
    } catch (error) {
      logger.error('Error creating tournament', { error });
      throw error;
    }
  }

  async registerTeam(tournamentId, teamData) {
    try {
      logger.info('Registering a team', { tournamentId, teamData });
      const team = new Team(teamData);
      const tournament = await Tournament.findById(tournamentId);

      if (!tournament) {
        logger.warn('Tournament not found', { tournamentId });
        throw new Error('Tournament not found');
      }

      tournament.teams.push(team);
      await team.save();
      await tournament.save();
      logger.info('Team registered successfully', { team });
      return team;
    } catch (error) {
      logger.error('Error registering team', { tournamentId, teamData, error });
      throw error;
    }
  }

  async createMatch(tournamentId, matchData) {
    try {
      logger.info('Creating a match', { tournamentId, matchData });
      const tournament = await Tournament.findById(tournamentId);

      if (!tournament) {
        logger.warn('Tournament not found', { tournamentId });
        throw new Error('Tournament not found');
      }

      const match = new Match(matchData);
      tournament.matches.push(match);
      await match.save();
      await tournament.save();
      logger.info('Match created successfully', { match });
      return match;
    } catch (error) {
      logger.error('Error creating match', { tournamentId, matchData, error });
      throw error;
    }
  }

  async getTournament(tournamentId) {
    try {
      logger.info('Fetching tournament details', { tournamentId });
      const tournament = await Tournament.findById(tournamentId)
        .populate('teams')
        .populate('matches');
      if (!tournament) {
        logger.warn('Tournament not found', { tournamentId });
        return null;
      }
      logger.info('Tournament fetched successfully', { tournament });
      return tournament;
    } catch (error) {
      logger.error('Error fetching tournament', { tournamentId, error });
      throw error;
    }
  }

  async listTournaments() {
    try {
      logger.info('Listing all tournaments');
      const tournaments = await Tournament.find()
        .populate('teams')
        .populate('matches');
      logger.info('Tournaments listed successfully', { tournaments });
      return tournaments;
    } catch (error) {
      logger.error('Error listing tournaments', { error });
      throw error;
    }
  }

  async updateTournament(tournamentId, updateData) {
    try {
      logger.info('Updating tournament', { tournamentId, updateData });
      const tournament = await Tournament.findByIdAndUpdate(
        tournamentId,
        updateData,
        { new: true }
      );
      if (!tournament) {
        logger.warn('Tournament not found', { tournamentId });
        return null;
      }
      logger.info('Tournament updated successfully', { tournament });
      return tournament;
    } catch (error) {
      logger.error('Error updating tournament', {
        tournamentId,
        updateData,
        error,
      });
      throw error;
    }
  }

  async deleteTournament(tournamentId) {
    try {
      logger.info('Deleting tournament', { tournamentId });
      await Tournament.findByIdAndDelete(tournamentId);
      logger.info('Tournament deleted successfully', { tournamentId });
    } catch (error) {
      logger.error('Error deleting tournament', { tournamentId, error });
      throw error;
    }
  }
}

module.exports = TournamentService;
