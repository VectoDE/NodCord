const axios = require('axios');
const logger = require('./loggerService');

class EslService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.apiUrl = 'https://api.eslgaming.com';
  }

  async getTournaments() {
    try {
      logger.info('Fetching tournaments');
      const response = await axios.get(`${this.apiUrl}/tournaments`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });
      logger.info('Successfully fetched tournaments');
      return response.data;
    } catch (error) {
      logger.error('Error fetching tournaments:', error);
      throw error;
    }
  }

  async getTournamentDetails(tournamentId) {
    try {
      logger.info(
        `Fetching tournament details for tournamentId: ${tournamentId}`
      );
      const response = await axios.get(
        `${this.apiUrl}/tournaments/${tournamentId}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );
      logger.info(
        `Successfully fetched tournament details for tournamentId: ${tournamentId}`
      );
      return response.data;
    } catch (error) {
      logger.error(
        `Error fetching tournament details for tournamentId: ${tournamentId}:`,
        error
      );
      throw error;
    }
  }

  async getTeamDetails(teamId) {
    try {
      logger.info(`Fetching team details for teamId: ${teamId}`);
      const response = await axios.get(`${this.apiUrl}/teams/${teamId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });
      logger.info(`Successfully fetched team details for teamId: ${teamId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching team details for teamId: ${teamId}:`, error);
      throw error;
    }
  }

  async getPlayerDetails(playerId) {
    try {
      logger.info(`Fetching player details for playerId: ${playerId}`);
      const response = await axios.get(`${this.apiUrl}/players/${playerId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });
      logger.info(
        `Successfully fetched player details for playerId: ${playerId}`
      );
      return response.data;
    } catch (error) {
      logger.error(
        `Error fetching player details for playerId: ${playerId}:`,
        error
      );
      throw error;
    }
  }
}

module.exports = EslService;
