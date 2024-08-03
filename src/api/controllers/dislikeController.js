const Dislike = require('../../models/dislikeModel');

// Erstelle einen neuen Dislike
exports.createDislike = async (req, res) => {
  try {
    const { user, blog } = req.body;

    const newDislike = new Dislike({
      user,
      blog
    });

    const savedDislike = await newDislike.save();

    res.status(201).json({
      message: 'Dislike created successfully',
      dislike: savedDislike
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating dislike',
      error
    });
  }
};

// Hole alle Dislikes für ein bestimmtes Blog
exports.getDislikesByBlog = async (req, res) => {
  try {
    const { blogId } = req.params;

    const dislikes = await Dislike.find({ blog: blogId }).populate('user', 'name').populate('blog', 'title');

    res.status(200).json({
      dislikes
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching dislikes',
      error
    });
  }
};

// Hole einen Dislike nach ID
exports.getDislikeById = async (req, res) => {
  try {
    const { id } = req.params;

    const dislike = await Dislike.findById(id).populate('user', 'name').populate('blog', 'title');

    if (!dislike) {
      return res.status(404).json({
        message: 'Dislike not found'
      });
    }

    res.status(200).json({
      dislike
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching dislike',
      error
    });
  }
};

// Lösche einen Dislike
exports.deleteDislike = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedDislike = await Dislike.findByIdAndDelete(id);

    if (!deletedDislike) {
      return res.status(404).json({
        message: 'Dislike not found'
      });
    }

    res.status(200).json({
      message: 'Dislike deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting dislike',
      error
    });
  }
};
