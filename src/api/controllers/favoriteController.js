const Favorite = require('../../models/favoriteModel');
const logger = require('../services/loggerService');

const listFavorites = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const favorites = await Favorite.find({ userId });

    res.status(200).json({
      success: true,
      data: favorites,
    });
  } catch (error) {
    logger.error('Error listing favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

const createFavorite = async (req, res) => {
  try {
    const { userId, type, itemId } = req.body;

    if (!userId || !type || !itemId) {
      return res.status(400).json({
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

    res.status(201).json({
      success: true,
      message: 'Favorite created successfully',
      data: savedFavorite,
    });
  } catch (error) {
    logger.error('Error creating favorite:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

const deleteFavorite = async (req, res) => {
  try {
    const { favoriteId } = req.body;

    if (!favoriteId) {
      return res.status(400).json({
        success: false,
        message: 'Favorite ID is required',
      });
    }

    const favorite = await Favorite.findById(favoriteId);

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found',
      });
    }

    await favorite.remove();

    res.status(200).json({
      success: true,
      message: 'Favorite removed successfully',
    });
  } catch (error) {
    logger.error('Error deleting favorite:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

module.exports = {
  listFavorites,
  createFavorite,
  deleteFavorite,
};
