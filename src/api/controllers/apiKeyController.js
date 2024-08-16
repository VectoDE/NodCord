const ApiKey = require('../../models/apiKeyModel');
const { v4: uuidv4 } = require('uuid');
const logger = require('../services/loggerService');

exports.createApiKey = async (req, res) => {
  try {
    const { name } = req.body;
    const key = uuidv4();

    const apiKey = new ApiKey({
      key,
      name,
      developerProgram: req.apiKey.developerProgram,
    });

    await apiKey.save();
    logger.info('API key created successfully:', { apiKeyId: apiKey._id });

    res.status(201).json({ message: 'API key created', apiKey });
  } catch (error) {
    logger.error('Error creating API key:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.deleteApiKey = async (req, res) => {
  try {
    const { id } = req.params;

    const apiKey = await ApiKey.findByIdAndDelete(id);

    if (!apiKey) {
      logger.warn('API key not found for deletion:', { apiKeyId: id });
      return res.status(404).json({ message: 'API key not found' });
    }

    logger.info('API key deleted successfully:', { apiKeyId: id });
    res.status(200).json({ message: 'API key deleted' });
  } catch (error) {
    logger.error('Error deleting API key:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getApiKeys = async (req, res) => {
  try {
    const apiKeys = await ApiKey.find({
      developerProgram: req.apiKey.developerProgram,
    });

    res.status(200).json(apiKeys);
  } catch (error) {
    logger.error('Error fetching API keys:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.updateApiKey = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const apiKey = await ApiKey.findByIdAndUpdate(id, { name }, { new: true });

    if (!apiKey) {
      logger.warn('API key not found for update:', { apiKeyId: id });
      return res.status(404).json({ message: 'API key not found' });
    }

    logger.info('API key updated successfully:', { apiKeyId: apiKey._id });
    res.status(200).json({ message: 'API key updated', apiKey });
  } catch (error) {
    logger.error('Error updating API key:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
