const Like = require('../../models/likeModel');
const logger = require('../services/loggerService');

exports.createLike = async (req, res) => {
  try {
    const { user, blog } = req.body;

    if (!user || !blog) {
      return res
        .status(400)
        .json({ message: 'User and blog IDs are required' });
    }

    const newLike = new Like({ user, blog });
    const savedLike = await newLike.save();

    res.status(201).json({
      message: 'Like created successfully',
      like: savedLike,
    });
  } catch (error) {
    logger.error('Error creating like:', error);
    res.status(500).json({
      message: 'Error creating like',
      error: error.message,
    });
  }
};

exports.getLikesByBlog = async (req, res) => {
  try {
    const { blogId } = req.params;

    if (!blogId) {
      return res.status(400).json({ message: 'Blog ID is required' });
    }

    const likes = await Like.find({ blog: blogId })
      .populate('user', 'name')
      .populate('blog', 'title');

    res.status(200).json({ likes });
  } catch (error) {
    logger.error('Error fetching likes by blog:', error);
    res.status(500).json({
      message: 'Error fetching likes',
      error: error.message,
    });
  }
};

exports.getLikeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Like ID is required' });
    }

    const like = await Like.findById(id)
      .populate('user', 'name')
      .populate('blog', 'title');

    if (!like) {
      return res.status(404).json({ message: 'Like not found' });
    }

    res.status(200).json({ like });
  } catch (error) {
    logger.error(`Error fetching like with ID ${req.params.id}:`, error);
    res.status(500).json({
      message: 'Error fetching like',
      error: error.message,
    });
  }
};

exports.deleteLike = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Like ID is required' });
    }

    const deletedLike = await Like.findByIdAndDelete(id);

    if (!deletedLike) {
      return res.status(404).json({ message: 'Like not found' });
    }

    res.status(200).json({ message: 'Like deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting like with ID ${req.params.id}:`, error);
    res.status(500).json({
      message: 'Error deleting like',
      error: error.message,
    });
  }
};
