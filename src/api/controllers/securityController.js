const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const logger = require('../services/loggerService');

const API_KEYS_FILE = path.join(__dirname, '../../public/keys/apiKeys.json');

const generateApiKey = (req, res) => {
  try {
    const apiKey = crypto.randomBytes(32).toString('hex');
    let keys = JSON.parse(fs.readFileSync(API_KEYS_FILE, 'utf8'));

    keys.push(apiKey);
    fs.writeFileSync(API_KEYS_FILE, JSON.stringify(keys, null, 2), 'utf8');

    logger.info(`New API key generated: ${apiKey}`);
    res.status(201).json({ apiKey });
  } catch (error) {
    logger.error(`Error generating new API key: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

const verifyApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    logger.warn('API key missing in request headers');
    return res.status(401).json({ message: 'API key missing' });
  }

  try {
    const keys = JSON.parse(fs.readFileSync(API_KEYS_FILE, 'utf8'));
    if (keys.includes(apiKey)) {
      logger.info('API key verified successfully');
      next();
    } else {
      logger.warn('Invalid API key provided');
      res.status(403).json({ message: 'Invalid API key' });
    }
  } catch (error) {
    logger.error(`Error verifying API key: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

const manageBotPermissions = (req, res) => {
  // Manage bot permissions such as adding or removing roles

  logger.info('Managing bot permissions');
  res.status(200).json({ message: 'Permissions managed' });
};

module.exports = {
  generateApiKey,
  verifyApiKey,
  manageBotPermissions,
};
