const Blog = require('../../models/blogModel');
const logger = require('../services/loggerService');

const createBlog = async (req, res) => {
  try {
    const { title, content, author, tags } = req.body;

    if (!title || !content || !author) {
      return res
        .status(400)
        .json({ error: 'Title, content, and author are required' });
    }

    const newBlog = new Blog({
      title,
      content,
      author,
      tags,
    });

    const savedBlog = await newBlog.save();
    res.status(201).json({
      message: 'Blog created successfully.',
      blog: savedBlog,
    });
  } catch (error) {
    logger.error('Error creating blog:', error);
    res.status(500).json({
      message: 'Internal Server Error',
      details: error.message,
    });
  }
};

const getAllBlogs = async () => {
  try {
    const blogs = await Blog.find();
    return blogs;
  } catch (error) {
    logger.error('Error fetching blogs:', error);
    throw new Error('Internal Server Error');
  }
};

const getBlogById = async (id) => {
  try {
    const blog = await Blog.findById(id);

    if (!blog) {
      throw new Error('Blog not found');
    }

    return blog;
  } catch (error) {
    logger.error(`Error fetching blog with ID ${id}:`, error);
    throw error;
  }
};

const updateBlog = async (id, data) => {
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    );

    if (!updatedBlog) {
      throw new Error('Blog not found');
    }

    return updatedBlog;
  } catch (error) {
    logger.error(`Error updating blog with ID ${id}:`, error);
    throw error;
  }
};

const deleteBlog = async (id) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(id);

    if (!deletedBlog) {
      throw new Error('Blog not found');
    }

    return deletedBlog;
  } catch (error) {
    logger.error(`Error deleting blog with ID ${id}:`, error);
    throw error;
  }
};

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
};
