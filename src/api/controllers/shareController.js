const Share = require('../../models/shareModel');

exports.createShare = async (req, res) => {
  try {
    const { user, blog, platform } = req.body;

    const newShare = new Share({
      user,
      blog,
      platform
    });

    const savedShare = await newShare.save();

    res.status(201).json({
      message: 'Share created successfully',
      share: savedShare
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating share',
      error
    });
  }
};

exports.getSharesByBlog = async (req, res) => {
  try {
    const { blogId } = req.params;

    const shares = await Share.find({ blog: blogId }).populate('user', 'name').populate('blog', 'title');

    res.status(200).json({
      shares
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching shares',
      error
    });
  }
};

exports.getShareById = async (req, res) => {
  try {
    const { id } = req.params;

    const share = await Share.findById(id).populate('user', 'name').populate('blog', 'title');

    if (!share) {
      return res.status(404).json({
        message: 'Share not found'
      });
    }

    res.status(200).json({
      share
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching share',
      error
    });
  }
};

exports.deleteShare = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedShare = await Share.findByIdAndDelete(id);

    if (!deletedShare) {
      return res.status(404).json({
        message: 'Share not found'
      });
    }

    res.status(200).json({
      message: 'Share deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting share',
      error
    });
  }
};
