const axios = require('axios');

class SteamService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.apiUrl = 'http://api.steampowered.com';
    }

    async getPlayerSummaries(steamId) {
        try {
            const response = await axios.get(`${this.apiUrl}/ISteamUser/GetPlayerSummaries/v2/`, {
                params: {
                    key: this.apiKey,
                    steamids: steamId,
                },
            });
            return response.data.response.players[0];
        } catch (error) {
            console.error('Error fetching player summaries:', error);
            throw error;
        }
    }

    async getOwnedGames(steamId) {
        try {
            const response = await axios.get(`${this.apiUrl}/IPlayerService/GetOwnedGames/v1/`, {
                params: {
                    key: this.apiKey,
                    steamid: steamId,
                    include_appinfo: true,
                    include_played_free_games: true,
                },
            });
            return response.data.response.games;
        } catch (error) {
            console.error('Error fetching owned games:', error);
            throw error;
        }
    }

    async getPlayerAchievements(steamId, appId) {
        try {
            const response = await axios.get(`${this.apiUrl}/ISteamUserStats/GetPlayerAchievements/v1/`, {
                params: {
                    key: this.apiKey,
                    steamid: steamId,
                    appid: appId,
                },
            });
            return response.data.playerstats.achievements;
        } catch (error) {
            console.error('Error fetching player achievements:', error);
            throw error;
        }
    }

    async getGameDetails(appId) {
        try {
            const response = await axios.get(`https://store.steampowered.com/api/appdetails?appids=${appId}`);
            return response.data[appId].data;
        } catch (error) {
            console.error('Error fetching game details:', error);
            throw error;
        }
    }
}

module.exports = SteamService;
