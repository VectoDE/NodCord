const Game = require('../../models/gameModel');
const logger = require('../services/loggerService');

exports.getAllGames = async (req, res) => {
  try {
    const games = await Game.find();
    res.status(200).json({ success: true, data: games });
  } catch (err) {
    logger.error('Error fetching all games:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

exports.getGameById = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res
        .status(404)
        .json({ success: false, message: 'Game not found' });
    }
    res.status(200).json({ success: true, data: game });
  } catch (err) {
    logger.error(`Error fetching game with ID ${req.params.id}:`, err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

exports.createGame = async (req, res) => {
  try {
    const game = new Game(req.body);
    await game.save();
    res.status(201).json({ success: true, data: game });
  } catch (err) {
    logger.error('Error creating new game:', err);
    res
      .status(400)
      .json({ success: false, message: 'Bad Request: Invalid data' });
  }
};

exports.updateGame = async (req, res) => {
  try {
    const game = await Game.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!game) {
      return res
        .status(404)
        .json({ success: false, message: 'Game not found' });
    }
    res.status(200).json({ success: true, data: game });
  } catch (err) {
    logger.error(`Error updating game with ID ${req.params.id}:`, err);
    res
      .status(400)
      .json({ success: false, message: 'Bad Request: Invalid data' });
  }
};

exports.deleteGame = async (req, res) => {
  try {
    const game = await Game.findByIdAndDelete(req.params.id);
    if (!game) {
      return res
        .status(404)
        .json({ success: false, message: 'Game not found' });
    }
    res
      .status(200)
      .json({ success: true, message: 'Game deleted successfully' });
  } catch (err) {
    logger.error(`Error deleting game with ID ${req.params.id}:`, err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
