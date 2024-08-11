const axios = require('axios');
const logger = require('./loggerService');

class CloudNetService {
  constructor(apiUrl, apiKey) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  async getCloudNetStatus() {
    try {
      const response = await axios.get(`${this.apiUrl}/status`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });
      logger.info('CloudNet Status erfolgreich abgerufen.');
      return response.data;
    } catch (error) {
      logger.error('Fehler beim Abrufen des CloudNet Status:', error);
      throw error;
    }
  }

  async createServer(serverData) {
    try {
      const response = await axios.post(`${this.apiUrl}/start`, serverData, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });
      logger.info('Server erfolgreich erstellt:', response.data);
      return response.data;
    } catch (error) {
      logger.error('Fehler beim Erstellen des Servers:', error);
      throw error;
    }
  }

  async stopServer(serverId) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/stop/${serverId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );
      logger.info(`Server mit ID ${serverId} erfolgreich gestoppt.`);
      return response.data;
    } catch (error) {
      logger.error(
        `Fehler beim Stoppen des Servers mit ID ${serverId}:`,
        error
      );
      throw error;
    }
  }

  async getServers() {
    try {
      const response = await axios.get(`${this.apiUrl}/servers`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });
      logger.info('Alle Server erfolgreich abgerufen.');
      return response.data;
    } catch (error) {
      logger.error('Fehler beim Abrufen der Server:', error);
      throw error;
    }
  }

  async getServerDetails(serverId) {
    try {
      const response = await axios.get(`${this.apiUrl}/server/${serverId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });
      logger.info(
        `Details des Servers mit ID ${serverId} erfolgreich abgerufen.`
      );
      return response.data;
    } catch (error) {
      logger.error(
        `Fehler beim Abrufen der Details des Servers mit ID ${serverId}:`,
        error
      );
      throw error;
    }
  }

  async deleteServer(serverId) {
    try {
      const response = await axios.delete(`${this.apiUrl}/delete/${serverId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });
      logger.info(`Server mit ID ${serverId} erfolgreich gelöscht.`);
      return response.data;
    } catch (error) {
      logger.error(
        `Fehler beim Löschen des Servers mit ID ${serverId}:`,
        error
      );
      throw error;
    }
  }
}

module.exports = CloudNetService;
