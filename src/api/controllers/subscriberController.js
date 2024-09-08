const Subscriber = require('../../models/subscriberModel');
const nodemailerService = require('../services/nodemailerService');
const logger = require('../services/loggerService');
const getBaseUrl = require('../helpers/getBaseUrlHelper');
const sendResponse = require('../helpers/sendResponseHelper');

exports.createSubscriber = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      logger.warn('Missing required fields in create subscriber request:', { body: req.body });
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/subscribers/create`, {
        success: false,
        message: 'Email and name are required.'
      });
    }

    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      logger.info('Subscriber already exists:', { email });
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/subscribers/create`, {
        success: false,
        message: 'Subscriber already exists.'
      });
    }

    const newSubscriber = new Subscriber({ email, name });
    await newSubscriber.save();

    await nodemailerService.sendSubscriptionConfirmation(email, name);

    logger.info('Subscriber created and confirmation email sent:', { email, name });
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/subscribers`, {
      success: true,
      message: 'Subscriber created and confirmation email sent.'
    });
  } catch (error) {
    logger.error('Error creating subscriber:', error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/subscribers/create`, {
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

exports.getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.find();
    logger.info('Fetched all subscribers:', { count: subscribers.length });
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/subscribers`, {
      success: true,
      data: subscribers
    });
  } catch (error) {
    logger.error('Error fetching subscribers:', error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/subscribers`, {
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

exports.getSubscriberById = async (req, res) => {
  const { subscriberId } = req.params;

  try {
    const subscriber = await Subscriber.findById(subscriberId);
    if (!subscriber) {
      logger.warn('Subscriber not found by ID:', { subscriberId });
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/subscribers/${subscriberId}`, {
        success: false,
        message: 'Subscriber not found.'
      });
    }
    logger.info('Fetched subscriber by ID:', { subscriberId });
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/subscribers/${subscriberId}`, {
      success: true,
      data: subscriber
    });
  } catch (error) {
    logger.error('Error fetching subscriber by ID:', error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/subscribers/${subscriberId}`, {
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

exports.updateSubscriber = async (req, res) => {
  const { subscriberId } = req.params;
  const { email, name } = req.body;

  try {
    if (!email && !name) {
      logger.warn('No fields to update in update subscriber request:', { body: req.body });
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/subscribers/${subscriberId}/edit`, {
        success: false,
        message: 'At least one field is required to update.'
      });
    }

    const updatedSubscriber = await Subscriber.findByIdAndUpdate(
      subscriberId,
      { email, name },
      { new: true, runValidators: true }
    );

    if (!updatedSubscriber) {
      logger.warn('Subscriber not found for update:', { subscriberId });
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/subscribers/${subscriberId}/edit`, {
        success: false,
        message: 'Subscriber not found.'
      });
    }

    logger.info('Subscriber updated:', { subscriberId, email, name });
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/subscribers/${subscriberId}`, {
      success: true,
      data: updatedSubscriber
    });
  } catch (error) {
    logger.error('Error updating subscriber:', error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/subscribers/${subscriberId}/edit`, {
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

exports.deleteSubscriber = async (req, res) => {
  const { subscriberId } = req.params;

  try {
    const deletedSubscriber = await Subscriber.findByIdAndDelete(subscriberId);
    if (!deletedSubscriber) {
      logger.warn('Subscriber not found for deletion:', { subscriberId });
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/subscribers`, {
        success: false,
        message: 'Subscriber not found.'
      });
    }
    logger.info('Subscriber deleted:', { subscriberId });
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/subscribers`, {
      success: true,
      message: 'Subscriber deleted.'
    });
  } catch (error) {
    logger.error('Error deleting subscriber:', error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/subscribers`, {
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};
