const axios = require('axios');
const logger = require('./loggerService');

class FaceitService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.apiUrl = 'https://open.faceit.com/data/v4';
  }

  async getPlayerInfo(playerNickname) {
    try {
      logger.info(`Fetching player info for nickname: ${playerNickname}`);
      const response = await axios.get(
        `${this.apiUrl}/players?nickname=${playerNickname}`,
        {
          headers: { Authorization: `Bearer ${this.apiKey}` },
        }
      );
      logger.info(
        `Successfully fetched player info for nickname: ${playerNickname}`
      );
      return response.data;
    } catch (error) {
      logger.error('Error fetching player info:', error);
      throw error;
    }
  }

  async getPlayerStats(playerId, game) {
    try {
      logger.info(
        `Fetching player stats for playerId: ${playerId}, game: ${game}`
      );
      const response = await axios.get(
        `${this.apiUrl}/players/${playerId}/stats/${game}`,
        {
          headers: { Authorization: `Bearer ${this.apiKey}` },
        }
      );
      logger.info(
        `Successfully fetched player stats for playerId: ${playerId}, game: ${game}`
      );
      return response.data;
    } catch (error) {
      logger.error('Error fetching player stats:', error);
      throw error;
    }
  }

  async getPlayerMatches(playerId, game) {
    try {
      logger.info(
        `Fetching player matches for playerId: ${playerId}, game: ${game}`
      );
      const response = await axios.get(
        `${this.apiUrl}/players/${playerId}/history?game=${game}`,
        {
          headers: { Authorization: `Bearer ${this.apiKey}` },
        }
      );
      logger.info(
        `Successfully fetched player matches for playerId: ${playerId}, game: ${game}`
      );
      return response.data;
    } catch (error) {
      logger.error('Error fetching player matches:', error);
      throw error;
    }
  }

  async getMatchDetails(matchId) {
    try {
      logger.info(`Fetching match details for matchId: ${matchId}`);
      const response = await axios.get(`${this.apiUrl}/matches/${matchId}`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      logger.info(`Successfully fetched match details for matchId: ${matchId}`);
      return response.data;
    } catch (error) {
      logger.error('Error fetching match details:', error);
      throw error;
    }
  }
}

module.exports = FaceitService;
