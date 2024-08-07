const Favorite = require('../../models/favoriteModel');

const listFavorites = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const favorites = await Favorite.find({ userId });
    res.status(200).json(favorites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const createFavorite = async (req, res) => {
  try {
    const { userId, type, itemId } = req.body;
    if (!userId || !type || !itemId) {
      return res
        .status(400)
        .json({ error: 'User ID, Type, and Item ID are required' });
    }

    const newFavorite = new Favorite({
      userId,
      type,
      itemId,
    });

    await newFavorite.save();
    res.status(201).json(newFavorite);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const deleteFavorite = async (req, res) => {
  try {
    const { favoriteId } = req.body;
    if (!favoriteId) {
      return res.status(400).json({ error: 'Favorite ID is required' });
    }

    const favorite = await Favorite.findById(favoriteId);
    if (!favorite) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    await favorite.remove();
    res.status(200).json({ message: 'Favorite removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  listFavorites,
  createFavorite,
  deleteFavorite,
};
