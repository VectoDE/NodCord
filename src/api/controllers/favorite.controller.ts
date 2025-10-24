require('dotenv').config();
const getBaseUrl = require('../helpers/getBaseUrlHelper');
const sendResponse = require('../helpers/sendResponseHelper');
const logger = require('../../services/logger.service');
const Favorite = require('../../models/favoriteModel');

exports.listFavorites = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      const redirectUrl = `${getBaseUrl()}/dashboard/favorites`;
      logger.warn('User ID is required');
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'User ID is required',
      });
    }

    const favorites = await Favorite.find({ userId });

    const redirectUrl = `${getBaseUrl()}/dashboard/favorites`;
    logger.info('Retrieved favorites for user:', { userId });
    return sendResponse(req, res, redirectUrl, {
      success: true,
      data: favorites,
    });
  } catch (error) {
    logger.error('Error listing favorites:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/favorites`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

exports.createFavorite = async (req, res) => {
  try {
    const { userId, type, itemId } = req.body;

    if (!userId || !type || !itemId) {
      const redirectUrl = `${getBaseUrl()}/dashboard/favorites/create`;
      logger.warn('User ID, Type, and Item ID are required:', { userId, type, itemId });
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'User ID, Type, and Item ID are required',
      });
    }

    const newFavorite = new Favorite({
      userId,
      type,
      itemId,
    });

    const savedFavorite = await newFavorite.save();

    const redirectUrl = `${getBaseUrl()}/dashboard/favorites`;
    logger.info('Favorite created successfully:', { userId, type, itemId });
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Favorite created successfully',
      data: savedFavorite,
    });
  } catch (error) {
    logger.error('Error creating favorite:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/favorites/create`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

exports.deleteFavorite = async (req, res) => {
  try {
    const { favoriteId } = req.body;

    if (!favoriteId) {
      const redirectUrl = `${getBaseUrl()}/dashboard/favorites/delete`;
      logger.warn('Favorite ID is required');
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Favorite ID is required',
      });
    }

    const favorite = await Favorite.findById(favoriteId);

    if (!favorite) {
      const redirectUrl = `${getBaseUrl()}/dashboard/favorites`;
      logger.warn('Favorite not found:', { favoriteId });
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Favorite not found',
      });
    }

    await favorite.remove();

    const redirectUrl = `${getBaseUrl()}/dashboard/favorites`;
    logger.info('Favorite removed successfully:', { favoriteId });
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Favorite removed successfully',
    });
  } catch (error) {
    logger.error('Error deleting favorite:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/favorites`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};
