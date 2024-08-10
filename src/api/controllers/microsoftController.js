const MicrosoftService = require('../services/microsoftService');

const microsoftService = new MicrosoftService();

exports.getUserInfo = async (req, res) => {
    const { userId } = req.params;
    try {
        const userInfo = await microsoftService.getUserInfo(userId);
        res.json(userInfo);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user information' });
    }
};

exports.getServices = async (req, res) => {
    try {
        const services = await microsoftService.getServices();
        res.json(services);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch services' });
    }
};

exports.getMinecraftProfile = async (req, res) => {
    const { minecraftUsername } = req.params;
    try {
        const profile = await microsoftService.getMinecraftProfile(minecraftUsername);
        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch Minecraft profile' });
    }
};

exports.getAzureVMs = async (req, res) => {
    const { subscriptionId } = req.params;
    try {
        const vms = await microsoftService.getAzureVMs(subscriptionId);
        res.json(vms);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch Azure VMs' });
    }
};

exports.getXboxLiveProfile = async (req, res) => {
    const { gamertag } = req.params;
    try {
        const profile = await microsoftService.getXboxLiveProfile(gamertag);
        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch Xbox Live profile' });
    }
};
