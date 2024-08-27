const Blog = require('../../models/blogModel');

async function getAllPosts() {
  try {
    return await Blog.find().sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    throw new Error('Unable to fetch blog posts');
  }
}

async function getPostById(id) {
  try {
    return await Blog.findById(id);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    throw new Error('Unable to fetch blog post');
  }
}

module.exports = {
  getAllPosts,
  getPostById
};
