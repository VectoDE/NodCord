const Comment = require('../../models/commentModel');

exports.createComment = async (req, res) => {
  try {
    const { content, author, blog } = req.body;

    const newComment = new Comment({
      content,
      author,
      blog,
    });

    const savedComment = await newComment.save();

    res.status(201).json({
      message: 'Comment created successfully',
      comment: savedComment,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating comment',
      error,
    });
  }
};

exports.getCommentsByBlog = async (req, res) => {
  try {
    const { blogId } = req.params;

    const comments = await Comment.find({ blog: blogId })
      .populate('author', 'name')
      .populate('blog', 'title');

    res.status(200).json({
      comments,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching comments',
      error,
    });
  }
};

exports.getCommentById = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id)
      .populate('author', 'name')
      .populate('blog', 'title');

    if (!comment) {
      return res.status(404).json({
        message: 'Comment not found',
      });
    }

    res.status(200).json({
      comment,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching comment',
      error,
    });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      { content },
      { new: true }
    );

    if (!updatedComment) {
      return res.status(404).json({
        message: 'Comment not found',
      });
    }

    res.status(200).json({
      message: 'Comment updated successfully',
      comment: updatedComment,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating comment',
      error,
    });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedComment = await Comment.findByIdAndDelete(id);

    if (!deletedComment) {
      return res.status(404).json({
        message: 'Comment not found',
      });
    }

    res.status(200).json({
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting comment',
      error,
    });
  }
};
