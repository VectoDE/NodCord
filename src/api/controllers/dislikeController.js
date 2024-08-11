const Dislike = require('../../models/dislikeModel');
const logger = require('../services/loggerService');

exports.createDislike = async (req, res) => {
  try {
    const { user, blog } = req.body;

    if (!user || !blog) {
      return res.status(400).json({
        success: false,
        message: 'User and blog are required fields',
      });
    }

    const newDislike = new Dislike({
      user,
      blog,
    });

    const savedDislike = await newDislike.save();

    res.status(201).json({
      success: true,
      message: 'Dislike created successfully',
      dislike: savedDislike,
    });
  } catch (error) {
    logger.error('Error creating dislike:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating dislike',
      error: error.message,
    });
  }
};

exports.getDislikesByBlog = async (req, res) => {
  const { blogId } = req.params;

  if (!blogId) {
    return res.status(400).json({
      success: false,
      message: 'Blog ID is required',
    });
  }

  try {
    const dislikes = await Dislike.find({ blog: blogId })
      .populate('user', 'name')
      .populate('blog', 'title');

    res.status(200).json({
      success: true,
      dislikes,
    });
  } catch (error) {
    logger.error('Error fetching dislikes:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dislikes',
      error: error.message,
    });
  }
};

exports.getDislikeById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'Dislike ID is required',
    });
  }

  try {
    const dislike = await Dislike.findById(id)
      .populate('user', 'name')
      .populate('blog', 'title');

    if (!dislike) {
      return res.status(404).json({
        success: false,
        message: 'Dislike not found',
      });
    }

    res.status(200).json({
      success: true,
      dislike,
    });
  } catch (error) {
    logger.error('Error fetching dislike:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dislike',
      error: error.message,
    });
  }
};

exports.deleteDislike = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'Dislike ID is required',
    });
  }

  try {
    const deletedDislike = await Dislike.findByIdAndDelete(id);

    if (!deletedDislike) {
      return res.status(404).json({
        success: false,
        message: 'Dislike not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Dislike deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting dislike:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting dislike',
      error: error.message,
    });
  }
};
