const ApiKey = require('../../models/apiKeyModel');
const { v4: uuidv4 } = require('uuid');
const getBaseUrl = require('../helpers/getBaseUrlHelper');
const sendResponse = require('../helpers/sendResponseHelper');
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

    sendResponse(res, 201, 'API key created', { apiKey });
  } catch (error) {
    logger.error('Error creating API key:', error.message);
    sendResponse(res, 500, 'Internal Server Error');
  }
};

exports.deleteApiKey = async (req, res) => {
  try {
    const { apiId } = req.params;

    const apiKey = await ApiKey.findByIdAndDelete(apiId);

    if (!apiKey) {
      logger.warn('API key not found for deletion:', { apiKeyId: apiId });
      return sendResponse(res, 404, 'API key not found');
    }

    logger.info('API key deleted successfully:', { apiKeyId: apiId });
    sendResponse(res, 200, 'API key deleted');
  } catch (error) {
    logger.error('Error deleting API key:', error.message);
    sendResponse(res, 500, 'Internal Server Error');
  }
};

exports.getApiKeys = async (req, res) => {
  try {
    const apiKeys = await ApiKey.find({
      developerProgram: req.apiKey.developerProgram,
    });

    sendResponse(res, 200, 'API keys fetched', apiKeys);
  } catch (error) {
    logger.error('Error fetching API keys:', error.message);
    sendResponse(res, 500, 'Internal Server Error');
  }
};

exports.updateApiKey = async (req, res) => {
  try {
    const { apiId } = req.params;
    const { name } = req.body;

    const apiKey = await ApiKey.findByIdAndUpdate(apiId, { name }, { new: true });

    if (!apiKey) {
      logger.warn('API key not found for update:', { apiKeyId: apiId });
      return sendResponse(res, 404, 'API key not found');
    }

    logger.info('API key updated successfully:', { apiKeyId: apiKey._id });
    sendResponse(res, 200, 'API key updated', { apiKey });
  } catch (error) {
    logger.error('Error updating API key:', error.message);
    sendResponse(res, 500, 'Internal Server Error');
  }
};
