const Comment = require('../../models/commentModel');
const logger = require('../services/loggerService');

exports.createComment = async (req, res) => {
  try {
    const { content, author, blog } = req.body;

    if (!content || !author || !blog) {
      return res
        .status(400)
        .json({ error: 'Content, author, and blog are required' });
    }

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
    logger.error('Error creating comment:', error);
    res.status(500).json({
      message: 'Failed to create comment',
      error: error.message,
    });
  }
};

exports.getCommentsByBlog = async (req, res) => {
  try {
    const { blogId } = req.params;

    if (!blogId) {
      return res.status(400).json({ error: 'Blog ID is required' });
    }

    const comments = await Comment.find({ blog: blogId })
      .populate('author', 'name')
      .populate('blog', 'title');

    res.status(200).json({
      comments,
    });
  } catch (error) {
    logger.error('Error fetching comments:', error);
    res.status(500).json({
      message: 'Failed to fetch comments',
      error: error.message,
    });
  }
};

exports.getCommentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Comment ID is required' });
    }

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
    logger.error('Error fetching comment:', error);
    res.status(500).json({
      message: 'Failed to fetch comment',
      error: error.message,
    });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Comment ID is required' });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      { content },
      { new: true, runValidators: true }
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
    logger.error('Error updating comment:', error);
    res.status(500).json({
      message: 'Failed to update comment',
      error: error.message,
    });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Comment ID is required' });
    }

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
    logger.error('Error deleting comment:', error);
    res.status(500).json({
      message: 'Failed to delete comment',
      error: error.message,
    });
  }
};