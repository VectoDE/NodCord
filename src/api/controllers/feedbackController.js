require('dotenv').config();
const getBaseUrl = require('../helpers/getBaseUrlHelper');
const sendResponse = require('../helpers/sendResponseHelper');
const logger = require('../services/loggerService');
const Feedback = require('../../models/feedbackModel');

exports.createFeedback = async (req, res) => {
  try {
    const { userId, username, feedbackText } = req.body;

    if (!userId || !username || !feedbackText) {
      const redirectUrl = `${getBaseUrl()}/dashboard/feedback/create`;
      logger.warn('Missing required fields:', { userId, username });
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Missing required fields.'
      });
    }

    const feedback = new Feedback({
      userId,
      username,
      feedbackText,
    });

    await feedback.save();

    const redirectUrl = `${getBaseUrl()}/dashboard/feedback`;
    logger.info('Feedback successfully created:', { userId, username });
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Feedback successfully created!',
      feedback,
    });
  } catch (error) {
    logger.error('Error creating feedback:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/feedback/create`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'An error occurred. Please try again later.',
      error: error.message
    });
  }
};

exports.getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }).exec();
    const redirectUrl = `${getBaseUrl()}/dashboard/feedback`;
    logger.info('Retrieved all feedbacks:', { count: feedbacks.length });
    return sendResponse(req, res, redirectUrl, {
      success: true,
      feedbacks
    });
  } catch (error) {
    logger.error('Error retrieving feedbacks:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/feedback`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'An error occurred. Please try again later.',
      error: error.message
    });
  }
};

exports.getFeedbackById = async (req, res) => {
  try {
    const feedbackId = req.params.feedbackId;
    const feedback = await Feedback.findById(feedbackId);

    if (!feedback) {
      const redirectUrl = `${getBaseUrl()}/dashboard/feedback/${feedbackId}`;
      logger.warn('Feedback not found:', { feedbackId });
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Feedback not found.'
      });
    }

    const redirectUrl = `${getBaseUrl()}/dashboard/feedback/${feedbackId}`;
    logger.info('Retrieved feedback by ID:', { feedbackId });
    return sendResponse(req, res, redirectUrl, {
      success: true,
      feedback
    });
  } catch (error) {
    logger.error('Error retrieving feedback:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/feedback/${req.params.feedbackId}`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'An error occurred. Please try again later.',
      error: error.message
    });
  }
};

exports.updateFeedback = async (req, res) => {
  try {
    const feedbackId = req.params.feedbackId;
    const { feedbackText } = req.body;

    if (!feedbackText) {
      const redirectUrl = `${getBaseUrl()}/dashboard/feedback/${feedbackId}/edit`;
      logger.warn('No fields to update:', { feedbackId });
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'No fields to update.'
      });
    }

    const updatedFeedback = await Feedback.findByIdAndUpdate(
      feedbackId,
      { feedbackText },
      { new: true, runValidators: true }
    );

    if (!updatedFeedback) {
      const redirectUrl = `${getBaseUrl()}/dashboard/feedback/${feedbackId}/edit`;
      logger.warn('Feedback not found for update:', { feedbackId });
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Feedback not found.'
      });
    }

    const redirectUrl = `${getBaseUrl()}/dashboard/feedback/${feedbackId}`;
    logger.info('Feedback updated successfully:', { feedbackId });
    return sendResponse(req, res, redirectUrl, {
      success: true,
      feedback: updatedFeedback
    });
  } catch (error) {
    logger.error('Error updating feedback:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/feedback/${req.params.feedbackId}/edit`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'An error occurred. Please try again later.',
      error: error.message
    });
  }
};

exports.deleteFeedback = async (req, res) => {
  try {
    const feedbackId = req.params.feedbackId;
    const deletedFeedback = await Feedback.findByIdAndDelete(feedbackId);

    if (!deletedFeedback) {
      const redirectUrl = `${getBaseUrl()}/dashboard/feedback`;
      logger.warn('Feedback not found for deletion:', { feedbackId });
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Feedback not found.'
      });
    }

    const redirectUrl = `${getBaseUrl()}/dashboard/feedback`;
    logger.info('Feedback deleted successfully:', { feedbackId });
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Feedback deleted successfully.'
    });
  } catch (error) {
    logger.error('Error deleting feedback:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/feedback`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'An error occurred. Please try again later.',
      error: error.message
    });
  }
};
