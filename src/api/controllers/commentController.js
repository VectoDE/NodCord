require('dotenv').config();
const getBaseUrl = require('../helpers/getBaseUrlHelper');
const sendResponse = require('../helpers/sendResponseHelper');
const logger = require('../services/loggerService');
const Comment = require('../../models/commentModel');

exports.createComment = async (req, res) => {
  try {
    const { content, author, blog } = req.body;

    if (!content || !author || !blog) {
      const redirectUrl = `${getBaseUrl()}/dashboard/comments/create`;
      logger.warn('Missing required fields during comment creation:', { content, author, blog });
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Content, author, and blog are required'
      });
    }

    const newComment = new Comment({ content, author, blog });
    const savedComment = await newComment.save();

    logger.info('Comment created successfully:', { commentId: savedComment._id });
    const redirectUrl = `${getBaseUrl()}/dashboard/comments`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Comment created successfully',
      comment: savedComment
    });
  } catch (err) {
    logger.error('Error creating comment:', err);
    const redirectUrl = `${getBaseUrl()}/dashboard/comments/create`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Failed to create comment',
      error: err.message
    });
  }
};

exports.getCommentsByBlog = async (req, res) => {
  try {
    const { blogId } = req.params;

    if (!blogId) {
      const redirectUrl = `${getBaseUrl()}/dashboard/comments`;
      logger.warn('Blog ID is required for fetching comments:', { blogId });
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Blog ID is required'
      });
    }

    const comments = await Comment.find({ blog: blogId })
      .populate('author', 'name')
      .populate('blog', 'title');

    logger.info('Fetched comments by blog ID:', { blogId, count: comments.length });
    const redirectUrl = `${getBaseUrl()}/dashboard/comments`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      comments
    });
  } catch (err) {
    logger.error('Error fetching comments:', err);
    const redirectUrl = `${getBaseUrl()}/dashboard/comments`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Failed to fetch comments',
      error: err.message
    });
  }
};

exports.getCommentById = async (req, res) => {
  try {
    const { commentId } = req.params;

    if (!commentId) {
      const redirectUrl = `${getBaseUrl()}/dashboard/comments`;
      logger.warn('Comment ID is required for fetching comment:', { commentId });
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Comment ID is required'
      });
    }

    const comment = await Comment.findById(commentId)
      .populate('author', 'name')
      .populate('blog', 'title');

    if (!comment) {
      const redirectUrl = `${getBaseUrl()}/dashboard/comments`;
      logger.warn('Comment not found by ID:', { commentId });
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Comment not found'
      });
    }

    logger.info('Fetched comment by ID:', { commentId });
    const redirectUrl = `${getBaseUrl()}/dashboard/comments/editComment`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      comment
    });
  } catch (err) {
    logger.error('Error fetching comment by ID:', err);
    const redirectUrl = `${getBaseUrl()}/dashboard/comments`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Failed to fetch comment',
      error: err.message
    });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!commentId) {
      const redirectUrl = `${getBaseUrl()}/dashboard/comments`;
      logger.warn('Comment ID is required for updating comment:', { commentId });
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Comment ID is required'
      });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { content },
      { new: true, runValidators: true }
    );

    if (!updatedComment) {
      const redirectUrl = `${getBaseUrl()}/dashboard/comments`;
      logger.warn('Comment not found for update:', { commentId });
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Comment not found'
      });
    }

    logger.info('Comment updated successfully:', { commentId });
    const redirectUrl = `${getBaseUrl()}/dashboard/comments`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Comment updated successfully',
      comment: updatedComment
    });
  } catch (err) {
    logger.error('Error updating comment:', err);
    const redirectUrl = `${getBaseUrl()}/dashboard/comments/editComment`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Failed to update comment',
      error: err.message
    });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    if (!commentId) {
      const redirectUrl = `${getBaseUrl()}/dashboard/comments`;
      logger.warn('Comment ID is required for deleting comment:', { commentId });
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Comment ID is required'
      });
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
      const redirectUrl = `${getBaseUrl()}/dashboard/comments`;
      logger.warn('Comment not found for deletion:', { commentId });
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Comment not found'
      });
    }

    logger.info('Comment deleted successfully:', { commentId });
    const redirectUrl = `${getBaseUrl()}/dashboard/comments`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (err) {
    logger.error('Error deleting comment:', err);
    const redirectUrl = `${getBaseUrl()}/dashboard/comments`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Failed to delete comment',
      error: err.message
    });
  }
};
