const axios = require('axios');
const msal = require('@azure/msal-node');

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

    // Authentifizierung und Token-Abruf
    async getAuthToken() {
        const authResponse = await this.msalClient.acquireTokenByClientCredential({
            scopes: ["https://graph.microsoft.com/.default"]
        });
        return authResponse.accessToken;
    }

    // Benutzerinformationen abrufen
    async getUserInfo(userId) {
        try {
            const token = await this.getAuthToken();
            const response = await axios.get(`https://graph.microsoft.com/v1.0/users/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching user info:', error);
            throw error;
        }
    }

    // Liste der Microsoft-Dienste anzeigen (z.B. Office 365 Dienste)
    async getServices() {
        try {
            const token = await this.getAuthToken();
            const response = await axios.get(`https://graph.microsoft.com/v1.0/subscribedSkus`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching services:', error);
            throw error;
        }
    }

    // Minecraft-Daten abrufen (z.B. Profil, Spielerstatus)
    async getMinecraftProfile(minecraftUsername) {
        try {
            const token = await this.getAuthToken();
            const response = await axios.get(`https://api.minecraftservices.com/minecraft/profile/${minecraftUsername}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching Minecraft profile:', error);
            throw error;
        }
    }

    // Beispiel für Azure-Ressourcenverwaltung (z.B. virtuelle Maschinen)
    async getAzureVMs(subscriptionId) {
        try {
            const token = await this.getAuthToken();
            const response = await axios.get(`https://management.azure.com/subscriptions/${subscriptionId}/providers/Microsoft.Compute/virtualMachines?api-version=2021-03-01`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching Azure VMs:', error);
            throw error;
        }
    }

    // Xbox Live-Informationen abrufen
    async getXboxLiveProfile(gamertag) {
        try {
            const token = await this.getAuthToken();
            const response = await axios.get(`https://xboxapi.com/v2/xuid/${gamertag}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching Xbox Live profile:', error);
            throw error;
        }
    }
}

module.exports = MicrosoftService;
