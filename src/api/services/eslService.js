const axios = require('axios');

class EslService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.apiUrl = 'https://api.eslgaming.com';
    }

    async getTournaments() {
        try {
            const response = await axios.get(`${this.apiUrl}/tournaments`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching tournaments:', error);
            throw error;
        }
    }

    async getTournamentDetails(tournamentId) {
        try {
            const response = await axios.get(`${this.apiUrl}/tournaments/${tournamentId}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching tournament details:', error);
            throw error;
        }
    }

    async getTeamDetails(teamId) {
        try {
            const response = await axios.get(`${this.apiUrl}/teams/${teamId}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching team details:', error);
            throw error;
        }
    }

    async getPlayerDetails(playerId) {
        try {
            const response = await axios.get(`${this.apiUrl}/players/${playerId}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching player details:', error);
            throw error;
        }
    }
}

module.exports = EslService;
