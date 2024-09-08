const Share = require('../../models/shareModel');
const logger = require('../services/loggerService');
const getBaseUrl = require('../helpers/getBaseUrlHelper');
const sendResponse = require('../helpers/sendResponseHelper');

exports.createShare = async (req, res) => {
  try {
    const { user, blog, platform } = req.body;

    logger.info('Creating a new share:', { user, blog, platform });

    const newShare = new Share({ user, blog, platform });
    const savedShare = await newShare.save();

    logger.info('Share created successfully:', { shareId: savedShare._id });

    return sendResponse(req, res, `${getBaseUrl()}/dashboard/shares`, {
      success: true,
      message: 'Share created successfully.',
      share: savedShare
    });
  } catch (error) {
    logger.error('Error creating share:', error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/shares/create`, {
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

exports.getSharesByBlog = async (req, res) => {
  try {
    const { blogId } = req.params;

    logger.info('Fetching shares for blog ID:', { blogId });

    const shares = await Share.find({ blog: blogId })
      .populate('user', 'name')
      .populate('blog', 'title');

    logger.info('Shares fetched successfully for blog ID:', { blogId, shares });

    return sendResponse(req, res, `${getBaseUrl()}/dashboard/shares`, {
      success: true,
      data: shares
    });
  } catch (error) {
    logger.error('Error fetching shares:', { blogId, error });
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/shares`, {
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

exports.getShareById = async (req, res) => {
  const { shareId } = req.params;

  try {
    logger.info('Fetching share by ID:', { shareId });

    const share = await Share.findById(shareId)
      .populate('user', 'name')
      .populate('blog', 'title');

    if (!share) {
      logger.warn('Share not found for ID:', { shareId });
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/shares/${shareId}`, {
        success: false,
        message: 'Share not found.'
      });
    }

    logger.info('Share fetched successfully:', { share });

    return sendResponse(req, res, `${getBaseUrl()}/dashboard/shares/${shareId}`, {
      success: true,
      data: share
    });
  } catch (error) {
    logger.error('Error fetching share:', { shareId, error });
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/shares/${shareId}`, {
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

exports.deleteShare = async (req, res) => {
  const { shareId } = req.params;

  try {
    logger.info('Deleting share by ID:', { shareId });

    const deletedShare = await Share.findByIdAndDelete(shareId);

    if (!deletedShare) {
      logger.warn('Share not found for ID:', { shareId });
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/shares`, {
        success: false,
        message: 'Share not found.'
      });
    }

    logger.info('Share deleted successfully:', { shareId });

    return sendResponse(req, res, `${getBaseUrl()}/dashboard/shares`, {
      success: true,
      message: 'Share deleted successfully.'
    });
  } catch (error) {
    logger.error('Error deleting share:', { shareId, error });
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/shares`, {
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};
