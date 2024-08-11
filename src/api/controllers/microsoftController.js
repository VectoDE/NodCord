const MicrosoftService = require('../services/microsoftService');
const logger = require('../services/loggerService');

const microsoftService = new MicrosoftService();

exports.getUserInfo = async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const userInfo = await microsoftService.getUserInfo(userId);
    res.status(200).json(userInfo);
  } catch (error) {
    logger.error(
      `Failed to fetch user information for userId ${userId}:`,
      error
    );
    res.status(500).json({ error: 'Failed to fetch user information' });
  }
};

exports.getServices = async (req, res) => {
  try {
    const services = await microsoftService.getServices();
    res.status(200).json(services);
  } catch (error) {
    logger.error('Failed to fetch services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
};

exports.getMinecraftProfile = async (req, res) => {
  const { minecraftUsername } = req.params;
  if (!minecraftUsername) {
    return res.status(400).json({ error: 'Minecraft username is required' });
  }

  try {
    const profile = await microsoftService.getMinecraftProfile(
      minecraftUsername
    );
    res.status(200).json(profile);
  } catch (error) {
    logger.error(
      `Failed to fetch Minecraft profile for username ${minecraftUsername}:`,
      error
    );
    res.status(500).json({ error: 'Failed to fetch Minecraft profile' });
  }
};

exports.getAzureVMs = async (req, res) => {
  const { subscriptionId } = req.params;
  if (!subscriptionId) {
    return res.status(400).json({ error: 'Subscription ID is required' });
  }

  try {
    const vms = await microsoftService.getAzureVMs(subscriptionId);
    res.status(200).json(vms);
  } catch (error) {
    logger.error(
      `Failed to fetch Azure VMs for subscriptionId ${subscriptionId}:`,
      error
    );
    res.status(500).json({ error: 'Failed to fetch Azure VMs' });
  }
};

exports.getXboxLiveProfile = async (req, res) => {
  const { gamertag } = req.params;
  if (!gamertag) {
    return res.status(400).json({ error: 'Gamertag is required' });
  }

  try {
    const profile = await microsoftService.getXboxLiveProfile(gamertag);
    res.status(200).json(profile);
  } catch (error) {
    logger.error(
      `Failed to fetch Xbox Live profile for gamertag ${gamertag}:`,
      error
    );
    res.status(500).json({ error: 'Failed to fetch Xbox Live profile' });
  }
};
