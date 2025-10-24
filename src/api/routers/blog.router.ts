const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');

router.get('/', blogController.getAllBlogs);

router.get('/:blogId', blogController.getBlogById);

router.post('/create', blogController.createBlog);

router.post('/:blogId/update', blogController.updateBlog);

router.post('/:blogId/delete', blogController.deleteBlog);

module.exports = router;
