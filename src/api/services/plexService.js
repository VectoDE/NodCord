const axios = require('axios');
const logger = require('./loggerService');

class PlexService {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  async getServerInfo() {
    try {
      logger.info('Fetching server info from Plex', { baseUrl: this.baseUrl });
      const response = await axios.get(
        `${this.baseUrl}/?X-Plex-Token=${this.token}`
      );
      logger.info('Server info fetched successfully', {
        data: response.data.MediaContainer,
      });
      return response.data.MediaContainer;
    } catch (error) {
      logger.error('Error fetching server info', { error: error.message });
      throw error;
    }
  }

  async getLibrarySections() {
    try {
      logger.info('Fetching library sections from Plex', {
        baseUrl: this.baseUrl,
      });
      const response = await axios.get(
        `${this.baseUrl}/library/sections?X-Plex-Token=${this.token}`
      );
      logger.info('Library sections fetched successfully', {
        data: response.data.MediaContainer.Directory,
      });
      return response.data.MediaContainer.Directory;
    } catch (error) {
      logger.error('Error fetching library sections', { error: error.message });
      throw error;
    }
  }

  async getSectionContent(sectionId) {
    try {
      logger.info('Fetching content for section', {
        sectionId,
        baseUrl: this.baseUrl,
      });
      const response = await axios.get(
        `${this.baseUrl}/library/sections/${sectionId}/all?X-Plex-Token=${this.token}`
      );
      logger.info(`Content for section ${sectionId} fetched successfully`, {
        data: response.data.MediaContainer.Metadata,
      });
      return response.data.MediaContainer.Metadata;
    } catch (error) {
      logger.error(`Error fetching content for section ${sectionId}`, {
        error: error.message,
      });
      throw error;
    }
  }

  async playMedia(serverId, key) {
    try {
      logger.info('Playing media', { serverId, key, baseUrl: this.baseUrl });
      const response = await axios.get(
        `${this.baseUrl}/player/playback/playMedia?key=${key}&machineIdentifier=${serverId}&X-Plex-Token=${this.token}`
      );
      logger.info('Media playback started successfully', {
        data: response.data,
      });
      return response.data;
    } catch (error) {
      logger.error('Error playing media', {
        serverId,
        key,
        error: error.message,
      });
      throw error;
    }
  }

  async pauseMedia(serverId) {
    try {
      logger.info('Pausing media', { serverId, baseUrl: this.baseUrl });
      const response = await axios.get(
        `${this.baseUrl}/player/playback/pause?machineIdentifier=${serverId}&X-Plex-Token=${this.token}`
      );
      logger.info('Media paused successfully', { data: response.data });
      return response.data;
    } catch (error) {
      logger.error('Error pausing media', { serverId, error: error.message });
      throw error;
    }
  }

  async stopMedia(serverId) {
    try {
      logger.info('Stopping media', { serverId, baseUrl: this.baseUrl });
      const response = await axios.get(
        `${this.baseUrl}/player/playback/stop?machineIdentifier=${serverId}&X-Plex-Token=${this.token}`
      );
      logger.info('Media stopped successfully', { data: response.data });
      return response.data;
    } catch (error) {
      logger.error('Error stopping media', { serverId, error: error.message });
      throw error;
    }
  }
}

module.exports = PlexService;
