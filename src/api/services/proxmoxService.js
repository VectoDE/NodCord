const axios = require('axios');
const logger = require('./loggerService');

class ProxmoxService {
  constructor(baseUrl, username, password, realm) {
    this.baseUrl = baseUrl;
    this.username = username;
    this.password = password;
    this.realm = realm;
    this.token = null;
  }

  async authenticate() {
    try {
      logger.info('Authenticating to Proxmox', {
        username: this.username,
        realm: this.realm,
      });
      const response = await axios.post(
        `${this.baseUrl}/api2/json/access/ticket`,
        {
          username: `${this.username}@${this.realm}`,
          password: this.password,
        }
      );

      this.token = {
        ticket: response.data.data.ticket,
        csrfPreventionToken: response.data.data.CSRFPreventionToken,
      };

      logger.info('Authentication successful', { token: this.token });
      return this.token;
    } catch (error) {
      logger.error('Error authenticating to Proxmox', { error: error.message });
      throw error;
    }
  }

  async getNodes() {
    await this.ensureAuthenticated();
    try {
      logger.info('Fetching nodes from Proxmox');
      const response = await axios.get(`${this.baseUrl}/api2/json/nodes`, {
        headers: {
          Cookie: `PVEAuthCookie=${this.token.ticket}`,
        },
      });

      logger.info('Nodes fetched successfully', { nodes: response.data.data });
      return response.data.data;
    } catch (error) {
      logger.error('Error fetching nodes', { error: error.message });
      throw error;
    }
  }

  async getNodeStatus(node) {
    await this.ensureAuthenticated();
    try {
      logger.info('Fetching status for node', { node });
      const response = await axios.get(
        `${this.baseUrl}/api2/json/nodes/${node}/status`,
        {
          headers: {
            Cookie: `PVEAuthCookie=${this.token.ticket}`,
          },
        }
      );

      logger.info('Node status fetched successfully', {
        node,
        status: response.data.data,
      });
      return response.data.data;
    } catch (error) {
      logger.error('Error fetching node status', {
        node,
        error: error.message,
      });
      throw error;
    }
  }

  async startVM(node, vmid) {
    await this.ensureAuthenticated();
    try {
      logger.info('Starting VM', { node, vmid });
      const response = await axios.post(
        `${this.baseUrl}/api2/json/nodes/${node}/qemu/${vmid}/status/start`,
        null,
        {
          headers: {
            Cookie: `PVEAuthCookie=${this.token.ticket}`,
            CSRFPreventionToken: this.token.csrfPreventionToken,
          },
        }
      );

      logger.info('VM started successfully', {
        node,
        vmid,
        result: response.data.data,
      });
      return response.data.data;
    } catch (error) {
      logger.error('Error starting VM', { node, vmid, error: error.message });
      throw error;
    }
  }

  async stopVM(node, vmid) {
    await this.ensureAuthenticated();
    try {
      logger.info('Stopping VM', { node, vmid });
      const response = await axios.post(
        `${this.baseUrl}/api2/json/nodes/${node}/qemu/${vmid}/status/stop`,
        null,
        {
          headers: {
            Cookie: `PVEAuthCookie=${this.token.ticket}`,
            CSRFPreventionToken: this.token.csrfPreventionToken,
          },
        }
      );

      logger.info('VM stopped successfully', {
        node,
        vmid,
        result: response.data.data,
      });
      return response.data.data;
    } catch (error) {
      logger.error('Error stopping VM', { node, vmid, error: error.message });
      throw error;
    }
  }

  async ensureAuthenticated() {
    if (!this.token) {
      logger.info('No valid token found, authenticating...');
      await this.authenticate();
    }
  }
}

module.exports = ProxmoxService;
