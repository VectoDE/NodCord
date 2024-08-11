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

const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.status(200).json(blogs);
  } catch (error) {
    logger.error('Error fetching blogs:', error);
    res.status(500).json({
      message: 'Internal Server Error',
      details: error.message,
    });
  }
};

const getBlogById = async (req, res) => {
  const { id } = req.params;

  try {
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        message: 'Blog not found',
      });
    }

    res.status(200).json(blog);
  } catch (error) {
    logger.error(`Error fetching blog with ID ${id}:`, error);
    res.status(500).json({
      message: 'Internal Server Error',
      details: error.message,
    });
  }
};

const updateBlog = async (req, res) => {
  const { id } = req.params;
  const { title, content, author, tags } = req.body;

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { title, content, author, tags },
      { new: true, runValidators: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({
        message: 'Blog not found',
      });
    }

    res.status(200).json({
      message: 'Blog updated successfully.',
      blog: updatedBlog,
    });
  } catch (error) {
    logger.error(`Error updating blog with ID ${id}:`, error);
    res.status(500).json({
      message: 'Internal Server Error',
      details: error.message,
    });
  }
};

const deleteBlog = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedBlog = await Blog.findByIdAndDelete(id);

    if (!deletedBlog) {
      return res.status(404).json({
        message: 'Blog not found',
      });
    }

    res.status(204).send();
  } catch (error) {
    logger.error(`Error deleting blog with ID ${id}:`, error);
    res.status(500).json({
      message: 'Internal Server Error',
      details: error.message,
    });
  }
};

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
};
