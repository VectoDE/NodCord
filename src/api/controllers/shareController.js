const Share = require('../../models/shareModel');
const logger = require('../services/loggerService');

exports.createShare = async (req, res) => {
  try {
    const { user, blog, platform } = req.body;

    logger.info('Creating a new share:', { user, blog, platform });

    const newShare = new Share({
      user,
      blog,
      platform,
    });

    const savedShare = await newShare.save();

    logger.info('Share created successfully:', { share: savedShare });

    res.status(201).json({
      message: 'Share created successfully',
      share: savedShare,
    });
  } catch (error) {
    logger.error('Error creating share:', { error });
    res.status(500).json({
      message: 'Error creating share',
      error,
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

    res.status(200).json({
      shares,
    });
  } catch (error) {
    logger.error('Error fetching shares:', { blogId, error });
    res.status(500).json({
      message: 'Error fetching shares',
      error,
    });
  }
};

exports.getShareById = async (req, res) => {
  try {
    const { id } = req.params;

    logger.info('Fetching share by ID:', { id });

    const share = await Share.findById(id)
      .populate('user', 'name')
      .populate('blog', 'title');

    if (!share) {
      logger.warn('Share not found for ID:', { id });
      return res.status(404).json({
        message: 'Share not found',
      });
    }

    logger.info('Share fetched successfully:', { share });

    res.status(200).json({
      share,
    });
  } catch (error) {
    logger.error('Error fetching share:', { id, error });
    res.status(500).json({
      message: 'Error fetching share',
      error,
    });
  }
};

exports.deleteShare = async (req, res) => {
  try {
    const { id } = req.params;

    logger.info('Deleting share by ID:', { id });

    const deletedShare = await Share.findByIdAndDelete(id);

    if (!deletedShare) {
      logger.warn('Share not found for ID:', { id });
      return res.status(404).json({
        message: 'Share not found',
      });
    }

    logger.info('Share deleted successfully:', { id });

    res.status(200).json({
      message: 'Share deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting share:', { id, error });
    res.status(500).json({
      message: 'Error deleting share',
      error,
    });
  }
};
