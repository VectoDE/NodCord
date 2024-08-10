const axios = require('axios');

class FaceitService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.apiUrl = 'https://open.faceit.com/data/v4';
    }

    async getPlayerInfo(playerNickname) {
        try {
            const response = await axios.get(`${this.apiUrl}/players?nickname=${playerNickname}`, {
                headers: { 'Authorization': `Bearer ${this.apiKey}` }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching player info:', error);
            throw error;
        }
    }

    async getPlayerStats(playerId, game) {
        try {
            const response = await axios.get(`${this.apiUrl}/players/${playerId}/stats/${game}`, {
                headers: { 'Authorization': `Bearer ${this.apiKey}` }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching player stats:', error);
            throw error;
        }
    }

    async getPlayerMatches(playerId, game) {
        try {
            const response = await axios.get(`${this.apiUrl}/players/${playerId}/history?game=${game}`, {
                headers: { 'Authorization': `Bearer ${this.apiKey}` }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching player matches:', error);
            throw error;
        }
    }

    async getMatchDetails(matchId) {
        try {
            const response = await axios.get(`${this.apiUrl}/matches/${matchId}`, {
                headers: { 'Authorization': `Bearer ${this.apiKey}` }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching match details:', error);
            throw error;
        }
    }
}

module.exports = FaceitService;
