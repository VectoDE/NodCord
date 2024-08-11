const axios = require('axios');
const msal = require('@azure/msal-node');
const logger = require('./loggerService');

class MicrosoftService {
  constructor() {
    this.msalConfig = {
      auth: {
        clientId: process.env.MICROSOFT_CLIENT_ID,
        authority: process.env.MICROSOFT_AUTHORITY_URL,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      },
    };
    this.msalClient = new msal.ConfidentialClientApplication(this.msalConfig);
  }

  async getAuthToken() {
    try {
      const authResponse = await this.msalClient.acquireTokenByClientCredential(
        {
          scopes: ['https://graph.microsoft.com/.default'],
        }
      );
      logger.info('Token successfully acquired');
      return authResponse.accessToken;
    } catch (error) {
      logger.error('Error acquiring authentication token', {
        error: error.message,
      });
      throw error;
    }
  }

  async getUserInfo(userId) {
    try {
      const token = await this.getAuthToken();
      const response = await axios.get(
        `https://graph.microsoft.com/v1.0/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      logger.info('Fetched user info successfully', { userId });
      return response.data;
    } catch (error) {
      logger.error('Error fetching user info', {
        userId,
        error: error.message,
      });
      throw error;
    }
  }

  async getServices() {
    try {
      const token = await this.getAuthToken();
      const response = await axios.get(
        `https://graph.microsoft.com/v1.0/subscribedSkus`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      logger.info('Fetched Microsoft services successfully');
      return response.data;
    } catch (error) {
      logger.error('Error fetching Microsoft services', {
        error: error.message,
      });
      throw error;
    }
  }

  async getMinecraftProfile(minecraftUsername) {
    try {
      const token = await this.getAuthToken();
      const response = await axios.get(
        `https://api.minecraftservices.com/minecraft/profile/${minecraftUsername}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      logger.info('Fetched Minecraft profile successfully', {
        minecraftUsername,
      });
      return response.data;
    } catch (error) {
      logger.error('Error fetching Minecraft profile', {
        minecraftUsername,
        error: error.message,
      });
      throw error;
    }
  }

  async getAzureVMs(subscriptionId) {
    try {
      const token = await this.getAuthToken();
      const response = await axios.get(
        `https://management.azure.com/subscriptions/${subscriptionId}/providers/Microsoft.Compute/virtualMachines?api-version=2021-03-01`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      logger.info('Fetched Azure VMs successfully', { subscriptionId });
      return response.data;
    } catch (error) {
      logger.error('Error fetching Azure VMs', {
        subscriptionId,
        error: error.message,
      });
      throw error;
    }
  }

  async getXboxLiveProfile(gamertag) {
    try {
      const token = await this.getAuthToken();
      const response = await axios.get(
        `https://xboxapi.com/v2/xuid/${gamertag}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      logger.info('Fetched Xbox Live profile successfully', { gamertag });
      return response.data;
    } catch (error) {
      logger.error('Error fetching Xbox Live profile', {
        gamertag,
        error: error.message,
      });
      throw error;
    }
  }
}

module.exports = MicrosoftService;
