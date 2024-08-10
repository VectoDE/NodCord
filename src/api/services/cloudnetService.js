const axios = require('axios');

class CloudNetService {
    constructor(apiUrl, apiKey) {
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
    }

    // Funktion, um CloudNet v3 Status zu prüfen
    async getCloudNetStatus() {
        try {
            const response = await axios.get(`${this.apiUrl}/status`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching CloudNet status:', error);
            throw error;
        }
    }

    // Server erstellen
    async createServer(serverData) {
        try {
            const response = await axios.post(`${this.apiUrl}/start`, serverData, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error creating server:', error);
            throw error;
        }
    }

    // Server stoppen
    async stopServer(serverId) {
        try {
            const response = await axios.post(`${this.apiUrl}/stop/${serverId}`, {}, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error stopping server:', error);
            throw error;
        }
    }

    // Alle Server anzeigen
    async getServers() {
        try {
            const response = await axios.get(`${this.apiUrl}/servers`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching servers:', error);
            throw error;
        }
    }

    // Einzelnen Server anzeigen
    async getServerDetails(serverId) {
        try {
            const response = await axios.get(`${this.apiUrl}/server/${serverId}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching server details:', error);
            throw error;
        }
    }

    // Server löschen
    async deleteServer(serverId) {
        try {
            const response = await axios.delete(`${this.apiUrl}/delete/${serverId}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error deleting server:', error);
            throw error;
        }
    }
}

module.exports = CloudNetService;
