const ApiKey = require('../../models/apiKeyModel');
const logger = require('../services/loggerService');

const apiKeyMiddleware = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;

    if (!apiKey) {
      logger.warn('API key missing in request');
      return res.status(401).json({ message: 'API key required' });
    }

    const keyDoc = await ApiKey.findOne({ key: apiKey });

    if (!keyDoc) {
      logger.warn(`Invalid API key: ${apiKey}`);
      return res.status(403).json({ message: 'Invalid API key' });
    }

    req.apiKey = keyDoc;
    logger.info(`API key '${apiKey}' validated successfully`);
    next();
  } catch (error) {
    logger.error('API key validation error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = apiKeyMiddleware;
