const Log = require('../../models/logModel');
const logger = require('../../services/logger.service');
const getBaseUrl = require('../helpers/getBaseUrlHelper');
const sendResponse = require('../helpers/sendResponseHelper');

exports.createLog = async (req, res) => {
  try {
    const logData = req.body;

    if (!logData.message || !logData.level) {
      logger.warn('Message and level are required');
      return sendResponse(req, res, `${getBaseUrl()}/logs/create`, {
        success: false,
        message: 'Message and level are required'
      });
    }

    const newLog = new Log(logData);
    await newLog.save();

    logger.info(`Log created successfully: ${newLog._id}`);
    return sendResponse(req, res, `${getBaseUrl()}/logs/${newLog._id}`, {
      success: true,
      data: newLog
    });
  } catch (error) {
    logger.error('Error creating log:', error);
    return sendResponse(req, res, `${getBaseUrl()}/logs/create`, {
      success: false,
      message: 'Failed to create log',
      error: error.message
    });
  }
};

exports.getLog = async (req, res) => {
  const { logId } = req.params;

  if (!logId) {
    logger.warn('Log ID is required');
    return sendResponse(req, res, `${getBaseUrl()}/logs/${logId}`, {
      success: false,
      message: 'Log ID is required'
    });
  }

  try {
    const logItem = await Log.findById(logId);

    if (!logItem) {
      logger.warn(`Log not found for ID: ${logId}`);
      return sendResponse(req, res, `${getBaseUrl()}/logs/${logId}`, {
        success: false,
        message: 'Log not found'
      });
    }

    logger.info(`Fetched log with ID: ${logId}`);
    return sendResponse(req, res, `${getBaseUrl()}/logs/${logId}`, {
      success: true,
      data: logItem
    });
  } catch (error) {
    logger.error(`Error fetching log with ID ${logId}:`, error);
    return sendResponse(req, res, `${getBaseUrl()}/logs/${logId}`, {
      success: false,
      message: 'Failed to fetch log',
      error: error.message
    });
  }
};

exports.getAllLogs = async (req, res) => {
  try {
    const logs = await Log.find();
    logger.info('Fetched all logs successfully');
    return sendResponse(req, res, `${getBaseUrl()}/logs`, {
      success: true,
      data: logs
    });
  } catch (error) {
    logger.error('Error fetching logs:', error);
    return sendResponse(req, res, `${getBaseUrl()}/logs`, {
      success: false,
      message: 'Failed to fetch logs',
      error: error.message
    });
  }
};

exports.deleteLog = async (req, res) => {
  const { logId } = req.params;

  if (!logId) {
    logger.warn('Log ID is required');
    return sendResponse(req, res, `${getBaseUrl()}/logs/delete/${logId}`, {
      success: false,
      message: 'Log ID is required'
    });
  }

  try {
    const deletedLog = await Log.findByIdAndDelete(logId);

    if (!deletedLog) {
      logger.warn(`Log not found for ID: ${logId}`);
      return sendResponse(req, res, `${getBaseUrl()}/logs/delete/${logId}`, {
        success: false,
        message: 'Log not found'
      });
    }

    logger.info(`Log deleted successfully: ${logId}`);
    return sendResponse(req, res, `${getBaseUrl()}/logs/delete/${logId}`, {
      success: true,
      message: 'Log deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting log with ID ${logId}:`, error);
    return sendResponse(req, res, `${getBaseUrl()}/logs/delete/${logId}`, {
      success: false,
      message: 'Failed to delete log',
      error: error.message
    });
  }
};
