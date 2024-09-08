const Newsletter = require('../../models/newsletterModel');
const nodemailerService = require('../services/nodemailerService');
const logger = require('../services/loggerService');
const getBaseUrl = require('../helpers/getBaseUrlHelper');
const sendResponse = require('../helpers/sendResponseHelper');

exports.addSubscriber = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      logger.warn('Email and name are required');
      return sendResponse(req, res, `${getBaseUrl()}/newsletter/add`, {
        success: false,
        message: 'Email and name are required'
      });
    }

    const existingSubscriber = await Newsletter.findOne({ email });
    if (existingSubscriber) {
      logger.warn(`Email is already subscribed: ${email}`);
      return sendResponse(req, res, `${getBaseUrl()}/newsletter/add`, {
        success: false,
        message: 'Email is already subscribed'
      });
    }

    const newSubscriber = new Newsletter({ email, name });
    await newSubscriber.save();

    await nodemailerService.sendSubscriptionConfirmation(email, name);

    logger.info(`New subscriber added: ${email}`);
    return sendResponse(req, res, `${getBaseUrl()}/newsletter/${newSubscriber._id}`, {
      success: true,
      data: newSubscriber
    });
  } catch (error) {
    logger.error('Error adding subscriber:', error);
    return sendResponse(req, res, `${getBaseUrl()}/newsletter/add`, {
      success: false,
      message: 'Failed to add subscriber',
      error: error.message
    });
  }
};

exports.getSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.find();
    logger.info('Fetched all subscribers successfully');
    return sendResponse(req, res, `${getBaseUrl()}/newsletter`, {
      success: true,
      data: subscribers
    });
  } catch (error) {
    logger.error('Error fetching subscribers:', error);
    return sendResponse(req, res, `${getBaseUrl()}/newsletter`, {
      success: false,
      message: 'Failed to fetch subscribers',
      error: error.message
    });
  }
};

exports.removeSubscriber = async (req, res) => {
  const { email } = req.params;

  try {
    if (!email) {
      logger.warn('Email is required');
      return sendResponse(req, res, `${getBaseUrl()}/newsletter/remove/${email}`, {
        success: false,
        message: 'Email is required'
      });
    }

    const deletedSubscriber = await Newsletter.findOneAndDelete({ email });

    if (!deletedSubscriber) {
      logger.warn(`Subscriber not found for email: ${email}`);
      return sendResponse(req, res, `${getBaseUrl()}/newsletter/remove/${email}`, {
        success: false,
        message: 'Subscriber not found'
      });
    }

    logger.info(`Subscriber removed successfully: ${email}`);
    return sendResponse(req, res, `${getBaseUrl()}/newsletter/remove/${email}`, {
      success: true,
      message: 'Subscriber removed successfully'
    });
  } catch (error) {
    logger.error('Error removing subscriber:', error);
    return sendResponse(req, res, `${getBaseUrl()}/newsletter/remove/${email}`, {
      success: false,
      message: 'Failed to remove subscriber',
      error: error.message
    });
  }
};
