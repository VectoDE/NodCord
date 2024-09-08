require('dotenv').config();
const Game = require('../../models/gameModel');
const logger = require('../services/loggerService');
const getBaseUrl = require('../helpers/getBaseUrlHelper');
const sendResponse = require('../helpers/sendResponseHelper');

exports.getAllGames = async (req, res) => {
  try {
    const games = await Game.find();
    logger.info('Fetched all games:', { count: games.length });
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/games`, {
      success: true,
      data: games
    });
  } catch (err) {
    logger.error('Error fetching all games:', err);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/games`, {
      success: false,
      message: 'Internal Server Error',
      error: err.message
    });
  }
};

exports.getGameById = async (req, res) => {
  const { gameId } = req.params;

  try {
    const game = await Game.findById(gameId);
    if (!game) {
      logger.warn('Game not found:', { gameId });
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/games`, {
        success: false,
        message: 'Game not found'
      });
    }
    logger.info('Fetched game details:', { gameId });
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/games/${gameId}`, {
      success: true,
      data: game
    });
  } catch (err) {
    logger.error(`Error fetching game with ID ${gameId}:`, err);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/games/${gameId}`, {
      success: false,
      message: 'Internal Server Error',
      error: err.message
    });
  }
};

exports.createGame = async (req, res) => {
  try {
    const game = new Game(req.body);
    await game.save();
    logger.info('Game created successfully:', { gameId: game._id });
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/games`, {
      success: true,
      data: game
    });
  } catch (err) {
    logger.error('Error creating new game:', err);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/games/create`, {
      success: false,
      message: 'Bad Request: Invalid data',
      error: err.message
    });
  }
};

exports.updateGame = async (req, res) => {
  const { gameId } = req.params;

  try {
    const game = await Game.findByIdAndUpdate(gameId, req.body, {
      new: true,
      runValidators: true,
    });
    if (!game) {
      logger.warn('Game not found for update:', { gameId });
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/games`, {
        success: false,
        message: 'Game not found'
      });
    }
    logger.info('Game updated successfully:', { gameId });
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/games`, {
      success: true,
      data: game
    });
  } catch (err) {
    logger.error(`Error updating game with ID ${gameId}:`, err);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/games/${gameId}/edit`, {
      success: false,
      message: 'Bad Request: Invalid data',
      error: err.message
    });
  }
};

exports.deleteGame = async (req, res) => {
  const { gameId } = req.params;

  try {
    const game = await Game.findByIdAndDelete(gameId);
    if (!game) {
      logger.warn('Game not found for deletion:', { gameId });
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/games`, {
        success: false,
        message: 'Game not found'
      });
    }
    logger.info('Game deleted successfully:', { gameId });
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/games`, {
      success: true,
      message: 'Game deleted successfully'
    });
  } catch (err) {
    logger.error(`Error deleting game with ID ${gameId}:`, err);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/games`, {
      success: false,
      message: 'Internal Server Error',
      error: err.message
    });
  }
};
