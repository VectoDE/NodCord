require('dotenv').config();
const Blog = require('../../models/blogModel');
const getBaseUrl = require('../helpers/getBaseUrlHelper');
const sendResponse = require('../helpers/sendResponseHelper');
const logger = require('../services/loggerService');

exports.createBlog = async (req, res) => {
  try {
    const { title, content, author, tags } = req.body;

    if (!title || !content || !author) {
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/blogs/create`, {
        success: false,
        message: 'Title, content, and author are required'
      });
    }

    const newBlog = new Blog({ title, content, author, tags });
    const savedBlog = await newBlog.save();

    logger.info('Blog created successfully:', { blogId: savedBlog._id });
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/blogs`, {
      success: true,
      message: 'Blog created successfully',
      blog: savedBlog
    });
  } catch (error) {
    logger.error('Error creating blog:', error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/blogs/create`, {
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find();

    logger.info('Fetched all blogs:', { count: blogs.length });
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/blogs`, {
      success: true,
      blogs
    });
  } catch (error) {
    logger.error('Error fetching blogs:', error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/blogs`, {
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

exports.getBlogById = async (req, res) => {
  const { blogId } = req.params;

  try {
    const blog = await Blog.findById(blogId);
    if (!blog) {
      logger.warn('Blog not found:', { blogId });
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/blogs`, {
        success: false,
        message: 'Blog not found'
      });
    }

    logger.info('Blog fetched by ID:', { blogId });
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/blogs/${blogId}`, {
      success: true,
      blog
    });
  } catch (error) {
    logger.error(`Error fetching blog with ID ${blogId}:`, error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/blogs`, {
      success: false,
      message: 'Failed to fetch blog',
      error: error.message
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
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/blogs`, {
        success: false,
        message: 'Blog not found'
      });
    }

    logger.info('Blog updated successfully:', { blogId });
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/blogs`, {
      success: true,
      message: 'Blog updated successfully',
      blog: updatedBlog
    });
  } catch (error) {
    logger.error(`Error updating blog with ID ${blogId}:`, error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/blogs/edit/${blogId}`, {
      success: false,
      message: 'Failed to update blog',
      error: error.message
    });
  }
};

exports.deleteBlog = async (req, res) => {
  const { blogId } = req.params;

  try {
    const deletedBlog = await Blog.findByIdAndDelete(blogId);

    if (!deletedBlog) {
      logger.warn('Blog not found for deletion:', { blogId });
      return sendResponse(req, res, `${getBaseUrl()}/dashboard/blogs`, {
        success: false,
        message: 'Blog not found'
      });
    }

    logger.info('Blog deleted successfully:', { blogId });
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/blogs`, {
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting blog with ID ${blogId}:`, error);
    return sendResponse(req, res, `${getBaseUrl()}/dashboard/blogs`, {
      success: false,
      message: 'Failed to delete blog',
      error: error.message
    });
  }
};
