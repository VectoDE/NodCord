require('dotenv').config();
const getBaseUrl = require('../helpers/getBaseUrlHelper');
const sendResponse = require('../helpers/sendResponseHelper');
const logger = require('../services/loggerService');
const Dislike = require('../../models/dislikeModel');

exports.createDislike = async (req, res) => {
  try {
    const { user, blog } = req.body;

    if (!user || !blog) {
      const redirectUrl = `${getBaseUrl()}/dashboard/dislikes/create`;
      logger.warn('User and blog are required fields:', { user, blog });
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'User and blog are required fields',
      });
    }

    const newDislike = new Dislike({
      user,
      blog,
    });

    const savedDislike = await newDislike.save();

    const redirectUrl = `${getBaseUrl()}/dashboard/dislikes`;
    logger.info('Dislike created successfully:', { user, blog });
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Dislike created successfully',
      dislike: savedDislike,
    });
  } catch (error) {
    logger.error('Error creating dislike:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/dislikes/create`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Error creating dislike',
      error: error.message,
    });
  }
};

exports.getDislikesByBlog = async (req, res) => {
  const { blogId } = req.params;

  if (!blogId) {
    const redirectUrl = `${getBaseUrl()}/dashboard/dislikes`;
    logger.warn('Blog ID is required');
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Blog ID is required',
    });
  }

  try {
    const dislikes = await Dislike.find({ blog: blogId })
      .populate('user', 'name')
      .populate('blog', 'title');

    const redirectUrl = `${getBaseUrl()}/dashboard/dislikes`;
    logger.info('Retrieved dislikes for blog:', { blogId });
    return sendResponse(req, res, redirectUrl, {
      success: true,
      dislikes,
    });
  } catch (error) {
    logger.error('Error fetching dislikes:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/dislikes`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Error fetching dislikes',
      error: error.message,
    });
  }
};

exports.getDislikeById = async (req, res) => {
  const { dislikeId } = req.params;

  if (!dislikeId) {
    const redirectUrl = `${getBaseUrl()}/dashboard/dislikes`;
    logger.warn('Dislike ID is required');
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Dislike ID is required',
    });
  }

  try {
    const dislike = await Dislike.findById(dislikeId)
      .populate('user', 'name')
      .populate('blog', 'title');

    if (!dislike) {
      const redirectUrl = `${getBaseUrl()}/dashboard/dislikes`;
      logger.warn('Dislike not found:', { dislikeId });
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Dislike not found',
      });
    }

    const redirectUrl = `${getBaseUrl()}/dashboard/dislikes`;
    logger.info('Dislike retrieved:', { dislikeId });
    return sendResponse(req, res, redirectUrl, {
      success: true,
      dislike,
    });
  } catch (error) {
    logger.error('Error fetching dislike:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/dislikes`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Error fetching dislike',
      error: error.message,
    });
  }
};

exports.deleteDislike = async (req, res) => {
  const { dislikeId } = req.params;

  if (!dislikeId) {
    const redirectUrl = `${getBaseUrl()}/dashboard/dislikes`;
    logger.warn('Dislike ID is required');
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Dislike ID is required',
    });
  }

  try {
    const deletedDislike = await Dislike.findByIdAndDelete(dislikeId);

    if (!deletedDislike) {
      const redirectUrl = `${getBaseUrl()}/dashboard/dislikes`;
      logger.warn('Dislike not found:', { dislikeId });
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Dislike not found',
      });
    }

    const redirectUrl = `${getBaseUrl()}/dashboard/dislikes`;
    logger.info('Dislike deleted successfully:', { dislikeId });
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Dislike deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting dislike:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/dislikes`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Error deleting dislike',
      error: error.message,
    });
  }
};
