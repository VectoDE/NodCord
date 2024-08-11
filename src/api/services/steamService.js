const axios = require('axios');
const logger = require('./loggerService');

class SteamService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.apiUrl = 'http://api.steampowered.com';
  }

  async getPlayerSummaries(steamId) {
    try {
      logger.info('Fetching player summaries', { steamId });
      const response = await axios.get(
        `${this.apiUrl}/ISteamUser/GetPlayerSummaries/v2/`,
        {
          params: {
            key: this.apiKey,
            steamids: steamId,
          },
        }
      );
      logger.info('Player summaries fetched successfully', {
        player: response.data.response.players[0],
      });
      return response.data.response.players[0];
    } catch (error) {
      logger.error('Error fetching player summaries', {
        steamId,
        error: error.message,
      });
      throw error;
    }
  }

  async getOwnedGames(steamId) {
    try {
      logger.info('Fetching owned games', { steamId });
      const response = await axios.get(
        `${this.apiUrl}/IPlayerService/GetOwnedGames/v1/`,
        {
          params: {
            key: this.apiKey,
            steamid: steamId,
            include_appinfo: true,
            include_played_free_games: true,
          },
        }
      );
      logger.info('Owned games fetched successfully', {
        games: response.data.response.games,
      });
      return response.data.response.games;
    } catch (error) {
      logger.error('Error fetching owned games', {
        steamId,
        error: error.message,
      });
      throw error;
    }
  }

  async getPlayerAchievements(steamId, appId) {
    try {
      logger.info('Fetching player achievements', { steamId, appId });
      const response = await axios.get(
        `${this.apiUrl}/ISteamUserStats/GetPlayerAchievements/v1/`,
        {
          params: {
            key: this.apiKey,
            steamid: steamId,
            appid: appId,
          },
        }
      );
      logger.info('Player achievements fetched successfully', {
        achievements: response.data.playerstats.achievements,
      });
      return response.data.playerstats.achievements;
    } catch (error) {
      logger.error('Error fetching player achievements', {
        steamId,
        appId,
        error: error.message,
      });
      throw error;
    }
  }

  async getGameDetails(appId) {
    try {
      logger.info('Fetching game details', { appId });
      const response = await axios.get(
        `https://store.steampowered.com/api/appdetails?appids=${appId}`
      );
      logger.info('Game details fetched successfully', {
        gameDetails: response.data[appId].data,
      });
      return response.data[appId].data;
    } catch (error) {
      logger.error('Error fetching game details', {
        appId,
        error: error.message,
      });
      throw error;
    }
  }
}

module.exports = SteamService;
