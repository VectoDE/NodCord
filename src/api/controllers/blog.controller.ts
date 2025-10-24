require('dotenv').config();
const Blog = require('../../models/blogModel');
const getBaseUrl = require('../helpers/getBaseUrlHelper');
const sendResponse = require('../helpers/sendResponseHelper');
const logger = require('../../services/logger.service');

exports.createBlog = async (req, res) => {
  try {
    const { title, content, author, tags } = req.body;

    if (!title || !content || !author) {
      const errorRedirectUrl = `${getBaseUrl()}/dashboard/blogs/create`;
      return sendResponse(req, res, errorRedirectUrl, {
        success: false,
        message: 'Title, content, and author are required'
      });
    }

    const blog = new Blog({ title, content, author, tags });
    const savedBlog = await blog.save();

    logger.info('Blog created successfully:', { blogId: savedBlog._id });
    const redirectUrl = `${getBaseUrl()}/dashboard/blogs`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Blog created successfully',
      blog: savedBlog
    });
  } catch (err) {
    logger.error('Error creating blog:', err);
    const errorRedirectUrl = `${getBaseUrl()}/dashboard/blogs/create`;
    return sendResponse(req, res, errorRedirectUrl, {
      success: false,
      message: 'Internal Server Error',
      error: err.message
    });
  }
};

exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find();
    logger.info('Fetched all blogs:', { count: blogs.length });

    const redirectUrl = `${getBaseUrl()}/dashboard/blogs`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      blogs
    });
  } catch (err) {
    logger.error('Error fetching blogs:', err);
    const errorRedirectUrl = `${getBaseUrl()}/dashboard/blogs`;
    return sendResponse(req, res, errorRedirectUrl, {
      success: false,
      message: 'Internal Server Error',
      error: err.message
    });
  }
};

exports.getBlogById = async (req, res) => {
  const { blogId } = req.params;

  try {
    const blog = await Blog.findById(blogId);
    if (!blog) {
      logger.warn('Blog not found:', { blogId });
      const notFoundRedirectUrl = `${getBaseUrl()}/dashboard/blogs`;
      return sendResponse(req, res, notFoundRedirectUrl, {
        success: false,
        message: 'Blog not found'
      });
    }

    logger.info('Blog fetched by ID:', { blogId });
    const redirectUrl = `${getBaseUrl()}/dashboard/blogs/${blogId}`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      blog
    });
  } catch (err) {
    logger.error(`Error fetching blog with ID ${blogId}:`, err);
    const errorRedirectUrl = `${getBaseUrl()}/dashboard/blogs`;
    return sendResponse(req, res, errorRedirectUrl, {
      success: false,
      message: 'Failed to fetch blog',
      error: err.message
    });
  }
};

exports.updateBlog = async (req, res) => {
  const { blogId } = req.params;
  const updateData = req.body;

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(blogId, updateData, {
      new: true,
      runValidators: true
    });

    if (!updatedBlog) {
      logger.warn('Blog not found for update:', { blogId });
      const notFoundRedirectUrl = `${getBaseUrl()}/dashboard/blogs`;
      return sendResponse(req, res, notFoundRedirectUrl, {
        success: false,
        message: 'Blog not found'
      });
    }

    logger.info('Blog updated successfully:', { blogId });
    const redirectUrl = `${getBaseUrl()}/dashboard/blogs`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Blog updated successfully',
      blog: updatedBlog
    });
  } catch (err) {
    logger.error(`Error updating blog with ID ${blogId}:`, err);
    const errorRedirectUrl = `${getBaseUrl()}/dashboard/blogs/edit/${blogId}`;
    return sendResponse(req, res, errorRedirectUrl, {
      success: false,
      message: 'Failed to update blog',
      error: err.message
    });
  }
};

exports.deleteBlog = async (req, res) => {
  const { blogId } = req.params;

  try {
    const deletedBlog = await Blog.findByIdAndDelete(blogId);

    if (!deletedBlog) {
      logger.warn('Blog not found for deletion:', { blogId });
      const notFoundRedirectUrl = `${getBaseUrl()}/dashboard/blogs`;
      return sendResponse(req, res, notFoundRedirectUrl, {
        success: false,
        message: 'Blog not found'
      });
    }

    logger.info('Blog deleted successfully:', { blogId });
    const redirectUrl = `${getBaseUrl()}/dashboard/blogs`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (err) {
    logger.error(`Error deleting blog with ID ${blogId}:`, err);
    const errorRedirectUrl = `${getBaseUrl()}/dashboard/blogs`;
    return sendResponse(req, res, errorRedirectUrl, {
      success: false,
      message: 'Failed to delete blog',
      error: err.message
    });
  }
};
