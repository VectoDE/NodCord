const Like = require('../../models/likeModel');

// Erstelle einen neuen Like
exports.createLike = async (req, res) => {
  try {
    const { user, blog } = req.body;

    const newLike = new Like({
      user,
      blog
    });

    const savedLike = await newLike.save();

    res.status(201).json({
      message: 'Like created successfully',
      like: savedLike
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating like',
      error
    });
  }
};

// Hole alle Likes für ein bestimmtes Blog
exports.getLikesByBlog = async (req, res) => {
  try {
    const { blogId } = req.params;

    const likes = await Like.find({ blog: blogId }).populate('user', 'name').populate('blog', 'title');

    res.status(200).json({
      likes
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching likes',
      error
    });
  }
};

// Hole einen Like nach ID
exports.getLikeById = async (req, res) => {
  try {
    const { id } = req.params;

    const like = await Like.findById(id).populate('user', 'name').populate('blog', 'title');

    if (!like) {
      return res.status(404).json({
        message: 'Like not found'
      });
    }

    res.status(200).json({
      like
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching like',
      error
    });
  }
};

// Lösche einen Like
exports.deleteLike = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedLike = await Like.findByIdAndDelete(id);

    if (!deletedLike) {
      return res.status(404).json({
        message: 'Like not found'
      });
    }

    res.status(200).json({
      message: 'Like deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting like',
      error
    });
  }
};
