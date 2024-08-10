const axios = require('axios');

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
      const response = await axios.post(`${this.baseUrl}/api2/json/access/ticket`, {
        username: `${this.username}@${this.realm}`,
        password: this.password
      });

      this.token = {
        ticket: response.data.data.ticket,
        csrfPreventionToken: response.data.data.CSRFPreventionToken
      };

      return this.token;
    } catch (error) {
      console.error('Error authenticating to Proxmox:', error);
      throw error;
    }
  }

  async getNodes() {
    await this.ensureAuthenticated();
    try {
      const response = await axios.get(`${this.baseUrl}/api2/json/nodes`, {
        headers: {
          'Cookie': `PVEAuthCookie=${this.token.ticket}`
        }
      });

      return response.data.data;
    } catch (error) {
      console.error('Error fetching nodes:', error);
      throw error;
    }
  }

  async getNodeStatus(node) {
    await this.ensureAuthenticated();
    try {
      const response = await axios.get(`${this.baseUrl}/api2/json/nodes/${node}/status`, {
        headers: {
          'Cookie': `PVEAuthCookie=${this.token.ticket}`
        }
      });

      return response.data.data;
    } catch (error) {
      console.error('Error fetching node status:', error);
      throw error;
    }
  }

  async startVM(node, vmid) {
    await this.ensureAuthenticated();
    try {
      const response = await axios.post(`${this.baseUrl}/api2/json/nodes/${node}/qemu/${vmid}/status/start`, null, {
        headers: {
          'Cookie': `PVEAuthCookie=${this.token.ticket}`,
          'CSRFPreventionToken': this.token.csrfPreventionToken
        }
      });

      return response.data.data;
    } catch (error) {
      console.error('Error starting VM:', error);
      throw error;
    }
  }

  async stopVM(node, vmid) {
    await this.ensureAuthenticated();
    try {
      const response = await axios.post(`${this.baseUrl}/api2/json/nodes/${node}/qemu/${vmid}/status/stop`, null, {
        headers: {
          'Cookie': `PVEAuthCookie=${this.token.ticket}`,
          'CSRFPreventionToken': this.token.csrfPreventionToken
        }
      });

      return response.data.data;
    } catch (error) {
      console.error('Error stopping VM:', error);
      throw error;
    }
  }

  async ensureAuthenticated() {
    if (!this.token) {
      await this.authenticate();
    }
  }
}

module.exports = ProxmoxService;
