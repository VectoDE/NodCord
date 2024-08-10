const axios = require('axios');

class PlexService {
    constructor(baseUrl, token) {
        this.baseUrl = baseUrl;
        this.token = token;
    }

    async getServerInfo() {
        try {
            const response = await axios.get(`${this.baseUrl}/?X-Plex-Token=${this.token}`);
            return response.data.MediaContainer;
        } catch (error) {
            console.error('Error fetching server info:', error);
            throw error;
        }
    }

    async getLibrarySections() {
        try {
            const response = await axios.get(`${this.baseUrl}/library/sections?X-Plex-Token=${this.token}`);
            return response.data.MediaContainer.Directory;
        } catch (error) {
            console.error('Error fetching library sections:', error);
            throw error;
        }
    }

    async getSectionContent(sectionId) {
        try {
            const response = await axios.get(`${this.baseUrl}/library/sections/${sectionId}/all?X-Plex-Token=${this.token}`);
            return response.data.MediaContainer.Metadata;
        } catch (error) {
            console.error(`Error fetching content for section ${sectionId}:`, error);
            throw error;
        }
    }

    async playMedia(serverId, key) {
        try {
            const response = await axios.get(`${this.baseUrl}/player/playback/playMedia?key=${key}&machineIdentifier=${serverId}&X-Plex-Token=${this.token}`);
            return response.data;
        } catch (error) {
            console.error('Error playing media:', error);
            throw error;
        }
    }

    async pauseMedia(serverId) {
        try {
            const response = await axios.get(`${this.baseUrl}/player/playback/pause?machineIdentifier=${serverId}&X-Plex-Token=${this.token}`);
            return response.data;
        } catch (error) {
            console.error('Error pausing media:', error);
            throw error;
        }
    }

    async stopMedia(serverId) {
        try {
            const response = await axios.get(`${this.baseUrl}/player/playback/stop?machineIdentifier=${serverId}&X-Plex-Token=${this.token}`);
            return response.data;
        } catch (error) {
            console.error('Error stopping media:', error);
            throw error;
        }
    }
}

module.exports = PlexService;
